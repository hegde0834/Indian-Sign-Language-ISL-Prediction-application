import argparse
import csv
import os
import time

import cv2

import config
from features import FEATURE_DIM, make_hands, process_frame, draw_hands


def put(img, text, org, color=(255, 255, 255), scale=0.8):
    cv2.putText(img, text, org, cv2.FONT_HERSHEY_SIMPLEX, scale, (0, 0, 0), 4, cv2.LINE_AA)
    cv2.putText(img, text, org, cv2.FONT_HERSHEY_SIMPLEX, scale, color, 2, cv2.LINE_AA)


def save_rows(rows, label):
    new_file = not os.path.exists(config.DATASET_PATH)
    with open(config.DATASET_PATH, "a", newline="") as f:
        w = csv.writer(f)
        if new_file:
            w.writerow([f"f{i}" for i in range(FEATURE_DIM)] + ["label"])
        for r in rows:
            w.writerow(list(map(float, r)) + [label])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--labels", nargs="*", default=config.ALL_LABELS)
    ap.add_argument("--samples", type=int, default=300)
    ap.add_argument("--camera", type=int, default=0)
    args = ap.parse_args()

    cap = cv2.VideoCapture(args.camera)
    hands = make_hands()

    for label in args.labels:
        # ---- wait for the user ----
        skip = False
        while True:
            ok, frame = cap.read()
            if not ok:
                return
            frame = cv2.flip(frame, 1)
            feats, res = process_frame(hands, frame)
            draw_hands(frame, res)
            put(frame, f"Label: {label}", (20, 40), (0, 255, 255), 1.1)
            put(frame, "SPACE=record  N=skip  Q=quit", (20, 80))
            cv2.imshow("Collect", frame)
            k = cv2.waitKey(1) & 0xFF
            if k == ord(" "):
                break
            if k in (ord("n"), ord("N")):
                skip = True
                break
            if k in (ord("q"), ord("Q"), 27):
                cap.release(); cv2.destroyAllWindows(); return
        if skip:
            continue

        # ---- countdown ----
        t0 = time.time()
        while time.time() - t0 < 2:
            ok, frame = cap.read()
            frame = cv2.flip(frame, 1)
            put(frame, f"Get ready: {label}  {2 - int(time.time() - t0)}", (20, 40), (0, 165, 255), 1.1)
            cv2.imshow("Collect", frame)
            cv2.waitKey(1)

        # ---- record ----
        rows = []
        while len(rows) < args.samples:
            ok, frame = cap.read()
            if not ok:
                break
            frame = cv2.flip(frame, 1)
            feats, res = process_frame(hands, frame)
            draw_hands(frame, res)
            if feats is not None:
                rows.append(feats)
            put(frame, f"Recording {label}: {len(rows)}/{args.samples}", (20, 40), (0, 255, 0), 1.0)
            cv2.imshow("Collect", frame)
            if cv2.waitKey(1) & 0xFF in (ord("q"), 27):
                break
        save_rows(rows, label)
        print(f"Saved {len(rows)} samples for {label}")

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
