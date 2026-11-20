import re

with open(r'c:\ISL Major Project\speech_to_sign.js', 'r', encoding='utf-8') as f:
    text = f.read()

ytids = {
    1: 'y1dFFm6Q0jk',
    2: 'Cgw3QD4TyZg',
    3: 'sLqdPipf1UM',
    4: 'VtbYvVDItvg',
    5: 'gtEjG8cLMro',
    6: 'OK7ppVdau8M',
    7: 'Ucp5a38GXMM',
    8: 'CaWC4P765V8',
    9: 'SwGIw2creRA',
    10: 'L37McuHckSI'
}

for i in range(1, 11):
    pat = rf"(id:\s*{i},\s*\n\s*key:\s*'[^']+',)"
    rep = rf"\1\n      youtube_id: '{ytids[i]}',"
    text = re.sub(pat, rep, text, count=1)

# Update dom reference: add humanVideoIframe
old_dom = "humanPlayerWrap: document.getElementById('humanPlayerWrap'),"
new_dom = "humanPlayerWrap: document.getElementById('humanPlayerWrap'),\n    humanVideoIframe: document.getElementById('humanVideoIframe'),"
assert old_dom in text, "old_dom not found"
text = text.replace(old_dom, new_dom, 1)

# Update playHumanVideoForCurrent to load YouTube embed URL with autoplay
old_play_video = """  function playHumanVideoForCurrent(onComplete) {
    if (!dom.realHumanVideo || !state.currentPhrase) return;
    const p = state.currentPhrase;
    if (dom.humanInstructorName) {
      dom.humanInstructorName.textContent = p.instructor || 'Certified ISL Demonstrator';
    }

    const videoSrc = p.video || `/assets/videos/phrase_${p.id}.mp4`;
    if (!dom.realHumanVideo.src.endsWith(videoSrc.replace(/^\\//, ''))) {
      dom.realHumanVideo.src = videoSrc;
      if (p.poster) dom.realHumanVideo.poster = p.poster;
      dom.realHumanVideo.load();
    }

    dom.realHumanVideo.playbackRate = state.speedMultiplier;
    dom.realHumanVideo.currentTime = 0;

    dom.realHumanVideo.onended = () => {
      if (onComplete) {
        onComplete();
      } else {
        // Continuous replay loop for current sign
        dom.realHumanVideo.play().catch(() => {});
      }
    };

    const playPromise = dom.realHumanVideo.play();
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        console.log('[ISL Video] Waiting for interaction to autoplay:', err);
      });
    }
  }"""

new_play_video = """  function playHumanVideoForCurrent(onComplete) {
    if (!state.currentPhrase) return;
    const p = state.currentPhrase;
    if (dom.humanInstructorName) {
      dom.humanInstructorName.textContent = p.instructor || 'Certified ISL Demonstrator';
    }

    // 1. If humanVideoIframe exists, embed authentic certified human video
    if (dom.humanVideoIframe && p.youtube_id) {
      const embedUrl = `https://www.youtube-nocookie.com/embed/${p.youtube_id}?rel=0&modestbranding=1&autoplay=1`;
      if (dom.humanVideoIframe.src !== embedUrl) {
        dom.humanVideoIframe.src = embedUrl;
      }
    }

    // 2. Fallback / local video if present
    if (dom.realHumanVideo) {
      const videoSrc = p.video || `/assets/videos/phrase_${p.id}.mp4`;
      if (!dom.realHumanVideo.src.endsWith(videoSrc.replace(/^\\//, ''))) {
        dom.realHumanVideo.src = videoSrc;
        if (p.poster) dom.realHumanVideo.poster = p.poster;
        dom.realHumanVideo.load();
      }
      dom.realHumanVideo.playbackRate = state.speedMultiplier;
      dom.realHumanVideo.currentTime = 0;
      dom.realHumanVideo.play().catch(() => {});
    }

    if (onComplete) {
      setTimeout(onComplete, 3500 / state.speedMultiplier);
    }
  }"""

assert old_play_video in text, "old_play_video not found"
text = text.replace(old_play_video, new_play_video, 1)

with open(r'c:\ISL Major Project\speech_to_sign.js', 'w', encoding='utf-8') as f:
    f.write(text)

print("speech_to_sign.js updated with real human video iframe logic!")
