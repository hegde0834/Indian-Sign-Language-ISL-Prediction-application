"""
ISL Phrase Video Generator
Generates 10 high-definition, browser-compatible H.264 MP4 video clippings
and companion poster thumbnails for Indian Sign Language everyday phrases.
"""

import os
import math
import json
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import imageio

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "assets", "videos")
DATA_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "isl_phrases.json")

os.makedirs(OUTPUT_DIR, exist_ok=True)

WIDTH = 640
HEIGHT = 368
FPS = 30

# Colors
BG_TOP = (11, 17, 36)
BG_BOTTOM = (18, 29, 61)
CYAN_NEON = (0, 240, 255)
GREEN_NEON = (16, 185, 129)
PURPLE_NEON = (147, 51, 234)
ORANGE_NEON = (245, 158, 11)
TEXT_WHITE = (255, 255, 255)
TEXT_MUTED = (148, 163, 184)
CARD_BG = (14, 22, 48, 220)
BORDER_COLOR = (0, 240, 255, 90)

# Try loading standard system fonts
def get_font(size, bold=False):
    font_names = [
        "arialbd.ttf" if bold else "arial.ttf",
        "segoeuib.ttf" if bold else "segoeui.ttf",
        "DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf",
    ]
    for fn in font_names:
        try:
            return ImageFont.truetype(fn, size)
        except Exception:
            pass
    return ImageFont.load_default()

FONT_TITLE = get_font(22, bold=True)
FONT_SUB = get_font(13, bold=True)
FONT_BODY = get_font(12, bold=False)
FONT_BADGE = get_font(11, bold=True)

# Human Avatar Base Landmarks (Head, Shoulders, Chest)
HEAD_CENTER = (320, 95)
HEAD_RADIUS = 28
NECK_TOP = (320, 123)
NECK_BOTTOM = (320, 142)
SHOULDER_L = (245, 155)
SHOULDER_R = (395, 155)
CHEST_CENTER = (320, 195)
WAIST_CENTER = (320, 260)


def draw_background(draw, frame_idx, total_frames):
    """Draw gradient background with animated cyber grid and ambient particles."""
    # Vertical gradient
    for y in range(HEIGHT):
        ratio = y / HEIGHT
        r = int(BG_TOP[0] * (1 - ratio) + BG_BOTTOM[0] * ratio)
        g = int(BG_TOP[1] * (1 - ratio) + BG_BOTTOM[1] * ratio)
        b = int(BG_TOP[2] * (1 - ratio) + BG_BOTTOM[2] * ratio)
        draw.line([(0, y), (WIDTH, y)], fill=(r, g, b))

    # Subtle grid lines
    grid_alpha = 25
    for x in range(0, WIDTH, 40):
        draw.line([(x, 0), (x, HEIGHT)], fill=(0, 240, 255, grid_alpha), width=1)
    for y in range(0, HEIGHT, 40):
        draw.line([(0, y), (WIDTH, y)], fill=(0, 240, 255, grid_alpha), width=1)

    # Ambient glow circles
    glow_pulse = math.sin((frame_idx / total_frames) * math.pi * 2) * 15
    draw.ellipse([80 - glow_pulse, 60 - glow_pulse, 160 + glow_pulse, 140 + glow_pulse], fill=(120, 50, 220, 20))
    draw.ellipse([480 - glow_pulse, 70 - glow_pulse, 560 + glow_pulse, 150 + glow_pulse], fill=(0, 200, 240, 20))


