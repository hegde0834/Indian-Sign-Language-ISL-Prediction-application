"""Translation + text-to-speech in English / Hindi / Kannada, with replay.

Translation : direct Google endpoint (stdlib only) -> deep-translator -> MyMemory fallback.
Voice       : Microsoft neural voices via edge-tts (clear) -> gTTS fallback -> offline pyttsx3.
Hindi/Kannada need internet. Audio plays through Windows MCI (no pygame needed on Windows).
"""
import hashlib
import json
import os
import socket
import threading
import time
import traceback
import urllib.parse
import urllib.request

import sys
import config

# Ensure UTF-8 output on Windows console for Kannada and Hindi scripts
try:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

VOICES = {"en": "en-IN-NeerjaNeural", "hi": "hi-IN-SwaraNeural", "kn": "kn-IN-SapnaNeural"}
_UA = {"User-Agent": "Mozilla/5.0"}
_net = {"t": 0.0, "ok": False}


def online():
    """True if the internet is reachable (result cached for 5 s)."""
    if time.time() - _net["t"] < 5:
        return _net["ok"]
    try:
        socket.create_connection(("translate.googleapis.com", 443), timeout=3).close()
        ok = True
    except OSError:
        ok = False
    _net.update(t=time.time(), ok=ok)
    return ok


# ------------------------------------------------------------------ translation
def _http_json(url):
    req = urllib.request.Request(url, headers=_UA)
    with urllib.request.urlopen(req, timeout=10) as r:
        return json.loads(r.read().decode("utf-8"))


def _google(text, code):
    url = ("https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=%s&dt=t&q=%s"
           % (code, urllib.parse.quote(text)))
    data = _http_json(url)
    return "".join(seg[0] for seg in data[0] if seg and seg[0])


def _deep(text, code):
    from deep_translator import GoogleTranslator
    return GoogleTranslator(source="en", target=code).translate(text)


def _mymemory(text, code):
    url = "https://api.mymemory.translated.net/get?q=%s&langpair=en|%s" % (urllib.parse.quote(text), code)
    return _http_json(url)["responseData"]["translatedText"]


import re


