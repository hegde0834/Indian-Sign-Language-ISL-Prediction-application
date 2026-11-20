import urllib.request
import json

video_ids = [
    ("1. Namaste", "y1dFFm6Q0jk"),
    ("2. Thank You", "Cgw3QD4TyZg"),
    ("3. How Are You", "sLqdPipf1UM"),
    ("4. I Am Fine", "VtbYvVDItvg"),
    ("5. What Is Your Name", "gtEjG8cLMro"),
    ("6. My Name Is", "OK7ppVdau8M"),
    ("7. Nice To Meet You", "Ucp5a38GXMM"),
    ("8. Please Help Me", "CaWC4P765V8"),
    ("9. Washroom", "SwGIw2creRA"),
    ("10. Good Morning", "L37McuHckSI")
]

for name, vid in video_ids:
    url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode())
            print(f"[OK] {name} ({vid}) -> '{data.get('title')}' by {data.get('author_name')}")
    except Exception as e:
        print(f"[FAIL] {name} ({vid}) -> Error: {e}")

