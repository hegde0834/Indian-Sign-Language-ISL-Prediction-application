import json

with open('data/isl_phrases.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for p in data:
    print(f"{p['id']}: key='{p['key']}', ytid='{p['youtube_id']}', instructor='{p['instructor']}'")
