"""Diagnose translation + voice:  python test_speech.py"""
import speech

for code in ("hi", "kn"):
    try:
        print(code, "->", speech.translate_text("hello how are you", code))
    except Exception as e:
        print(code, "TRANSLATION FAILED:", e)

sp = speech.Speaker()
for i, lang in enumerate(sp.languages):
    sp.lang_index = i
    print("Speaking in", lang, "...")
    sp._speak("hello how are you", lang)
    print("  status:", sp.status, "| text:", sp.translation)
