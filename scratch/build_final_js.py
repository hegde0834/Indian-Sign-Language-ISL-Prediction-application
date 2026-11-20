with open(r'c:\ISL Major Project\scratch\step1_js.js', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update state
old_state = """  const state = {
    phrases: MOTION_DATASET,
    currentPhrase: MOTION_DATASET[0],
    speedMultiplier: 1.0,
    isListening: false,
    recognition: null,
    selectedLang: 'en-IN',
    isAnimating: false,
    activeSequence: [],
    sequenceIndex: 0,
    currentStepIndex: 0
  };"""

new_state = """  const state = {
    phrases: MOTION_DATASET,
    currentPhrase: MOTION_DATASET[0],
    viewMode: 'human', // 'human' (Real Certified Human Signer) or 'avatar' (Realistic 3D Human Avatar)
    speedMultiplier: 1.0,
    isListening: false,
    recognition: null,
    selectedLang: 'en-IN',
    isAnimating: false,
    activeSequence: [],
    sequenceIndex: 0,
    currentStepIndex: 0
  };"""

assert old_state in text, "old_state not found"
text = text.replace(old_state, new_state)

# 2. Update dom
old_dom = """    avatarCanvas: document.getElementById('avatarCanvas'),
    hudActionTag: document.getElementById('hudActionTag'),
    hudPhraseText: document.getElementById('hudPhraseText'),
    hudSequenceTracker: document.getElementById('hudSequenceTracker'),"""

new_dom = """    avatarCanvas: document.getElementById('avatarCanvas'),
    humanPlayerWrap: document.getElementById('humanPlayerWrap'),
    realHumanVideo: document.getElementById('realHumanVideo'),
    humanInstructorBadge: document.getElementById('humanInstructorBadge'),
    humanInstructorName: document.getElementById('humanInstructorName'),
    btnModeHuman: document.getElementById('btnModeHuman'),
    btnModeAvatar: document.getElementById('btnModeAvatar'),
    hudOrbitHint: document.getElementById('hudOrbitHint'),
    hudActionTag: document.getElementById('hudActionTag'),
    hudPhraseText: document.getElementById('hudPhraseText'),
    hudSequenceTracker: document.getElementById('hudSequenceTracker'),"""

assert old_dom in text, "old_dom not found"
text = text.replace(old_dom, new_dom)

# 3. Add mode controller & human video player
mode_controller_code = """
  // ---------------------------------------------------------------------------
  // 4B. PRESENTATION MODE CONTROLLER (Real Human Signer vs 3D Human Avatar)
  // ---------------------------------------------------------------------------
  function setViewMode(mode) {
    state.viewMode = mode;
    if (mode === 'human') {
      if (dom.btnModeHuman) dom.btnModeHuman.classList.add('active');
      if (dom.btnModeAvatar) dom.btnModeAvatar.classList.remove('active');
      if (dom.humanPlayerWrap) dom.humanPlayerWrap.style.display = 'flex';
      if (dom.avatarCanvas) dom.avatarCanvas.style.display = 'none';
      if (dom.btnResetCamera) dom.btnResetCamera.style.display = 'none';
      if (dom.hudOrbitHint) dom.hudOrbitHint.style.display = 'none';

      // Play authentic human demonstration
      playHumanVideoForCurrent();
    } else {
      if (dom.btnModeAvatar) dom.btnModeAvatar.classList.add('active');
      if (dom.btnModeHuman) dom.btnModeHuman.classList.remove('active');
      if (dom.humanPlayerWrap) dom.humanPlayerWrap.style.display = 'none';
      if (dom.avatarCanvas) dom.avatarCanvas.style.display = 'block';
      if (dom.btnResetCamera) dom.btnResetCamera.style.display = 'inline-flex';
      if (dom.hudOrbitHint) dom.hudOrbitHint.style.display = 'inline-flex';

      // Pause human video and trigger realistic 3D human avatar
      if (dom.realHumanVideo) dom.realHumanVideo.pause();
      if (state.currentPhrase) {
        playPhraseAnimation(state.currentPhrase);
      }
    }
  }

  function playHumanVideoForCurrent(onComplete) {
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
  }
"""

target_pos = text.find('  // ---------------------------------------------------------------------------\n  // 5. TRANSLATE TO SIGN TRIGGER')
assert target_pos != -1, "Target pos for mode controller not found"
text = text[:target_pos] + mode_controller_code + "\n" + text[target_pos:]

# 4. Update playNextInSequence to support both Human Video and Avatar
old_playNext = """    populateStepBadges(current);

    // Run the animation
    playPhraseAnimation(current, () => {
      state.sequenceIndex++;
      setTimeout(playNextInSequence, 400 / state.speedMultiplier);
    });"""

new_playNext = """    populateStepBadges(current);

    if (state.viewMode === 'human') {
      // Play Real Human Video
      playHumanVideoForCurrent(() => {
        state.sequenceIndex++;
        if (state.sequenceIndex < state.activeSequence.length) {
          setTimeout(playNextInSequence, 350 / state.speedMultiplier);
        } else {
          state.isAnimating = false;
          if (dom.hudActionTag) {
            dom.hudActionTag.textContent = '● SIGN COMPLETE';
            dom.hudActionTag.style.color = '#10b981';
          }
        }
      });
    } else {
      // Play 3D Human Avatar Animation
      playPhraseAnimation(current, () => {
        state.sequenceIndex++;
        if (state.sequenceIndex < state.activeSequence.length) {
          setTimeout(playNextInSequence, 400 / state.speedMultiplier);
        } else {
          state.isAnimating = false;
          if (dom.hudActionTag) {
            dom.hudActionTag.textContent = '● SIGN COMPLETE';
            dom.hudActionTag.style.color = '#10b981';
          }
        }
      });
    }"""

assert old_playNext in text, "old_playNext not found"
text = text.replace(old_playNext, new_playNext)

# 5. Connect mode buttons and replay in setupEventListeners
old_listeners = """    // Speed Controls
    dom.speedBtns.forEach(btn => {"""

new_listeners = """    // Presentation Mode Toggle (Real Human Signer vs 3D Human Avatar)
    if (dom.btnModeHuman) {
      dom.btnModeHuman.addEventListener('click', () => setViewMode('human'));
    }
    if (dom.btnModeAvatar) {
      dom.btnModeAvatar.addEventListener('click', () => setViewMode('avatar'));
    }

    // Speed Controls
    dom.speedBtns.forEach(btn => {"""

assert old_listeners in text, "old_listeners not found"
text = text.replace(old_listeners, new_listeners)

# Update replay button
old_replay = """    // Replay button
    if (dom.btnReplaySign) {
      dom.btnReplaySign.addEventListener('click', () => {
        if (state.currentPhrase) {
          playPhraseSequence([state.currentPhrase]);
        }
      });
    }"""

new_replay = """    // Replay button
    if (dom.btnReplaySign) {
      dom.btnReplaySign.addEventListener('click', () => {
        if (state.currentPhrase) {
          if (state.viewMode === 'human') {
            playHumanVideoForCurrent();
          } else {
            playPhraseSequence([state.currentPhrase]);
          }
        }
      });
    }"""

assert old_replay in text, "old_replay not found"
text = text.replace(old_replay, new_replay)

# Update speed listener to also update video playbackRate
old_speed = """        btn.classList.add('active');
        state.speedMultiplier = parseFloat(btn.getAttribute('data-speed')) || 1.0;
      });"""

new_speed = """        btn.classList.add('active');
        state.speedMultiplier = parseFloat(btn.getAttribute('data-speed')) || 1.0;
        if (dom.realHumanVideo) {
          dom.realHumanVideo.playbackRate = state.speedMultiplier;
        }
      });"""

assert old_speed in text, "old_speed not found"
text = text.replace(old_speed, new_speed)

with open(r'c:\ISL Major Project\scratch\step2_js.js', 'w', encoding='utf-8') as f:
    f.write(text)

print("Step 2 completed successfully.")