_VERIFIED_TRANSLATIONS = {
    "kn": {
        # Core ISL signs
        "HELLO": "ನಮಸ್ಕಾರ",
        "THANKYOU": "ಧನ್ಯವಾದಗಳು",
        "THANK YOU": "ಧನ್ಯವಾದಗಳು",
        "THANKS": "ಧನ್ಯವಾದಗಳು",
        "THANK YOU VERY MUCH": "ತುಂಬಾ ಧನ್ಯವಾದಗಳು",
        "PLEASE": "ದಯವಿಟ್ಟು",
        "YES": "ಹೌದು",
        "NO": "ಇಲ್ಲ",
        "HELP": "ಸಹಾಯ",
        "SORRY": "ಕ್ಷಮಿಸಿ",
        "WATER": "ನೀರು",
        "FOOD": "ಆಹಾರ",
        "GOOD": "ಒಳ್ಳೆಯದು",
        "BAD": "ಕೆಟ್ಟದ್ದು",

        # Greetings & Polite phrases
        "GOOD MORNING": "ಶುಭೋದಯ",
        "GOOD AFTERNOON": "ಶುಭ ಮಧ್ಯಾಹ್ನ",
        "GOOD EVENING": "ಶುಭ ಸಂಜೆ",
        "GOOD NIGHT": "ಶುಭ ರಾತ್ರಿ",
        "HOW ARE YOU": "ನೀವು ಹೇಗಿದ್ದೀರಿ?",
        "I AM FINE": "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ",
        "NICE TO MEET YOU": "ನಿಮ್ಮನ್ನು ಭೇಟಿಯಾಗಲು ಸಂತೋಷವಾಗಿದೆ",
        "WELCOME": "ಸ್ವಾಗತ",
        "YOU ARE WELCOME": "ನಿಮಗೆ ಸ್ವಾಗತ",
        "SEE YOU": "ಮತ್ತೆ ಸಿಗೋಣ",
        "SEE YOU AGAIN": "ಮತ್ತೆ ಭೇಟಿಯಾಗೋಣ",
        "SEE YOU TOMORROW": "ನಾಳೆ ಭೇಟಿಯಾಗೋಣ",
        "TAKE CARE": "ಜಾಗರೂಕರಾಗಿರಿ",
        "HAPPY BIRTHDAY": "ಹುಟ್ಟುಹಬ್ಬದ ಶುಭಾಶಯಗಳು",
        "CONGRATULATIONS": "ಅಭಿನಂದನೆಗಳು",

        # Questions & Statements
        "WHAT IS YOUR NAME": "ನಿಮ್ಮ ಹೆಸರೇನು?",
        "MY NAME": "ನನ್ನ ಹೆಸರು",
        "WHERE ARE YOU": "ನೀವು ಎಲ್ಲಿದ್ದೀರಿ?",
        "WHERE ARE YOU GOING": "ನೀವು ಎಲ್ಲಿಗೆ ಹೋಗುತ್ತಿದ್ದೀರಿ?",
        "WHERE DO YOU LIVE": "ನೀವು ಎಲ್ಲಿ ವಾಸಿಸುತ್ತೀರಿ?",
        "WHAT ARE YOU DOING": "ನೀವು ಏನು ಮಾಡುತ್ತಿದ್ದೀರಿ?",
        "WHAT HAPPENED": "ಏನಾಯಿತು?",
        "WHAT TIME IS IT": "ಸಮಯ ಎಷ್ಟು?",
        "TIME": "ಸಮಯ",

        # Needs & Feelings
        "I NEED HELP": "ನನಗೆ ಸಹಾಯ ಬೇಕು",
        "HELP ME": "ನನಗೆ ಸಹಾಯ ಮಾಡಿ",
        "PLEASE GIVE WATER": "ದಯವಿಟ್ಟು ನೀರು ಕೊಡಿ",
        "PLEASE GIVE FOOD": "ದಯವಿಟ್ಟು ಊಟ ಕೊಡಿ",
        "I AM HUNGRY": "ನನಗೆ ಹಸಿವಾಗಿದೆ",
        "I AM THIRSTY": "ನನಗೆ ಬಾಯಾರಿಕೆಯಾಗಿದೆ",
        "I AM TIRED": "ನನಗೆ ಸುಸ್ತಾಗಿದೆ",
        "I AM SICK": "ನನಗೆ ಹುಷಾರಿಲ್ಲ",
        "I AM HAPPY": "ನಾನು ಸಂತೋಷವಾಗಿದ್ದೇನೆ",
        "I AM SAD": "ನನಗೆ ದುಃಖವಾಗಿದೆ",
        "I LOVE YOU": "ನಾನು ನಿನ್ನನ್ನು ಪ್ರೀತಿಸುತ್ತೇನೆ",
        "I UNDERSTAND": "ನನಗೆ ಅರ್ಥವಾಯಿತು",
        "I DO NOT UNDERSTAND": "ನನಗೆ ಅರ್ಥವಾಗುತ್ತಿಲ್ಲ",

        # Common actions & Emergency
        "COME HERE": "ಇಲ್ಲಿಗೆ ಬನ್ನಿ",
        "GO HOME": "ಮನೆಗೆ ಹೋಗಿ",
        "STOP": "ನಿಲ್ಲಿಸಿ",
        "WAIT": "ಕಾಯಿರಿ",
        "PLEASE WAIT": "ದಯವಿಟ್ಟು ಕಾಯಿರಿ",
        "CALL POLICE": "ಪೊಲೀಸರಿಗೆ ಕರೆ ಮಾಡಿ",
        "CALL DOCTOR": "ವೈದ್ಯರನ್ನು ಕರೆ ಮಾಡಿ",
        "CALL AMBULANCE": "ಆಂಬ್ಯುಲೆನ್ಸ್ ಕರೆಯಿರಿ",
        "WHERE IS HOSPITAL": "ಆಸ್ಪತ್ರೆ ಎಲ್ಲಿದೆ?",
        "WHERE IS TOILET": "ಶೌಚಾಲಯ ಎಲ್ಲಿದೆ?",
        "EMERGENCY": "ತುರ್ತು ಪರಿಸ್ಥಿತಿ",
        "SIGN LANGUAGE": "ಸನ್ನೆ ಭಾಷೆ",
    },
    "hi": {
        "HELLO": "नमस्ते",
        "THANKYOU": "धन्यवाद",
        "THANK YOU": "धन्यवाद",
        "THANKS": "धन्यवाद",
        "THANK YOU VERY MUCH": "बहुत धन्यवाद",
        "PLEASE": "कृपया",
        "YES": "हाँ",
        "NO": "नहीं",
        "HELP": "मदद",
        "SORRY": "माफ़ कीजिए",
        "WATER": "पानी",
        "FOOD": "खाना",
        "GOOD": "अच्छा",
        "BAD": "बुरा",
        "GOOD MORNING": "सुप्रभात",
        "GOOD AFTERNOON": "शुभ दोपहर",
        "GOOD EVENING": "शुभ संध्या",
        "GOOD NIGHT": "शुभ रात्रि",
        "HOW ARE YOU": "आप कैसे हैं?",
        "I AM FINE": "मैं ठीक हूँ",
        "NICE TO MEET YOU": "आपसे मिलकर खुशी हुई",
        "WELCOME": "स्वागत है",
        "YOU ARE WELCOME": "आपका स्वागत है",
        "SEE YOU": "फिर मिलेंगे",
        "SEE YOU AGAIN": "फिर मिलेंगे",
        "SEE YOU TOMORROW": "कल मिलेंगे",
        "TAKE CARE": "अपना ख्याल रखें",
        "WHAT IS YOUR NAME": "आपका नाम क्या है?",
        "MY NAME": "मेरा नाम",
        "WHERE ARE YOU": "आप कहाँ हैं?",
        "WHERE ARE YOU GOING": "आप कहाँ जा रहे हैं?",
        "WHAT ARE YOU DOING": "आप क्या कर रहे हैं?",
        "WHAT HAPPENED": "क्या हुआ?",
        "WHAT TIME IS IT": "कितने बजे हैं?",
        "I NEED HELP": "मुझे मदद चाहिए",
        "HELP ME": "मेरी मदद करो",
        "PLEASE GIVE WATER": "कृपया पानी दीजिए",
        "PLEASE GIVE FOOD": "कृपया खाना दीजिए",
        "I AM HUNGRY": "मुझे भूख लगी है",
        "I AM THIRSTY": "मुझे प्यास लगी है",
        "I AM TIRED": "मैं थक गया हूँ",
        "I AM SICK": "मेरी तबीयत ठीक नहीं है",
        "I LOVE YOU": "मैं आपसे प्यार करता हूँ",
        "I UNDERSTAND": "मुझे समझ आ गया",
        "I DO NOT UNDERSTAND": "मुझे समझ नहीं आया",
        "COME HERE": "यहाँ आओ",
        "GO HOME": "घर जाओ",
        "STOP": "रुकिए",
        "WAIT": "इंतजार करें",
        "CALL POLICE": "पुलिस को बुलाओ",
        "CALL DOCTOR": "डॉक्टर को बुलाओ",
        "CALL AMBULANCE": "एम्बुलेंस को बुलाओ",
        "EMERGENCY": "आपातकाल",
        "SIGN LANGUAGE": "सांकेतिक भाषा",
    }
}

