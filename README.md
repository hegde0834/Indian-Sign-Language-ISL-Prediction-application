# Indian Sign Language to Text & Speech

OpenCV + MediaPipe Tasks HandLandmarker (`hand_landmarker.task`, 21 landmarks, 3D) -> 238 geometric/3D features -> XGBoost -> text -> speech (English / Hindi / Kannada).

## Setup (Python 3.9 - 3.12)
    pip install -r requirements.txt

## Workflow
1. Collect data (webcam). Do this for every label in `config.py` (A-Z, word signs, SPACE, DEL, CLEAR, IDLE):
       python collect_data.py
   Aim for 300+ samples per label, vary angle, distance, lighting, and ideally several people.
2. Train:
       python train.py
3. Run:
       python app.py        # Desktop OpenCV interface
       python web_app.py    # Modern web app with Prediction Studio & 26-Letter Quiz

## Web Application & Prediction Quiz
Run `python web_app.py` and navigate in your browser:
- **Homepage:** `http://localhost:5000/` (Project showcase, 3D hologram hand, interactive ISL reference)
- **Prediction Studio:** `http://localhost:5000/predict` (Full-screen real-time sign to text & multilingual speech)
- **26-Letter ISL Prediction Quiz:** `http://localhost:5000/quiz`
  - **AI Camera Prediction Challenge:** Real-time webcam sign test where the AI evaluates your hand gestures live against target letters A to Z.
  - **Recognize the Sign (Visual Quiz):** Identify letters from authentic Indian Sign Language manual alphabet photos.
  - **Pick Matching Sign (Reverse Quiz):** Select the matching hand gesture from 4 photo cards.
  - **Curriculum Selection:** All 26 letters (A–Z), Vowels (A, E, I, O, U), 10-Question Sprint, Part 1 (A–M), Part 2 (N–Z), or Weak Letter Practice.
  - **Full 26-Letter Performance Matrix:** Interactive A–Z matrix showing mastered letters, letters needing practice, and one-click access to photos and formation guides.
  - **Audio & Speech:** Real-time Web Audio sound effects, streak multipliers, and speech pronunciation.
S speak sentence | R replay | L change voice language | 1/2/3 accept suggestion | B backspace | C clear | Q quit

## Features map
- Webcam + continuous detection: app.py
- Hand detection, 21 landmarks, 3D + geometric features: features.py
- A-Z + word recognition, XGBoost: train.py / app.py
- Confidence display, smoothing, hold-to-commit: app.py
- Letters -> words -> sentences, SPACE / DEL / CLEAR gestures: sentence.py
- Word suggestion + auto-correction (edit data/words.txt): sentence.py
- Speech, replay, English/Hindi/Kannada: speech.py

## Notes
- No pretrained model is included: you must record your own samples (step 1).
- Many ISL letters use two hands; both hands are supported (hand order is by screen position).
- Use a distinct, easy gesture for SPACE / DEL / CLEAR, and record IDLE (resting hand) to avoid false triggers.
- Hindi/Kannada speech needs internet (translation + gTTS). English falls back to offline pyttsx3.
- Edit WORD_SIGNS in config.py to change the word vocabulary, then re-collect and retrain.
- The `hand_landmarker.task` model is downloaded automatically on first run into `models/`. If you're offline, download it from
  https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task
  and save it as `models/hand_landmarker.task`.
