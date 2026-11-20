"""
ISL Major Project - Web Application Server
Bridges the web frontend (index.html, predict.html) with the real-time Python AI backend:
- MediaPipe 21 3D Hand Landmark Tracking
- XGBoost Sign Classification
- NLP Sentence Construction & Auto-Correction
- Verified Kannada / Hindi Translation & Neural Speech Synthesis
"""

import os
import sys
import time
import json
import string
import base64
import threading
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
from flask import Flask, request, jsonify, send_from_directory, Response, redirect

import config
from features import make_hands, process_frame, draw_hands
from sentence import SentenceBuilder
from speech import Speaker

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__, static_folder=None)

# --------------------------------------------------------------------------
# State & Machine Learning Engine Initialization
# --------------------------------------------------------------------------
state_lock = threading.Lock()

print("[ISL Web] Initializing MediaPipe HandLandmarker...")
hands_tracker = make_hands()

print("[ISL Web] Loading XGBoost Model...")
booster = xgb.Booster()
if os.path.exists(config.MODEL_PATH):
    booster.load_model(config.MODEL_PATH)
    print(f"[ISL Web] Model loaded successfully from {config.MODEL_PATH}")
else:
    print(f"[ISL Web] WARNING: Model file not found at {config.MODEL_PATH}")

classes = []
if os.path.exists(config.LABELS_PATH):
    with open(config.LABELS_PATH, "r", encoding="utf-8") as f:
        classes = json.load(f)
    print(f"[ISL Web] Loaded {len(classes)} sign classes.")
else:
    classes = list("ABCDEFGHIJKLMNOPQRSTUVWXYZ")

builder = SentenceBuilder()
speaker = Speaker()

# Inference state buffers
prob_buf = deque(maxlen=config.SMOOTH_WINDOW)
cand_sign = None
hold_count = 0
locked_sign = None
miss_count = 0
last_shown_label = "-"
last_shown_conf = 0.0
last_req_text = None
last_req_t = 0.0

# Quiz inference state buffer for temporal smoothing
quiz_prob_buf = deque(maxlen=config.SMOOTH_WINDOW)
quiz_miss_count = 0


# --------------------------------------------------------------------------
# Static Routes
# --------------------------------------------------------------------------
@app.route("/")
@app.route("/index.html")
@app.route("/about")
def serve_index():
    return send_from_directory(BASE_DIR, "index.html")


@app.route("/predict")
@app.route("/predict.html")
def serve_predict():
    return send_from_directory(BASE_DIR, "predict.html")


@app.route("/quiz")
@app.route("/quiz.html")
def serve_quiz():
    return send_from_directory(BASE_DIR, "quiz.html")


@app.route("/lessons")
@app.route("/lessons.html")
def serve_lessons():
    return send_from_directory(BASE_DIR, "lessons.html")


@app.route("/phrases")
@app.route("/learn")
def serve_phrases_redirect():
    return redirect("/lessons")


@app.route("/style.css")
def serve_css():
    return send_from_directory(BASE_DIR, "style.css")


@app.route("/quiz.css")
def serve_quiz_css():
    return send_from_directory(BASE_DIR, "quiz.css")


@app.route("/lessons.css")
def serve_lessons_css():
    return send_from_directory(BASE_DIR, "lessons.css")


@app.route("/script.js")
def serve_script():
    return send_from_directory(BASE_DIR, "script.js")


@app.route("/predict.js")
def serve_predict_js():
    return send_from_directory(BASE_DIR, "predict.js")


@app.route("/quiz.js")
def serve_quiz_js():
    return send_from_directory(BASE_DIR, "quiz.js")


@app.route("/lessons.js")
def serve_lessons_js():
    return send_from_directory(BASE_DIR, "lessons.js")


@app.route("/assets/<path:filename>")
def serve_assets(filename):
    assets_dir = os.path.join(BASE_DIR, "assets")
    return send_from_directory(assets_dir, filename)