_ISL_GRAMMAR_RULES = [
    (r"\b(YOU|YOUR)\s+NAME\s+WHAT\b", "WHAT IS YOUR NAME"),
    (r"\bNAME\s+(IS\s+)?WHAT\b", "WHAT IS YOUR NAME"),
    (r"\bNAME\s+(YOUR|YOU)\s+WHAT\b", "WHAT IS YOUR NAME"),
    (r"\b(YOU\s+HOW|HOW\s+YOU)\b", "HOW ARE YOU"),
    (r"\b(I|ME)\s+FINE\b", "I AM FINE"),
    (r"\b(I|ME)\s+SICK\b", "I AM SICK"),
    (r"\b(I|ME)\s+HUNGRY\b", "I AM HUNGRY"),
    (r"\b(I|ME)\s+THIRSTY\b", "I AM THIRSTY"),
    (r"\b(I|ME)\s+TIRED\b", "I AM TIRED"),
    (r"\b(HELP\s+ME|NEED\s+HELP)\b", "I NEED HELP"),
    (r"\b(WATER\s+WANT|WANT\s+WATER|WATER\s+PLEASE)\b", "PLEASE GIVE WATER"),
    (r"\b(FOOD\s+WANT|WANT\s+FOOD|FOOD\s+PLEASE)\b", "PLEASE GIVE FOOD"),
    (r"\b(TIME\s+WHAT|WHAT\s+TIME)\b", "WHAT TIME IS IT"),
    (r"\b(NICE\s+MEET\s+YOU)\b", "NICE TO MEET YOU"),
    (r"\b(SEE\s+YOU\s+LATER)\b", "SEE YOU LATER"),
    (r"\bWHERE\s+YOU\s+GO\b", "WHERE ARE YOU GOING"),
    (r"\bYOU\s+GO\s+WHERE\b", "WHERE ARE YOU GOING"),
    (r"\bYOU\s+LIVE\s+WHERE\b", "WHERE DO YOU LIVE"),
]