def draw_avatar_torso(draw):
    """Draw stylized translucent signer body silhouette."""
    # Head & Neck
    draw.ellipse([HEAD_CENTER[0]-HEAD_RADIUS, HEAD_CENTER[1]-HEAD_RADIUS, 
                  HEAD_CENTER[0]+HEAD_RADIUS, HEAD_CENTER[1]+HEAD_RADIUS], 
                 fill=(25, 38, 75), outline=(0, 240, 255, 160), width=2)
    # Face outline / eyes / mouth suggestion
    draw.line([(HEAD_CENTER[0]-8, HEAD_CENTER[1]-2), (HEAD_CENTER[0]-4, HEAD_CENTER[1]-2)], fill=(0, 240, 255), width=2)
    draw.line([(HEAD_CENTER[0]+4, HEAD_CENTER[1]-2), (HEAD_CENTER[0]+8, HEAD_CENTER[1]-2)], fill=(0, 240, 255), width=2)
    draw.arc([HEAD_CENTER[0]-8, HEAD_CENTER[1]+4, HEAD_CENTER[0]+8, HEAD_CENTER[1]+14], start=0, end=180, fill=(0, 240, 255), width=2)

    # Neck
    draw.line([NECK_TOP, NECK_BOTTOM], fill=(0, 240, 255, 120), width=6)

    # Torso Polygon
    torso_pts = [SHOULDER_L, (SHOULDER_L[0]-15, 260), (SHOULDER_R[0]+15, 260), SHOULDER_R]
    draw.polygon(torso_pts, fill=(18, 28, 58), outline=(0, 240, 255, 80))
    # Chest center line
    draw.line([NECK_BOTTOM, (CHEST_CENTER[0], 255)], fill=(0, 240, 255, 50), width=2)


def draw_mediapipe_hand(draw, wrist_pos, is_left=False, hand_pose="open", scale=1.0):
    """
    Renders an authentic 21-point MediaPipe hand landmark skeleton
    with connected neon bones and glowing joint nodes.
    """
    wx, wy = wrist_pos
    s = scale

    # Direction multiplier
    d = -1 if is_left else 1

    # Base palm nodes (0: Wrist, 1: Thumb CMC, 5: Index MCP, 9: Middle MCP, 13: Ring MCP, 17: Pinky MCP)
    cmc = (wx + 10 * d * s, wy - 8 * s)
    mcp_index = (wx + 12 * d * s, wy - 22 * s)
    mcp_mid = (wx + 4 * d * s, wy - 26 * s)
    mcp_ring = (wx - 4 * d * s, wy - 24 * s)
    mcp_pinky = (wx - 12 * d * s, wy - 20 * s)

    # Define fingertips based on pose
    if hand_pose == "namaste":
        # Flat vertical hands pressed together
        tip_thumb = (wx + 16 * d * s, wy - 22 * s)
        tip_index = (wx + 10 * d * s, wy - 42 * s)
        tip_mid = (wx + 2 * d * s, wy - 45 * s)
        tip_ring = (wx - 6 * d * s, wy - 40 * s)
        tip_pinky = (wx - 14 * d * s, wy - 34 * s)
    elif hand_pose == "thumbs_up":
        # Thumb pointing straight up, four fingers curled into a fist
        tip_thumb = (wx + 10 * d * s, wy - 35 * s)
        tip_index = (wx + 6 * d * s, wy - 14 * s)
        tip_mid = (wx + 2 * d * s, wy - 14 * s)
        tip_ring = (wx - 3 * d * s, wy - 13 * s)
        tip_pinky = (wx - 8 * d * s, wy - 11 * s)
    elif hand_pose == "point":
        # Index finger pointing, other fingers tucked
        tip_thumb = (wx + 8 * d * s, wy - 12 * s)
        tip_index = (wx + 18 * d * s, wy - 42 * s)
        tip_mid = (wx + 3 * d * s, wy - 15 * s)
        tip_ring = (wx - 4 * d * s, wy - 13 * s)
        tip_pinky = (wx - 10 * d * s, wy - 11 * s)
    elif hand_pose == "two_finger_tap":
        # Index and middle finger straight, ring and pinky closed
        tip_thumb = (wx + 6 * d * s, wy - 12 * s)
        tip_index = (wx + 12 * d * s, wy - 38 * s)
        tip_mid = (wx + 4 * d * s, wy - 38 * s)
        tip_ring = (wx - 4 * d * s, wy - 14 * s)
        tip_pinky = (wx - 10 * d * s, wy - 12 * s)
    elif hand_pose == "t_shape":
        # 'T' sign: thumb between index and middle
        tip_thumb = (wx + 2 * d * s, wy - 20 * s)
        tip_index = (wx + 8 * d * s, wy - 16 * s)
        tip_mid = (wx + 2 * d * s, wy - 15 * s)
        tip_ring = (wx - 5 * d * s, wy - 13 * s)
        tip_pinky = (wx - 10 * d * s, wy - 11 * s)
    else:  # "open" flat hand
        tip_thumb = (wx + 22 * d * s, wy - 18 * s)
        tip_index = (wx + 14 * d * s, wy - 40 * s)
        tip_mid = (wx + 4 * d * s, wy - 44 * s)
        tip_ring = (wx - 6 * d * s, wy - 40 * s)
        tip_pinky = (wx - 16 * d * s, wy - 32 * s)

    # Draw Bones (Glowing Cyan lines)
    bone_color = (0, 240, 255)
    # Palm contour
    draw.line([wrist_pos, cmc, mcp_index, mcp_mid, mcp_ring, mcp_pinky, wrist_pos], fill=bone_color, width=2)
    # Finger lines from MCP to Tip
    draw.line([cmc, tip_thumb], fill=bone_color, width=2)
    draw.line([mcp_index, tip_index], fill=bone_color, width=2)
    draw.line([mcp_mid, tip_mid], fill=bone_color, width=2)
    draw.line([mcp_ring, tip_ring], fill=bone_color, width=2)
    draw.line([mcp_pinky, tip_pinky], fill=bone_color, width=2)

    # Joint Nodes
    # Palm joints (Cyan nodes)
    for pt in [wrist_pos, cmc, mcp_index, mcp_mid, mcp_ring, mcp_pinky]:
        draw.ellipse([pt[0]-3, pt[1]-3, pt[0]+3, pt[1]+3], fill=(0, 240, 255))

    # Fingertips (Neon Green glowing nodes)
    for tip in [tip_thumb, tip_index, tip_mid, tip_ring, tip_pinky]:
        draw.ellipse([tip[0]-5, tip[1]-5, tip[0]+5, tip[1]+5], fill=(16, 185, 129), outline=(255, 255, 255), width=1)


