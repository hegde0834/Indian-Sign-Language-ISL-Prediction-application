"""Hand detection (MediaPipe Tasks HandLandmarker, 21 landmarks) + 3D/geometric features.

Per hand (105 features), computed from the model's metric 3D *world* landmarks:
  63  normalised 3D landmarks (wrist-centred, scaled by wrist->middle-MCP length)
   5  fingertip -> wrist distances
  10  pairwise fingertip distances
  15  finger joint bend angles (3 per finger)
   4  finger spread angles (between adjacent fingers)
   3  palm normal vector (hand orientation in 3D)
   5  fingertip -> palm-centre distances
Layout: [hand_left(105) | hand_right(105) | inter-hand(28)] = 238.
A single hand always fills slot 0; slot 1 is zeros. Hands are ordered by image x.
Inter-hand: wrist offset (3) + 5x5 fingertip cross distances (25), from image-space landmarks.
"""
import os
import urllib.request

import cv2
import numpy as np
import mediapipe as mp
from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision

import config

TIPS = [4, 8, 12, 16, 20]
MCPS = [1, 5, 9, 13, 17]
CHAINS = [[0, 1, 2, 3, 4], [0, 5, 6, 7, 8], [0, 9, 10, 11, 12],
          [0, 13, 14, 15, 16], [0, 17, 18, 19, 20]]
CONNECTIONS = [(0, 1), (1, 2), (2, 3), (3, 4), (0, 5), (5, 6), (6, 7), (7, 8), (5, 9), (9, 10),
               (10, 11), (11, 12), (9, 13), (13, 14), (14, 15), (15, 16), (13, 17), (17, 18),
               (18, 19), (19, 20), (0, 17)]
HAND_DIM = 105
INTER_DIM = 28
FEATURE_DIM = HAND_DIM * 2 + INTER_DIM  # 238
_TRIU = np.triu_indices(5, 1)


def _angle(a, b, c):
    v1, v2 = a - b, c - b
    cos = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2) + 1e-8)
    return float(np.arccos(np.clip(cos, -1.0, 1.0)))


def hand_features(pts):
    """pts: (21, 3) array -> (105,) feature vector."""
    p = pts - pts[0]
    p = p / (np.linalg.norm(p[9]) + 1e-8)
    tips = p[TIPS]

    coords = p.flatten()                                             # 63
    tip_wrist = np.linalg.norm(tips, axis=1)                         # 5
    d = np.linalg.norm(tips[:, None] - tips[None], axis=-1)
    tip_pairs = d[_TRIU]                                             # 10
    bends = [_angle(p[c[i - 1]], p[c[i]], p[c[i + 1]])               # 15
             for c in CHAINS for i in (1, 2, 3)]
    dirs = [p[t] - p[m] for t, m in zip(TIPS, MCPS)]
    zero = np.zeros(3)
    spread = [_angle(dirs[i], zero, dirs[i + 1]) for i in range(4)]  # 4
    normal = np.cross(p[5], p[17])
    normal = normal / (np.linalg.norm(normal) + 1e-8)                # 3
    center = p[[0, 5, 9, 13, 17]].mean(axis=0)
    tip_palm = np.linalg.norm(tips - center, axis=1)                 # 5

    return np.concatenate([coords, tip_wrist, tip_pairs, bends, spread, normal, tip_palm])


def extract_features(result, frame_shape):
    """HandLandmarkerResult -> (238,) float32 vector, or None if no hand."""
    if not result.hand_landmarks:
        return None
    h, w = frame_shape[:2]
    hands = []  # (image_pts, world_pts)
    for img_lm, world_lm in zip(result.hand_landmarks[:2], result.hand_world_landmarks[:2]):
        img = np.array([[l.x * w, l.y * h, l.z * w] for l in img_lm], dtype=np.float32)
        world = np.array([[l.x, l.y, l.z] for l in world_lm], dtype=np.float32)
        hands.append((img, world))
    hands.sort(key=lambda t: t[0][0, 0])

    f0 = hand_features(hands[0][1])
    f1 = np.zeros(HAND_DIM)
    inter = np.zeros(INTER_DIM)
    if len(hands) == 2:
        f1 = hand_features(hands[1][1])
        a, b = hands[0][0], hands[1][0]
        scale = np.linalg.norm(a[9] - a[0]) + 1e-8
        rel = (b[0] - a[0]) / scale
        cross = np.linalg.norm(a[TIPS][:, None] - b[TIPS][None], axis=-1) / scale
        inter = np.concatenate([rel, cross.flatten()])
    return np.concatenate([f0, f1, inter]).astype(np.float32)


def ensure_model():
    """Download hand_landmarker.task once if it isn't already in models/."""
    if not os.path.exists(config.HAND_MODEL_PATH):
        print("Downloading hand_landmarker.task ...")
        try:
            urllib.request.urlretrieve(config.HAND_MODEL_URL, config.HAND_MODEL_PATH)
        except Exception as e:
            raise SystemExit(
                f"Could not download the model ({e}).\nDownload it manually from\n  {config.HAND_MODEL_URL}\n"
                f"and save it as\n  {config.HAND_MODEL_PATH}")
    return config.HAND_MODEL_PATH


class HandTracker:
    """Wraps vision.HandLandmarker in VIDEO mode (tracking across frames)."""

    def __init__(self):
        options = vision.HandLandmarkerOptions(
            base_options=mp_python.BaseOptions(model_asset_path=ensure_model()),
            running_mode=vision.RunningMode.VIDEO,
            num_hands=2,
            min_hand_detection_confidence=0.6,
            min_hand_presence_confidence=0.5,
            min_tracking_confidence=0.5,
        )
        self.landmarker = vision.HandLandmarker.create_from_options(options)
        self._ts = 0

    def process(self, frame_bgr):
        rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
        self._ts += 33  # monotonically increasing timestamp (ms)
        result = self.landmarker.detect_for_video(mp_image, self._ts)
        return extract_features(result, frame_bgr.shape), result

    def close(self):
        self.landmarker.close()


def make_hands():
    return HandTracker()


def process_frame(hands, frame_bgr):
    """Returns (features or None, HandLandmarkerResult)."""
    return hands.process(frame_bgr)


def draw_hands(frame, result):
    h, w = frame.shape[:2]
    for lms in result.hand_landmarks:
        pts = [(int(l.x * w), int(l.y * h)) for l in lms]
        for a, b in CONNECTIONS:
            cv2.line(frame, pts[a], pts[b], (0, 255, 0), 2, cv2.LINE_AA)
        for p in pts:
            cv2.circle(frame, p, 4, (0, 0, 255), -1, cv2.LINE_AA)
