import json

path = "data/isl_phrases.json"
with open(path, "r", encoding="utf-8") as f:
    phrases = json.load(f)

for p in phrases:
    pid = p["id"]
    p["video"] = f"/assets/videos/phrase_{pid}.mp4"
    p["thumbnail"] = f"/assets/videos/phrase_{pid}_thumb.jpg"

with open(path, "w", encoding="utf-8") as f:
    json.dump(phrases, f, indent=2, ensure_ascii=False)

print(f"Updated {len(phrases)} phrases successfully.")

