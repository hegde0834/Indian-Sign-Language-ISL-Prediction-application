import os, string

BASE = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE, "data")
MODEL_DIR = os.path.join(BASE, "models")
CACHE_DIR = os.path.join(BASE, "cache")
for _d in (DATA_DIR, MODEL_DIR, CACHE_DIR):
    os.makedirs(_d, exist_ok=True)

DATASET_PATH = os.path.join(DATA_DIR, "dataset.csv")
WORDS_PATH = os.path.join(DATA_DIR, "words.txt")
MODEL_PATH = os.path.join(MODEL_DIR, "isl_xgb.json")
LABELS_PATH = os.path.join(MODEL_DIR, "labels.json")

# ---- Sign vocabulary (edit freely, then re-collect data + retrain) ----
LETTERS = list(string.ascii_uppercase)
WORD_SIGNS = ["HELLO", "THANKYOU", "PLEASE", "YES", "NO", "HELP", "SORRY", "WATER", "FOOD", "GOOD"]
CONTROLS = ["SPACE", "DEL", "CLEAR"]          # gesture commands
IDLE = "IDLE"                                  # resting hand, ignored by the app
ALL_LABELS = LETTERS + WORD_SIGNS + CONTROLS + [IDLE]
WORD_DISPLAY = {"THANKYOU": "THANK YOU"}

# ---- Recognition tuning ----
CONF_THRESHOLD = 0.80   # min smoothed confidence to accept a sign (80%)
HOLD_FRAMES = 8        # frames a sign must be held before it is committed
SMOOTH_WINDOW = 8       # frames averaged for probability smoothing
MISS_RESET = 10         # frames without a hand before state resets

# ---- Speech ----
LANGUAGES = {"English": "en", "Hindi": "hi", "Kannada": "kn"}

# ---- MediaPipe Tasks HandLandmarker model ----
HAND_MODEL_PATH = os.path.join(MODEL_DIR, "hand_landmarker.task")
HAND_MODEL_URL = ("https://storage.googleapis.com/mediapipe-models/hand_landmarker/"
                  "hand_landmarker/float16/1/hand_landmarker.task")
