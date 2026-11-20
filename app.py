
import argparse
import json
import math
import os
import sys
import time
from collections import deque

# Ensure UTF-8 output on Windows console
try:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

import cv2
import numpy as np
import xgboost as xgb
from PIL import Image, ImageDraw, ImageFont

import config
from features import make_hands, process_frame, draw_hands
from sentence import SentenceBuilder
from speech import Speaker

PAGE = 9  # suggestions shown per page
FONT = cv2.FONT_HERSHEY_SIMPLEX


def put(img, text, org, color=(255, 255, 255), scale=0.8, thick=2):
    cv2.putText(img, text, org, FONT, scale, (0, 0, 0), thick + 2, cv2.LINE_AA)
    cv2.putText(img, text, org, FONT, scale, color, thick, cv2.LINE_AA)


class WindowsIndicRenderer:
    """Renders Indic (Kannada/Hindi) text with native Windows OpenType/Uniscribe shaping."""
    def __init__(self, font_name="Nirmala UI", font_size=28):
        import ctypes
        from ctypes import wintypes
        self.ctypes = ctypes
        self.wintypes = wintypes
        self.user32 = ctypes.windll.user32
        self.gdi32 = ctypes.windll.gdi32

        self.hdc = self.user32.GetDC(0)
        self.mem_dc = self.gdi32.CreateCompatibleDC(self.hdc)
        # 5 = CLEARTYPE_QUALITY, 700 = FW_BOLD
        self.hfont = self.gdi32.CreateFontW(
            font_size, 0, 0, 0, 700, False, False, False,
            1, 0, 0, 5, 0, font_name
        )
        self.gdi32.SelectObject(self.mem_dc, self.hfont)
        self.gdi32.SetBkMode(self.mem_dc, 1)  # TRANSPARENT

        self.w, self.h = 1280, 55

        class BITMAPINFOHEADER(ctypes.Structure):
            _fields_ = [
                ('biSize', wintypes.DWORD), ('biWidth', wintypes.LONG), ('biHeight', wintypes.LONG),
                ('biPlanes', wintypes.WORD), ('biBitCount', wintypes.WORD), ('biCompression', wintypes.DWORD),
                ('biSizeImage', wintypes.DWORD), ('biXPelsPerMeter', wintypes.LONG),
                ('biYPelsPerMeter', wintypes.LONG), ('biClrUsed', wintypes.DWORD), ('biClrImportant', wintypes.DWORD),
            ]
        bmi = BITMAPINFOHEADER()
        bmi.biSize = ctypes.sizeof(BITMAPINFOHEADER)
        bmi.biWidth = self.w
        bmi.biHeight = -self.h  # top-down DIB
        bmi.biPlanes = 1
        bmi.biBitCount = 32
        bmi.biCompression = 0

        self.p_bits = ctypes.c_void_p()
        self.hbm = self.gdi32.CreateDIBSection(self.mem_dc, ctypes.byref(bmi), 0, ctypes.byref(self.p_bits), None, 0)
        self.gdi32.SelectObject(self.mem_dc, self.hbm)
        self.rect = wintypes.RECT(0, 0, self.w, self.h)
        self.black_brush = self.gdi32.CreateSolidBrush(0x000000)

    def draw(self, frame, text, org, color=(0, 230, 255)):
        if not text:
            return True
        x, y = org
        b, g, r = color
        color_ref = (r) | (g << 8) | (b << 16)
        self.gdi32.SetTextColor(self.mem_dc, color_ref)

        # Clear background to black
        self.user32.FillRect(self.mem_dc, self.ctypes.byref(self.rect), self.black_brush)

        # Draw text with Windows native Uniscribe shaping
        # DT_LEFT = 0, DT_VCENTER = 4, DT_SINGLELINE = 32, DT_END_ELLIPSIS = 0x8000
        self.user32.DrawTextW(self.mem_dc, text, len(text), self.ctypes.byref(self.rect), 0 | 4 | 32 | 0x8000)

        # Copy to frame
        buffer_view = (self.ctypes.c_ubyte * (self.w * self.h * 4)).from_address(self.p_bits.value)
        arr = np.frombuffer(buffer_view, dtype=np.uint8).reshape((self.h, self.w, 4))
        text_bgr = arr[:, :, :3]

        mask = np.any(text_bgr > 15, axis=-1)
        fh, fw = frame.shape[:2]
        y1, y2 = y, min(fh, y + self.h)
        x1, x2 = x, min(fw, x + self.w)
        th, tw = y2 - y1, x2 - x1
        if th > 0 and tw > 0:
            sub_mask = mask[:th, :tw]
            frame[y1:y2, x1:x2][sub_mask] = text_bgr[:th, :tw][sub_mask]
        return True


_indic_renderer = None