def draw_motion_arrow(draw, start_pt, end_pt, color=(0, 240, 255), progress=1.0):
    """Draw smooth glowing curved motion trail with arrowhead."""
    cur_x = start_pt[0] + (end_pt[0] - start_pt[0]) * progress
    cur_y = start_pt[1] + (end_pt[1] - start_pt[1]) * progress

    # Motion dashed trail
    draw.line([start_pt, (cur_x, cur_y)], fill=color, width=3)

    # Arrowhead at current head
    angle = math.atan2(end_pt[1] - start_pt[1], end_pt[0] - start_pt[0])
    arrow_len = 10
    a1 = (cur_x - arrow_len * math.cos(angle - math.pi/6), cur_y - arrow_len * math.sin(angle - math.pi/6))
    a2 = (cur_x - arrow_len * math.cos(angle + math.pi/6), cur_y - arrow_len * math.sin(angle + math.pi/6))
    draw.polygon([(cur_x, cur_y), a1, a2], fill=color)


def get_pose_animation(phrase_id, t):
    """
    Computes keyframe positions for signer arms and hands based on phrase ID.
    t: normalized progress [0.0 to 1.0] across animation cycle.
    """
    # Smooth easing in-and-out sine wave
    ease = 0.5 - 0.5 * math.cos(t * math.pi * 2)

    # Default rest positions
    l_rest = (260, 225)
    r_rest = (380, 225)

    if phrase_id == 1:
        # Hello / Namaste: Hands start apart and converge to chest center into Namaste
        l_pos = (l_rest[0] + (310 - l_rest[0]) * ease, l_rest[1] + (185 - l_rest[1]) * ease)
        r_pos = (r_rest[0] + (330 - r_rest[0]) * ease, r_rest[1] + (185 - r_rest[1]) * ease)
        l_pose = "namaste" if ease > 0.4 else "open"
        r_pose = "namaste" if ease > 0.4 else "open"
        step_text = "Step: Bring both palms together at chest level in Namaste"
        phase = 1 if t < 0.35 else (2 if t < 0.75 else 3)
        arrow = (l_rest, (310, 185))

    elif phrase_id == 2:
        # Thank You: Dominant hand touches chin then glides forward & down
        l_pos = l_rest
        r_pos = (350 + 25 * ease, 125 + 50 * ease)
        l_pose = "open"
        r_pose = "open"
        step_text = "Step: Touch fingertips to chin, glide smoothly forward & downward"
        phase = 1 if t < 0.3 else (2 if t < 0.7 else 3)
        arrow = ((330, 125), (380, 185))

    elif phrase_id == 3:
        # How Are You?: Thumbs up rotate outward, then point forward
        l_pos = (280 - 15 * ease, 190 + 10 * ease)
        r_pos = (360 + 25 * ease, 190 - 20 * ease)
        l_pose = "thumbs_up" if t < 0.5 else "open"
        r_pose = "thumbs_up" if t < 0.5 else "point"
        step_text = "Step: Rotate thumbs-up outward, then point forward with questioning gaze"
        phase = 1 if t < 0.3 else (2 if t < 0.65 else 3)
        arrow = ((360, 190), (385, 170))

    elif phrase_id == 4:
        # I Am Fine: Point to chest, then strong thumbs up pushed forward
        l_pos = l_rest
        if t < 0.45:
            r_pos = (380 - 45 * (t / 0.45), 225 - 40 * (t / 0.45))
            r_pose = "point"
            step_text = "Step 1: Point index finger to chest ('I')"
            phase = 1
            arrow = (r_rest, (335, 185))
        else:
            prog = (t - 0.45) / 0.55
            r_pos = (335 + 40 * prog, 185 - 20 * prog)
            r_pose = "thumbs_up"
            step_text = "Step 2: Move thumbs-up firmly forward with affirmative nod ('FINE')"
            phase = 2 if prog < 0.6 else 3
            arrow = ((335, 185), (375, 165))
        l_pose = "open"

    elif phrase_id == 5:
        # What Is Your Name?: Point forward, then cross tap 2 fingers, then open palms up
        if t < 0.35:
            l_pos = l_rest
            r_pos = (380, 180)
            l_pose = "open"
            r_pose = "point"
            step_text = "Step 1: Point forward toward listener ('YOU')"
            phase = 1
            arrow = (r_rest, (380, 180))
        elif t < 0.70:
            l_pos = (310, 185)
            r_pos = (330, 185)
            l_pose = "two_finger_tap"
            r_pose = "two_finger_tap"
            step_text = "Step 2: Tap two index & middle fingers crosswise twice ('NAME')"
            phase = 2
            arrow = ((380, 180), (330, 185))
        else:
            l_pos = (280, 200)
            r_pos = (360, 200)
            l_pose = "open"
            r_pose = "open"
            step_text = "Step 3: Open both palms outward with questioning gaze ('WHAT?')"
            phase = 3
            arrow = ((320, 185), (360, 200))

    elif phrase_id == 6:
        # My Name Is...: Hand to chest, tap name, then spell
        if t < 0.45:
            l_pos = l_rest
            r_pos = (325, 180)
            l_pose = "open"
            r_pose = "open"
            step_text = "Step 1: Place flat palm on center of chest ('MY')"
            phase = 1
            arrow = (r_rest, (325, 180))
        else:
            l_pos = (310, 185)
            r_pos = (330, 185)
            l_pose = "two_finger_tap"
            r_pose = "two_finger_tap"
            step_text = "Step 2: Tap index & middle fingers crosswise ('NAME'), then spell"
            phase = 2
            arrow = ((325, 180), (330, 185))

    elif phrase_id == 7:
        # Nice To Meet You: Slide hand on palm, then bring index fingers together
        if t < 0.5:
            prog = t / 0.5
            l_pos = (305, 200)
            r_pos = (285 + 50 * prog, 195)
            l_pose = "open"
            r_pose = "open"
            step_text = "Step 1: Slide dominant flat palm across non-dominant palm ('NICE')"
            phase = 1
            arrow = ((285, 195), (335, 195))
        else:
            prog = (t - 0.5) / 0.5
            l_pos = (270 + 40 * prog, 185)
            r_pos = (370 - 40 * prog, 185)
            l_pose = "point"
            r_pose = "point"
            step_text = "Step 2: Bring both upright index fingers together until knuckles meet ('MEET')"
            phase = 2 if prog < 0.7 else 3
            arrow = ((370, 185), (330, 185))

    elif phrase_id == 8:
        # Please Help Me: Flat support hand + thumb fist, lifted toward chest
        l_base = (310, 230 - 30 * ease)
        r_fist = (315, 215 - 30 * ease)
        l_pos = l_base
        r_pos = r_fist
        l_pose = "open"
        r_pose = "thumbs_up"
        step_text = "Step: Rest thumb-up fist on flat palm, lift together toward chest ('HELP ME')"
        phase = 1 if t < 0.3 else (2 if t < 0.75 else 3)
        arrow = ((315, 230), (315, 185))

    elif phrase_id == 9:
        # Where Is The Washroom?: Shake 'T' handshape then open palms
        if t < 0.6:
            wiggle = math.sin(t * 20) * 12
            l_pos = l_rest
            r_pos = (370 + wiggle, 175)
            l_pose = "open"
            r_pose = "t_shape"
            step_text = "Step 1: Form 'T' handshape, shake side-to-side twice ('TOILET / RESTROOM')"
            phase = 1 if t < 0.3 else 2
            arrow = ((360, 175), (385, 175))
        else:
            l_pos = (280, 205)
            r_pos = (360, 205)
            l_pose = "open"
            r_pose = "open"
            step_text = "Step 2: Spread open palms outward with questioning gaze ('WHERE?')"
            phase = 3
            arrow = ((370, 175), (360, 205))

    else:  # phrase_id == 10
        # Good Morning / Bye: Touch chin (Good) -> Sunrise rise (Morning) -> Wave (Bye)
        if t < 0.45:
            prog = t / 0.45
            l_pos = l_rest
            r_pos = (350 + 20 * prog, 130 + 35 * prog)
            l_pose = "open"
            r_pose = "open"
            step_text = "Step 1: Touch fingers to chin, push outward ('GOOD')"
            phase = 1
            arrow = ((350, 130), (370, 165))
        elif t < 0.8:
            l_pos = (300, 200)
            prog = (t - 0.45) / 0.35
            r_pos = (340, 200 - 45 * prog)
            l_pose = "open"
            r_pose = "open"
            step_text = "Step 2: Dominant hand rises like sunrise from forearm ('MORNING')"
            phase = 2
            arrow = ((340, 200), (340, 155))
        else:
            wave = math.sin((t - 0.8) * 25) * 8
            l_pos = l_rest
            r_pos = (375 + wave, 145)
            l_pose = "open"
            r_pose = "open"
            step_text = "Step 3: Wave open palm smoothly forward ('SEE YOU AGAIN / BYE')"
            phase = 3
            arrow = ((340, 155), (375, 145))

    return l_pos, r_pos, l_pose, r_pose, step_text, phase, arrow