_SIGN_HOMOPHONES = {
    "there aunt": "their aunt",
    "there mother": "their mother",
    "there father": "their father",
    "there brother": "their brother",
    "there sister": "their sister",
    "there friend": "their friend",
    "there parents": "their parents",
    "there house": "their house",
    "there family": "their family",
    "there school": "their school",
    "there home": "their home",
    "there child": "their child",
    "there baby": "their baby",
}


def translate_text(text, code):
    """English -> Hindi/Kannada. Tries verified phrases, grammar rules, then online backends."""
    text = text.strip()
    if not text or code == "en":
        return text

    # Check verified phrase dictionary first (exact match, uppercase, no punctuation)
    norm = re.sub(r"[^\w\s]", "", text).strip().upper()
    lang_dict = _VERIFIED_TRANSLATIONS.get(code, {})
    if norm in lang_dict:
        return lang_dict[norm]

    # Apply ISL grammar normalizations
    norm_grammar = norm
    for pattern, repl in _ISL_GRAMMAR_RULES:
        norm_grammar = re.sub(pattern, repl, norm_grammar)
    if norm_grammar in lang_dict:
        return lang_dict[norm_grammar]

    # Clean text for machine translation
    text_clean = norm_grammar.lower()
    for k, v in _SIGN_HOMOPHONES.items():
        text_clean = text_clean.replace(k, v)

    errors = []
    for fn in (_google, _deep, _mymemory):
        try:
            out = fn(text_clean, code)
            if out and out.strip():
                return out.strip()
        except Exception as e:
            errors.append(f"{fn.__name__}: {e!r}")
    raise RuntimeError(" | ".join(errors))