def get_indic_renderer():
    global _indic_renderer
    if _indic_renderer is None and os.name == "nt":
        try:
            _indic_renderer = WindowsIndicRenderer()
        except Exception:
            _indic_renderer = False
    return _indic_renderer


_FONTS = {
    "Hindi": [r"C:\Windows\Fonts\Nirmala.ttc", r"C:\Windows\Fonts\Nirmala.ttf",
              "/usr/share/fonts/truetype/noto/NotoSansDevanagari-Regular.ttf",
              "/System/Library/Fonts/Supplemental/DevanagariMT.ttc"],
    "Kannada": [r"C:\Windows\Fonts\Nirmala.ttc", r"C:\Windows\Fonts\Nirmala.ttf",
                "/usr/share/fonts/truetype/noto/NotoSansKannada-Regular.ttf",
                "/System/Library/Fonts/Kohinoor Kannada.ttc"],
}
_font_cache = {}


def get_font(lang, size):
    key = (lang, size)
    if key not in _font_cache:
        _font_cache[key] = None
        for p in _FONTS.get(lang, []):
            if os.path.exists(p):
                try:
                    _font_cache[key] = ImageFont.truetype(p, size)
                    break
                except Exception:
                    pass
    return _font_cache[key]


def put_unicode(img, text, org, lang, size=28, color=(0, 230, 255)):
    """Draw Hindi/Kannada text with full OpenType complex text shaping."""
    renderer = get_indic_renderer()
    if renderer:
        try:
            return renderer.draw(img, text, org, color=color)
        except Exception:
            pass
    font = get_font(lang, size)
    if font is None:
        return False
    pil = Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
    d = ImageDraw.Draw(pil)
    d.text(org, text, font=font, fill=(color[2], color[1], color[0]))
    img[:] = cv2.cvtColor(np.array(pil), cv2.COLOR_RGB2BGR)
    return True


def wrap(text, width=38):
    lines, line = [], ""
    for word in text.split(" "):
        if len(line) + len(word) + 1 > width and line:
            lines.append(line)
            line = word
        else:
            line = f"{line} {word}".strip()
    lines.append(line)
    return lines[-3:]