# CORS & Cache Headers
@app.after_request
def add_cors(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS"
    # Prevent browser caching of HTML, CSS, JS during interactive sessions
    if request.path.endswith((".html", ".css", ".js")) or request.path in ["/quiz", "/predict", "/lessons", "/"]:
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
    return response


# --------------------------------------------------------------------------
# API: Health Status
# --------------------------------------------------------------------------
@app.route("/api/health", methods=["GET"])
def api_health():
    with state_lock:
        return jsonify({
            "status": "ok",
            "model_loaded": os.path.exists(config.MODEL_PATH),
            "classes_count": len(classes),
            "languages": list(config.LANGUAGES.keys()),
            "current_language": speaker.language,
            "sentence": builder.text
        })


# --------------------------------------------------------------------------
# API: Real-Time Frame Inference
# --------------------------------------------------------------------------
@app.route("/api/predict", methods=["POST"])
def api_predict():
    global cand_sign, hold_count, locked_sign, miss_count
    global last_shown_label, last_shown_conf, last_req_text, last_req_t

    try:
        data = request.get_json(force=True, silent=True)
        if not data or "image" not in data:
            return jsonify({"error": "No image data received"}), 400

        img_str = data["image"]
        if "," in img_str:
            img_str = img_str.split(",", 1)[1]

        img_bytes = base64.b64decode(img_str)
        nparr = np.frombuffer(img_bytes, np.uint8)
        raw_frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if raw_frame is None:
            return jsonify({"error": "Failed to decode frame"}), 400

        # Mirror horizontally to match front-facing camera
        frame = cv2.flip(raw_frame, 1)

        with state_lock:
            feats, res = process_frame(hands_tracker, frame)

            hands_count = len(res.hand_landmarks) if (res and res.hand_landmarks) else 0

            # Normalized landmarks for client skeleton canvas (1:1 with mirrored view)
            landmarks_payload = []
            if res and res.hand_landmarks:
                for lms in res.hand_landmarks:
                    pts = [[float(l.x), float(l.y)] for l in lms]
                    landmarks_payload.append(pts)

            is_held = False
            if feats is None:
                miss_count += 1
                if miss_count >= config.MISS_RESET:
                    prob_buf.clear()
                    cand_sign, hold_count, locked_sign = None, 0, None
                    last_shown_label = "-"
                    last_shown_conf = 0.0
            else:
                miss_count = 0
                try:
                    preds = booster.inplace_predict(feats[None])[0]
                except Exception:
                    preds = booster.predict(xgb.DMatrix(feats[None]))[0]

                prob_buf.append(preds)
                avg = np.mean(prob_buf, axis=0)
                idx = int(np.argmax(avg))
                label = classes[idx] if idx < len(classes) else str(idx)
                conf = float(avg[idx])
                last_shown_label, last_shown_conf = label, conf

                if conf >= config.CONF_THRESHOLD and label != config.IDLE:
                    hold_count = hold_count + 1 if label == cand_sign else 1
                    cand_sign = label
                else:
                    cand_sign, hold_count = None, 0

                # Commit sign once held long enough; same sign can't repeat until hand leaves/changes
                if cand_sign and hold_count >= config.HOLD_FRAMES and cand_sign != locked_sign:
                    builder.add_sign(cand_sign)
                    locked_sign, hold_count = cand_sign, 0
                    is_held = True

            # Stable live translation preview
            if speaker.language != "English":
                if builder.sentence:
                    if builder.current and builder.current in builder.word_set:
                        cur_text = " ".join(builder.sentence + [builder.current])
                    else:
                        cur_text = " ".join(builder.sentence)
                elif builder.current and builder.current in builder.word_set:
                    cur_text = builder.current
                else:
                    cur_text = ""

                now = time.time()
                if cur_text != last_req_text and (now - last_req_t > 0.5):
                    speaker.translate_async(cur_text)
                    last_req_text = cur_text
                    last_req_t = now

            all_suggestions = builder.suggestions()
            translation = speaker.translation if speaker.language != "English" else ""

            return jsonify({
                "label": last_shown_label,
                "confidence": round(last_shown_conf, 2),
                "hands_count": hands_count,
                "is_held": is_held,
                "hold_progress": round(min(1.0, hold_count / config.HOLD_FRAMES), 2) if cand_sign else 0.0,
                "sentence": builder.text,
                "current_letters": builder.current,
                "translation": translation,
                "suggestions": all_suggestions,
                "total_suggestions": len(all_suggestions),
                "hands_landmarks": landmarks_payload,
                "language": speaker.language,
                "status": speaker.status
            })

    except Exception as e:
        print(f"[api_predict error] {e}")
        return jsonify({"error": str(e)}), 500


# --------------------------------------------------------------------------
# API: 26-Letter ISL Prediction Quiz Endpoints
# --------------------------------------------------------------------------
@app.route("/api/quiz/letters", methods=["GET"])
def api_quiz_letters():
    """Returns the complete dataset of all 26 ISL manual alphabets."""
    letters_file = os.path.join(config.DATA_DIR, "isl_letters.json")
    if os.path.exists(letters_file):
        with open(letters_file, "r", encoding="utf-8") as f:
            letters_data = json.load(f)
        return jsonify({"status": "success", "letters": letters_data, "total": len(letters_data)})
    else:
        # Fallback list of 26 letters
        letters_data = []
        for ch in string.ascii_uppercase:
            letters_data.append({
                "letter": ch,
                "name": f"Letter {ch}",
                "category": "Vowel" if ch in "AEIOU" else "Consonant",
                "is_vowel": ch in "AEIOU",
                "image": f"/assets/images/quiz_letters/{ch.lower()}.jpg",
                "description": f"Indian Sign Language gesture for letter {ch}."
            })
        return jsonify({"status": "fallback", "letters": letters_data, "total": len(letters_data)})


# --------------------------------------------------------------------------
# API: 10 Basic Everyday ISL Phrases & Sentences Video Lessons
# --------------------------------------------------------------------------
@app.route("/api/phrases", methods=["GET"])
def api_phrases():
    """Returns the 10 basic everyday ISL phrases with video clippings and guides."""
    phrases_file = os.path.join(config.DATA_DIR, "isl_phrases.json")
    if os.path.exists(phrases_file):
        with open(phrases_file, "r", encoding="utf-8") as f:
            phrases_data = json.load(f)
        return jsonify({"status": "success", "phrases": phrases_data, "total": len(phrases_data)})
    return jsonify({"status": "error", "message": "Phrases data not found"}), 404


@app.route("/api/quiz/verify", methods=["POST"])
def api_quiz_verify():
    """
    Evaluates a live webcam frame specifically for a quiz target letter.
    Returns whether the sign matched, confidence, top predictions, and 3D landmarks.
    """
    try:
        data = request.get_json(force=True, silent=True) or {}
        if not data or "image" not in data:
            return jsonify({"error": "No image data received"}), 400

        target_letter = str(data.get("target_letter", "")).strip().upper()
        threshold = float(data.get("threshold", 0.50))
        reset_buffer = bool(data.get("reset_buffer", False))

        with state_lock:
            global quiz_miss_count
            if reset_buffer:
                quiz_prob_buf.clear()
                quiz_miss_count = 0

        img_str = data["image"]
        if "," in img_str:
            img_str = img_str.split(",", 1)[1]

        img_bytes = base64.b64decode(img_str)
        nparr = np.frombuffer(img_bytes, np.uint8)
        raw_frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if raw_frame is None:
            return jsonify({"error": "Failed to decode frame"}), 400

        # Mirror horizontally to match user camera view
        frame = cv2.flip(raw_frame, 1)

        with state_lock:
            feats, res = process_frame(hands_tracker, frame)

            hands_count = len(res.hand_landmarks) if (res and res.hand_landmarks) else 0

            landmarks_payload = []
            if res and res.hand_landmarks:
                for lms in res.hand_landmarks:
                    pts = [[float(l.x), float(l.y)] for l in lms]
                    landmarks_payload.append(pts)

            if feats is None or hands_count == 0:
                quiz_miss_count += 1
                if quiz_miss_count >= 5:
                    quiz_prob_buf.clear()
                return jsonify({
                    "detected": False,
                    "hands_count": 0,
                    "matched": False,
                    "label": "-",
                    "confidence": 0.0,
                    "target_confidence": 0.0,
                    "top_predictions": [],
                    "hands_landmarks": []
                })

            quiz_miss_count = 0

            # Inference with booster
            try:
                preds = booster.inplace_predict(feats[None])[0]
            except Exception:
                preds = booster.predict(xgb.DMatrix(feats[None]))[0]

            # Temporal probability smoothing for rock-solid stability
            quiz_prob_buf.append(preds)
            avg = np.mean(quiz_prob_buf, axis=0)

            top_idx = int(np.argmax(avg))
            top_label = classes[top_idx] if top_idx < len(classes) else str(top_idx)
            top_conf = float(avg[top_idx])

            # Target sign smoothed probability
            target_conf = 0.0
            if target_letter in classes:
                t_idx = classes.index(target_letter)
                target_conf = float(avg[t_idx])

            # Top 3 predictions for feedback
            sorted_indices = np.argsort(avg)[::-1][:3]
            top_predictions = [
                {
                    "label": classes[i] if i < len(classes) else str(i),
                    "confidence": round(float(avg[i]), 3)
                }
                for i in sorted_indices if i < len(classes)
            ]

            # Highly responsive matching:
            # Matches if target is top label with confidence >= threshold,
            # OR if target confidence alone reaches at least 0.45
            matched = (top_label == target_letter and top_conf >= threshold) or (target_conf >= 0.45)

            return jsonify({
                "detected": True,
                "hands_count": hands_count,
                "matched": bool(matched),
                "label": top_label,
                "confidence": round(top_conf, 3),
                "target_confidence": round(target_conf, 3),
                "target_letter": target_letter,
                "top_predictions": top_predictions,
                "hands_landmarks": landmarks_payload
            })

    except Exception as e:
        print(f"[api_quiz_verify error] {e}")
        return jsonify({"error": str(e)}), 500


# --------------------------------------------------------------------------
# API: Control Actions
# --------------------------------------------------------------------------
@app.route("/api/control", methods=["POST"])
def api_control():
    global last_req_text, last_req_t

    try:
        data = request.get_json(force=True, silent=True) or {}
        action = data.get("action", "")

        with state_lock:
            if action == "space":
                builder.finish_word()
            elif action == "backspace":
                builder.backspace()
            elif action == "clear":
                builder.clear()
                speaker.translation = ""
                last_req_text = ""
            elif action == "accept_suggestion":
                idx = int(data.get("index", 0))
                builder.accept_suggestion(idx)
            elif action == "add_letter":
                letter = data.get("letter", "")
                if letter:
                    builder.add_sign(letter)
            elif action == "next_lang":
                speaker.next_language()
                speaker.translation = ""
                last_req_text = ""
            elif action == "set_language":
                lang = data.get("language")
                if lang in speaker.languages:
                    speaker.lang_index = speaker.languages.index(lang)
                    speaker.translation = ""
                    last_req_text = ""

            if speaker.language != "English" and builder.text:
                speaker.translate_async(builder.text)

            all_suggestions = builder.suggestions()
            return jsonify({
                "status": "success",
                "sentence": builder.text,
                "current_letters": builder.current,
                "translation": speaker.translation if speaker.language != "English" else "",
                "suggestions": all_suggestions,
                "total_suggestions": len(all_suggestions),
                "language": speaker.language,
                "status_msg": speaker.status
            })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# --------------------------------------------------------------------------
# API: Text-to-Speech (Speak & Replay)
# --------------------------------------------------------------------------
@app.route("/api/speak", methods=["POST"])
def api_speak():
    try:
        data = request.get_json(force=True, silent=True) or {}
        lang = data.get("language", speaker.language)

        with state_lock:
            builder.finish_word()
            text = builder.text
            if lang in speaker.languages:
                speaker.lang_index = speaker.languages.index(lang)

        if not text.strip():
            return jsonify({"status": "empty", "message": "No text constructed to speak."})

        speaker.speak(text)
        return jsonify({
            "status": "speaking",
            "message": f"Speaking in {speaker.language}...",
            "text": text,
            "language": speaker.language
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/replay", methods=["POST"])
def api_replay():
    try:
        speaker.replay()
        return jsonify({"status": "replaying", "message": "Replaying last spoken sentence."})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# --------------------------------------------------------------------------
# DirectShow Server Stream (Optional Fallback)
# --------------------------------------------------------------------------
def gen_server_frames():
    cap = None
    try:
        # Use DirectShow on Windows to avoid flashlight freeze
        cap = cv2.VideoCapture(0, cv2.CAP_DSHOW) if os.name == "nt" else cv2.VideoCapture(0)
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

        while True:
            ok, frame = cap.read()
            if not ok:
                time.sleep(0.05)
                continue

            frame = cv2.flip(frame, 1)
            with state_lock:
                feats, res = process_frame(hands_tracker, frame)
                draw_hands(frame, res)

            ret, buffer = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), 75])
            if not ret:
                continue

            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
    except Exception as e:
        print("[video_feed exception]", e)
    finally:
        if cap and cap.isOpened():
            cap.release()


@app.route("/video_feed")
def video_feed():
    return Response(gen_server_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')


# --------------------------------------------------------------------------
# Main Entry Point
# --------------------------------------------------------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print("=" * 65)
    print(f"[*] ISL Major Project Web Application Server Running")
    print(f"[*] Frontend Homepage:    http://localhost:{port}/")
    print(f"[*] Prediction Studio:    http://localhost:{port}/predict")
    print("=" * 65)
    app.run(host="0.0.0.0", port=port, debug=False, threaded=True)