def render_phrase_frame(phrase, frame_idx, total_frames):
    """Renders one single 640x368 frame for the specified phrase."""
    img = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 255))
    draw = ImageDraw.Draw(img)

    # 1. Background
    draw_background(draw, frame_idx, total_frames)

    # 2. Avatar Torso
    draw_avatar_torso(draw)

    # 3. Dynamic Animation Keyframe
    t = (frame_idx % total_frames) / total_frames
    l_pos, r_pos, l_pose, r_pose, step_text, phase, arrow = get_pose_animation(phrase["id"], t)

    # Draw Upper Arms (Shoulder to Elbow, Elbow to Hand)
    # Left Arm
    l_elbow = ((SHOULDER_L[0] + l_pos[0]) // 2 - 20, (SHOULDER_L[1] + l_pos[1]) // 2 + 10)
    draw.line([SHOULDER_L, l_elbow, l_pos], fill=(0, 240, 255, 180), width=4)
    # Right Arm
    r_elbow = ((SHOULDER_R[0] + r_pos[0]) // 2 + 20, (SHOULDER_R[1] + r_pos[1]) // 2 + 10)
    draw.line([SHOULDER_R, r_elbow, r_pos], fill=(0, 240, 255, 180), width=4)

    # 4. Motion Arrow Indicator
    if arrow:
        draw_motion_arrow(draw, arrow[0], arrow[1], color=(0, 240, 255, 200), progress=(t * 2) % 1.0)

    # 5. MediaPipe 3D Hand Landmarks Skeleton Overlay
    draw_mediapipe_hand(draw, l_pos, is_left=True, hand_pose=l_pose, scale=0.85)
    draw_mediapipe_hand(draw, r_pos, is_left=False, hand_pose=r_pose, scale=0.85)

    # 6. Top HUD Header Strip
    # Header glass card
    draw.rectangle([12, 10, WIDTH - 12, 42], fill=(10, 16, 38, 200), outline=(0, 240, 255, 60))
    # Badge
    draw.rounded_rectangle([20, 15, 135, 37], radius=6, fill=(0, 240, 255, 35), outline=(0, 240, 255, 120))
    draw.text((26, 19), f"LESSON {phrase['id']:02d} / 10", font=FONT_BADGE, fill=CYAN_NEON)
    # Center title
    draw.text((150, 19), "INDIAN SIGN LANGUAGE (ISL) VIDEO GUIDE", font=FONT_BADGE, fill=(200, 220, 255))
    # Right duration pill
    draw.rounded_rectangle([WIDTH - 110, 15, WIDTH - 20, 37], radius=6, fill=(16, 185, 129, 30), outline=(16, 185, 129, 100))
    draw.text((WIDTH - 98, 19), "HD 30 FPS", font=FONT_BADGE, fill=GREEN_NEON)

    # 7. Step Phase Indicator Pills (Top-Mid)
    p_w = 120
    p_y = 50
    for p_idx, p_name in enumerate(["1. Prep", "2. Motion", "3. Finish"]):
        cur_active = (phase == (p_idx + 1))
        p_x = 140 + p_idx * (p_w + 10)
        p_bg = (0, 240, 255, 50) if cur_active else (255, 255, 255, 15)
        p_border = CYAN_NEON if cur_active else (255, 255, 255, 40)
        p_text_col = TEXT_WHITE if cur_active else TEXT_MUTED
        draw.rounded_rectangle([p_x, p_y, p_x + p_w, p_y + 20], radius=10, fill=p_bg, outline=p_border, width=1)
        draw.text((p_x + 18, p_y + 4), p_name, font=FONT_BADGE, fill=p_text_col)

    # 8. Lower Third Card (Y: 265 to 358)
    card_box = [16, 265, WIDTH - 16, 358]
    draw.rounded_rectangle(card_box, radius=12, fill=CARD_BG, outline=BORDER_COLOR, width=1)

    # Category Pill
    draw.rounded_rectangle([28, 274, 115, 292], radius=6, fill=(147, 51, 234, 40), outline=(147, 51, 234, 140))
    draw.text((36, 276), phrase["category"].upper(), font=FONT_BADGE, fill=(216, 180, 254))

    # Main Phrase English
    draw.text((125, 272), phrase["phrase"], font=FONT_TITLE, fill=TEXT_WHITE)

    # Subtitles: Hindi & Kannada
    sub_text = f"Hindi: {phrase['hindi']}  •  Kannada: {phrase['kannada']}"
    draw.text((28, 305), sub_text, font=FONT_SUB, fill=CYAN_NEON)

    # Current Step Instruction Line
    draw.text((28, 328), step_text, font=FONT_BODY, fill=(226, 232, 240))

    # Convert to RGB numpy array
    return np.array(img.convert("RGB"))


def generate_all_phrase_videos():
    """Generates all 10 MP4 video files and thumbnail images."""
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        phrases = json.load(f)

    print(f"[*] Starting video generation for {len(phrases)} ISL phrases...")

    for phrase in phrases:
        pid = phrase["id"]
        mp4_path = os.path.join(OUTPUT_DIR, f"phrase_{pid}.mp4")
        thumb_path = os.path.join(OUTPUT_DIR, f"phrase_{pid}_thumb.jpg")

        total_frames = FPS * (4 if pid in [3, 5, 6, 7, 8, 9, 10] else 3)
        print(f" -> Rendering Phrase {pid}/10: '{phrase['phrase']}' ({total_frames} frames)...")

        # Save thumbnail at midpoint frame
        mid_frame = render_phrase_frame(phrase, total_frames // 2, total_frames)
        Image.fromarray(mid_frame).save(thumb_path, quality=92)

        # Write video clipping using imageio libx264
        writer = imageio.get_writer(
            mp4_path,
            fps=FPS,
            codec="libx264",
            format="FFMPEG",
            quality=8,
            pixelformat="yuv420p"
        )

        for f_idx in range(total_frames):
            frame_arr = render_phrase_frame(phrase, f_idx, total_frames)
            writer.append_data(frame_arr)

        writer.close()
        file_size = os.path.getsize(mp4_path)
        print(f"    [OK] Generated {mp4_path} ({file_size / 1024:.1f} KB)")

    print("[*] All 10 ISL phrase video clippings generated successfully!")


if __name__ == "__main__":
    generate_all_phrase_videos()