def draw_suggestions(frame, items, y0, w):
    """Draw '[1] WORD' labels, wrapping onto a second row when the width runs out."""
    x, y = 15, y0
    for i, s in enumerate(items):
        label = f"[{i + 1}] {s}"
        tw = cv2.getTextSize(label, FONT, 0.6, 1)[0][0]
        if x + tw > w - 15:
            x, y = 15, y + 26
        put(frame, label, (x, y), (0, 200, 255), 0.6, 1)
        x += tw + 22


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--camera", type=int, default=0)
    ap.add_argument("--web", action="store_true", help="Launch web frontend server")
    args = ap.parse_args()

    if args.web:
        import web_app
        port = int(os.environ.get("PORT", 5000))
        print("=" * 65)
        print(f"[*] ISL Major Project Web Application Server Running")
        print(f"[*] Frontend Homepage:    http://localhost:{port}/")
        print(f"[*] Prediction Studio:    http://localhost:{port}/predict")
        print("=" * 65)
        web_app.app.run(host="0.0.0.0", port=port, debug=False, threaded=True)
        return

    if not (os.path.exists(config.MODEL_PATH) and os.path.exists(config.LABELS_PATH)):
        raise SystemExit(
            "No trained model found.\n"
            "  1) python collect_data.py   (record your signs)\n"
            "  2) python train.py          (train the model)\n"
            "  3) python app.py            (run again)")
    booster = xgb.Booster()
    booster.load_model(config.MODEL_PATH)
    classes = json.load(open(config.LABELS_PATH))

    # Use DirectShow on Windows for instant, reliable camera capture without hanging
    cap = cv2.VideoCapture(args.camera, cv2.CAP_DSHOW)
    if not cap.isOpened():
        cap = cv2.VideoCapture(args.camera)
    if not cap.isOpened():
        raise SystemExit(f"Error: Could not access camera {args.camera}. Check permissions or close other apps using it.")

    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
    cv2.namedWindow("ISL to Text & Speech", cv2.WINDOW_AUTOSIZE)

    hands = make_hands()
    builder = SentenceBuilder()
    speaker = Speaker()

    buf = deque(maxlen=config.SMOOTH_WINDOW)
    cand, hold, locked, miss = None, 0, None, 0
    shown_label, shown_conf = "-", 0.0
    last_req_text, last_req_t, last_lang = None, 0.0, speaker.language
    sug_page, prev_current = 0, ""
    fail_count = 0

    while True:
        ok, frame = cap.read()
        if not ok:
            fail_count += 1
            if fail_count > 50:
                print("Camera stopped delivering frames. Exiting.")
                break
            time.sleep(0.02)
            continue
        fail_count = 0

        frame = cv2.flip(frame, 1)
        feats, res = process_frame(hands, frame)
        draw_hands(frame, res)

        if feats is None:
            miss += 1
            if miss >= config.MISS_RESET:
                buf.clear(); cand, hold, locked = None, 0, None
                shown_label, shown_conf = "-", 0.0
        else:
            miss = 0
            buf.append(booster.predict(xgb.DMatrix(feats[None]))[0])
            avg = np.mean(buf, axis=0)
            idx = int(np.argmax(avg))
            label, conf = classes[idx], float(avg[idx])
            shown_label, shown_conf = label, conf

            if conf >= config.CONF_THRESHOLD and label != config.IDLE:
                hold = hold + 1 if label == cand else 1
                cand = label
            else:
                cand, hold = None, 0

            # commit once held long enough; same sign can't repeat until hand leaves/changes
            if cand and hold >= config.HOLD_FRAMES and cand != locked:
                builder.add_sign(cand)
                locked, hold = cand, 0

        # live Hindi/Kannada translation preview
        if speaker.language == "English":
            last_req_text, last_lang = None, "English"
        else:
            if builder.sentence:
                if builder.current and builder.current in builder.word_set:
                    cur = " ".join(builder.sentence + [builder.current])
                else:
                    cur = " ".join(builder.sentence)
            elif builder.current and builder.current in builder.word_set:
                cur = builder.current
            else:
                cur = ""

            if (cur != last_req_text or speaker.language != last_lang) and time.time() - last_req_t > 0.5:
                speaker.translate_async(cur)
                last_req_text, last_req_t, last_lang = cur, time.time(), speaker.language

        # suggestions: ALL words starting with the signed letters, paged
        if builder.current != prev_current:
            sug_page, prev_current = 0, builder.current
        all_sug = builder.suggestions()
        pages = max(1, math.ceil(len(all_sug) / PAGE))
        sug_page = min(sug_page, pages - 1)
        page_items = all_sug[sug_page * PAGE: sug_page * PAGE + PAGE]

        # ---------------- UI ----------------
        h, w = frame.shape[:2]
        overlay = frame.copy()
        cv2.rectangle(overlay, (0, 0), (w, 95), (30, 30, 30), -1)
        cv2.rectangle(overlay, (0, h - 262), (w, h), (30, 30, 30), -1)
        frame = cv2.addWeighted(overlay, 0.6, frame, 0.4, 0)

        put(frame, f"Sign: {shown_label}", (15, 38), (0, 255, 255), 1.0)
        put(frame, f"Confidence: {shown_conf * 100:.0f}%", (15, 78), (0, 255, 0), 0.8)
        cv2.rectangle(frame, (w - 220, 25), (w - 20, 45), (90, 90, 90), 1)
        cv2.rectangle(frame, (w - 220, 25), (w - 220 + int(200 * shown_conf), 45), (0, 255, 0), -1)
        put(frame, f"Voice: {speaker.language}", (w - 220, 78), (255, 200, 0), 0.7)

        y = h - 232
        for line in wrap(builder.text + "_"):
            put(frame, line, (15, y), (255, 255, 255), 0.9)
            y += 36
        if speaker.translation and speaker.language != "English":
            if not put_unicode(frame, speaker.translation, (15, h - 150), speaker.language):
                put(frame, "(no Hindi/Kannada font found - see console for text)", (15, h - 125),
                    (0, 165, 255), 0.55, 1)

        draw_suggestions(frame, page_items, h - 96, w)
        if all_sug:
            put(frame, f"{len(all_sug)} words starting with '{builder.current}'  |  page {sug_page + 1}/{pages}"
                       f"  (N next, P prev)", (15, h - 46), (0, 200, 255), 0.5, 1)
        put(frame, f"{speaker.status} | S speak R replay L lang 1-9 pick B back C clear Q quit", (15, h - 16),
            (200, 200, 200), 0.5, 1)

        cv2.imshow("ISL to Text & Speech", frame)
        k = cv2.waitKey(1) & 0xFF
        if k in (ord("q"), 27):
            break
        elif k == ord("s"):
            builder.finish_word()
            speaker.speak(builder.text)
        elif k == ord("r"):
            speaker.replay()
        elif k == ord("l"):
            speaker.next_language()
        elif k == ord("b"):
            builder.backspace()
        elif k == ord("c"):
            builder.clear()
            speaker.translation = ""
        elif k == ord("n"):
            sug_page = (sug_page + 1) % pages
        elif k == ord("p"):
            sug_page = (sug_page - 1) % pages
        elif ord("1") <= k <= ord("9"):
            builder.accept_suggestion(sug_page * PAGE + (k - ord("1")))
            sug_page = 0

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()