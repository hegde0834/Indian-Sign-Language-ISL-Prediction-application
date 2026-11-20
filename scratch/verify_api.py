import urllib.request, json
req = urllib.request.Request("http://127.0.0.1:5000/api/phrases", headers={"User-Agent": "Mozilla/5.0"})
with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read().decode())
for p in data["phrases"]:
    print(f"Lesson {p['id']}: {p['phrase']} -> {p['youtube_id']} ({p['instructor']})")

