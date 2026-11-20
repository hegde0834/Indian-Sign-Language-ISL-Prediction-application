import re

with open(r'c:\ISL Major Project\speech_to_sign.js', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update MOTION_DATASET with video, poster, instructor for all 10 items
video_data = {
    1: {"video": "/assets/videos/phrase_1.mp4", "poster": "/assets/videos/phrase_1_thumb.jpg", "instructor": "NCERT Official ISL Demonstrator"},
    2: {"video": "/assets/videos/phrase_2.mp4", "poster": "/assets/videos/phrase_2_thumb.jpg", "instructor": "Talking Hands India Human Signer"},
    3: {"video": "/assets/videos/phrase_3.mp4", "poster": "/assets/videos/phrase_3_thumb.jpg", "instructor": "Nagendra Nayak (ISL Certified)"},
    4: {"video": "/assets/videos/phrase_4.mp4", "poster": "/assets/videos/phrase_4_thumb.jpg", "instructor": "Pragya Gupta (ISL 101 Sign Medium)"},
    5: {"video": "/assets/videos/phrase_5.mp4", "poster": "/assets/videos/phrase_5_thumb.jpg", "instructor": "CADRRE Certified Master Signer"},
    6: {"video": "/assets/videos/phrase_6.mp4", "poster": "/assets/videos/phrase_6_thumb.jpg", "instructor": "Bumper Clap (ISL 25 Words Signer)"},
    7: {"video": "/assets/videos/phrase_7.mp4", "poster": "/assets/videos/phrase_7_thumb.jpg", "instructor": "CADRRE Certified ISL Educators"},
    8: {"video": "/assets/videos/phrase_8.mp4", "poster": "/assets/videos/phrase_8_thumb.jpg", "instructor": "Goa Board of Education ISL Signer"},
    9: {"video": "/assets/videos/phrase_9.mp4", "poster": "/assets/videos/phrase_9_thumb.jpg", "instructor": "Deaf Enabled Foundation (DEF)"},
    10: {"video": "/assets/videos/phrase_10.mp4", "poster": "/assets/videos/phrase_10_thumb.jpg", "instructor": "ISLRTC (Govt. of India Official)"}
}

for i in range(1, 11):
    pattern = rf'(id:\s*{i},\s*\n\s*key:\s*\'[^\']+\',)'
    v = video_data[i]
    replacement = rf"""\1
      video: '{v['video']}',
      poster: '{v['poster']}',
      instructor: '{v['instructor']}',"""
    text = re.sub(pattern, replacement, text, count=1)

print("Injected video metadata into dataset.")

with open(r'c:\ISL Major Project\scratch\step1_js.js', 'w', encoding='utf-8') as f:
    f.write(text)
