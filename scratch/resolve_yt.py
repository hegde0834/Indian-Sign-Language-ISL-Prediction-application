import urllib.request

urls = {
    "how_are_you": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEBLq6wgncBgvQvOk3UE3Q9zBHeLepIAwdT9ktW-pGr5mht9ilGvpNcYPL7bjai9BGDbFmfYUUfJqM13fvON50Sff6wUOpt6w_2ZBFfnll9gDfaIvi9SxJi_HIb_Xkghkg=",
    "what_is_your_name": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQH-SGnIJTy1bTDUqG1zE-yCwd_WwyCYMYl8aZSZv--_v8zgzzOZ6qugSOC4Doxg7K0FOMVs1ngugpkX6dsJhnCcwy-fLQTJ4fi2jmEmCLwB0x_Lo9rMOm0Gbl9jlbGQCog=",
    "my_name": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHbaNQa-uOYTz5UgzZhUzn0ST5OvX8Fl3UnibLrAGcKjsJSnSVZxmcger1oGXPF8erx4LwC9diyzfqtJkduzexSWjAKcKtGCHPLAOC19B9s9-NnkjXRKZD7syQX-gEsfoQ=",
    "name_sign": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQG1UHYXFCxxRJbKu9OE--sq4w7jAKHDZ6QfkhM5Qhq6cro-tBK69kSS8u4niF22splhyQqwF8gWWv-qiQkEJOf46Ek6WAO654vBhpwVq7qLlRoFOw3OLQMyc9Xz9j5GDTM="
}

for k, u in urls.items():
    try:
        req = urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=5) as resp:
            print(f"{k} -> {resp.geturl()}")
    except Exception as e:
        print(f"{k} -> Error: {e}")