# ------------------------------------------------------------------ speaker
class Speaker:
    NO_NET = "No internet - Hindi/Kannada need a connection"

    def __init__(self):
        self.languages = list(config.LANGUAGES)
        self.lang_index = 0
        self.status = "Ready"
        self.translation = ""      # translated text shown on screen
        self._last = None          # (spoken text, lang, mp3 path or None)
        self._lock = threading.Lock()
        self._tcache = {}
        self._seq = 0

    @property
    def language(self):
        return self.languages[self.lang_index]

    def next_language(self):
        self.lang_index = (self.lang_index + 1) % len(self.languages)
        self.translation = ""

    # ---- public API ----
    def speak(self, text):
        if text.strip():
            threading.Thread(target=self._speak, args=(text, self.language), daemon=True).start()

    def replay(self):
        if self._last:
            threading.Thread(target=self._replay, daemon=True).start()

    def translate_async(self, text):
        """Live preview: translate `text` into the current language (non-blocking)."""
        self._seq += 1
        threading.Thread(target=self._translate_job, args=(text, self.language, self._seq), daemon=True).start()

    # ---- translation helpers ----
    def _translate_cached(self, text, code):
        key = (code, text)
        if key not in self._tcache:
            self._tcache[key] = translate_text(text, code)
        return self._tcache[key]

    def _translate_job(self, text, lang, seq):
        if not text.strip():
            if seq == self._seq:
                self.translation = ""
            return
        code = config.LANGUAGES[lang]
        if (code, text) not in self._tcache and not online():
            self.status = self.NO_NET
            return
        try:
            out = self._translate_cached(text, code)
            if seq == self._seq and lang == self.language:
                self.translation = out
        except Exception as e:
            self.status = "Translation failed"
            print("Translation error:", e)

    # ---- speaking ----
    def _speak(self, text, lang):
        with self._lock:
            code = config.LANGUAGES[lang]
            spoken = text
            if code != "en":
                if (code, text) not in self._tcache and not online():
                    self.status = self.NO_NET
                    return
                try:
                    self.status = f"Translating to {lang}..."
                    spoken = self._translate_cached(text, code)
                    self.translation = spoken
                    print(f"[{lang}] {text} -> {spoken}")
                except Exception as e:
                    self.status = "Translation failed"
                    print("Translation error:", e)
                    return
            else:
                self.translation = ""

            path = os.path.join(config.CACHE_DIR, hashlib.md5(f"v3|{code}|{spoken}".encode()).hexdigest() + ".mp3")
            try:
                if not (os.path.exists(path) and os.path.getsize(path) > 0):
                    if not online():
                        raise ConnectionError("offline")
                    self.status = "Generating voice..."
                    self._synthesize(spoken, code, path)
                self._last = (spoken, lang, path)
                self._play(path)
            except Exception as e:
                print("Voice error:", repr(e))
                if not isinstance(e, ConnectionError):
                    traceback.print_exc()
                self._last = (spoken, lang, None)
                self._offline(spoken, lang)   # offline voice if one exists

    def _synthesize(self, text, code, path):
        """Write mp3 to a temp file and move it into place only when complete."""
        tmp = path + ".tmp"
        errors = []
        try:                                   # 1) clear Microsoft neural voice
            import asyncio
            import edge_tts

            async def go():
                await edge_tts.Communicate(text, VOICES[code]).save(tmp)
            asyncio.run(go())
            if os.path.exists(tmp) and os.path.getsize(tmp) > 0:
                os.replace(tmp, path)
                return
        except Exception as e:
            errors.append(f"edge-tts: {e!r}")
        try:                                   # 2) Google voice fallback
            from gtts import gTTS
            kwargs = {"tld": "co.in"} if code == "en" else {}
            gTTS(text=text, lang=code, slow=False, **kwargs).save(tmp)
            if os.path.exists(tmp) and os.path.getsize(tmp) > 0:
                os.replace(tmp, path)
                return
        except Exception as e:
            errors.append(f"gTTS: {e!r}")
        finally:
            if os.path.exists(tmp):
                os.remove(tmp)
        raise RuntimeError(" | ".join(errors))

    def _replay(self):
        with self._lock:
            text, lang, path = self._last
            if path and os.path.exists(path) and os.path.getsize(path) > 0:
                self._play(path)
            else:
                self._offline(text, lang)

    def _play(self, path):
        self.status = "Speaking..."
        if os.name == "nt":
            self._play_windows(path)
        else:
            self._play_pygame(path)
        self.status = "Ready"

    @staticmethod
    def _play_windows(path):
        import ctypes
        mci = ctypes.windll.winmm.mciSendStringW
        buf = ctypes.create_unicode_buffer(255)
        mci("close islaudio", buf, 254, 0)
        if mci(f'open "{os.path.abspath(path)}" type mpegvideo alias islaudio', buf, 254, 0):
            raise RuntimeError("Windows could not open the audio file")
        mci("play islaudio wait", buf, 254, 0)
        mci("close islaudio", buf, 254, 0)

    @staticmethod
    def _play_pygame(path):
        import pygame
        pygame.mixer.init()
        pygame.mixer.music.load(path)
        pygame.mixer.music.play()
        while pygame.mixer.music.get_busy():
            pygame.time.wait(50)

    def _offline(self, text, lang="English"):
        """Offline voice (Windows SAPI via pyttsx3). Hindi/Kannada only if such a voice is installed."""
        try:
            import pyttsx3
            eng = pyttsx3.init()
            if lang != "English":
                code = config.LANGUAGES[lang]
                match = [v for v in eng.getProperty("voices")
                         if lang.lower() in v.name.lower() or f"{code}in" in str(v.id).lower()]
                if not match:
                    self.status = (self.NO_NET if not online() else f"{lang} voice failed")
                    return
                eng.setProperty("voice", match[0].id)
            self.status = "Speaking (offline)..."
            eng.say(text)
            eng.runAndWait()
            self.status = "Ready"
        except Exception as e:
            self.status = "No speech engine available"
            print("Offline TTS error:", e)