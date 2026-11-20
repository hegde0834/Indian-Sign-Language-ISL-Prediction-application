import json

path = "data/isl_phrases.json"
with open(path, "r", encoding="utf-8") as f:
    phrases = json.load(f)

unique_videos = {
    1: {
        "youtube_id": "y1dFFm6Q0jk",
        "embed_url": "https://www.youtube-nocookie.com/embed/y1dFFm6Q0jk?rel=0&modestbranding=1",
        "instructor": "NCERT Official ISL Demonstrator",
        "reference_url": "https://www.youtube.com/watch?v=y1dFFm6Q0jk"
    },
    2: {
        "youtube_id": "Cgw3QD4TyZg",
        "embed_url": "https://www.youtube-nocookie.com/embed/Cgw3QD4TyZg?rel=0&modestbranding=1",
        "instructor": "Talking Hands India Human Signer",
        "reference_url": "https://www.youtube.com/watch?v=Cgw3QD4TyZg"
    },
    3: {
        "youtube_id": "sLqdPipf1UM",
        "embed_url": "https://www.youtube-nocookie.com/embed/sLqdPipf1UM?rel=0&modestbranding=1",
        "instructor": "Nagendra Nayak (ISL Lesson 5)",
        "reference_url": "https://www.youtube.com/watch?v=sLqdPipf1UM"
    },
    4: {
        "youtube_id": "VtbYvVDItvg",
        "embed_url": "https://www.youtube-nocookie.com/embed/VtbYvVDItvg?start=45&rel=0&modestbranding=1",
        "instructor": "Pragya Gupta (ISL 101 Sign Medium)",
        "reference_url": "https://www.youtube.com/watch?v=VtbYvVDItvg"
    },
    5: {
        "youtube_id": "gtEjG8cLMro",
        "embed_url": "https://www.youtube-nocookie.com/embed/gtEjG8cLMro?start=42&rel=0&modestbranding=1",
        "instructor": "CADRRE Certified Master Signer",
        "reference_url": "https://www.youtube.com/watch?v=gtEjG8cLMro"
    },
    6: {
        "youtube_id": "OK7ppVdau8M",
        "embed_url": "https://www.youtube-nocookie.com/embed/OK7ppVdau8M?start=15&rel=0&modestbranding=1",
        "instructor": "Bumper Clap (ISL 25 Words Signer)",
        "reference_url": "https://www.youtube.com/watch?v=OK7ppVdau8M"
    },
    7: {
        "youtube_id": "Ucp5a38GXMM",
        "embed_url": "https://www.youtube-nocookie.com/embed/Ucp5a38GXMM?start=20&rel=0&modestbranding=1",
        "instructor": "CADRRE Certified ISL Educators",
        "reference_url": "https://www.youtube.com/watch?v=Ucp5a38GXMM"
    },
    8: {
        "youtube_id": "CaWC4P765V8",
        "embed_url": "https://www.youtube-nocookie.com/embed/CaWC4P765V8?rel=0&modestbranding=1",
        "instructor": "Goa Board of Education ISL Signer",
        "reference_url": "https://www.youtube.com/watch?v=CaWC4P765V8"
    },
    9: {
        "youtube_id": "SwGIw2creRA",
        "embed_url": "https://www.youtube-nocookie.com/embed/SwGIw2creRA?rel=0&modestbranding=1",
        "instructor": "Deaf Enabled Foundation (DEF)",
        "reference_url": "https://www.youtube.com/watch?v=SwGIw2creRA"
    },
    10: {
        "youtube_id": "L37McuHckSI",
        "embed_url": "https://www.youtube-nocookie.com/embed/L37McuHckSI?rel=0&modestbranding=1",
        "instructor": "ISLRTC (Govt. of India Official)",
        "reference_url": "https://www.youtube.com/watch?v=L37McuHckSI"
    }
}

for p in phrases:
    pid = p["id"]
    if pid in unique_videos:
        p.update(unique_videos[pid])

with open(path, "w", encoding="utf-8") as f:
    json.dump(phrases, f, indent=2, ensure_ascii=False)

print("Updated 10 phrases with 10 completely unique YouTube videos.")

