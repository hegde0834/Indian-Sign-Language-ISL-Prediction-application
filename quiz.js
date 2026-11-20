/**
 * ISL Detect – 26-Letter Indian Sign Language Prediction Quiz Engine
 * Integrates real-time AI computer vision inference, MediaPipe skeleton tracking,
 * visual flashcard quizzes, Web Audio synthesis, and 26-letter mastery analytics.
 */

(function () {
  'use strict';

  // -------------------------------------------------------------------------
  // 1. Core Audio Synthesizer (Zero-Latency Web Audio API)
  // -------------------------------------------------------------------------
  class SoundFX {
    constructor() {
      this.ctx = null;
      this.enabled = true;
      this.initCtx();
    }

    initCtx() {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      } catch (e) {
        console.warn('Web Audio not supported', e);
      }
    }

    resume() {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    playChime() {
      if (!this.enabled || !this.ctx) return;
      this.resume();
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.exponentialRampToValueAtTime(880.0, now + 0.12); // A5

      osc2.frequency.setValueAtTime(880.0, now);
      osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.14); // D6

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.45);
      osc2.stop(now + 0.45);
    }

    playWrong() {
      if (!this.enabled || !this.ctx) return;
      this.resume();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.28);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    }

    playTick() {
      if (!this.enabled || !this.ctx) return;
      this.resume();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    }

    playFanfare() {
      if (!this.enabled || !this.ctx) return;
      this.resume();
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const start = this.ctx.currentTime + i * 0.11;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.18, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(start);
        osc.stop(start + 0.45);
      });
    }

    speak(text) {
      if (!this.enabled || !window.speechSynthesis) return;
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.rate = 1.0;
        utter.pitch = 1.0;
        utter.lang = 'en-IN';
        window.speechSynthesis.speak(utter);
      } catch (e) {
        // Fallback silently if speech synthesis fails
      }
    }
  }

  const sound = new SoundFX();

  // -------------------------------------------------------------------------
  // 2. Comprehensive 26-Letter Dataset (Fallback Embedded)
  // -------------------------------------------------------------------------
  const FALLBACK_LETTERS = [
    { letter: 'A', name: 'Letter A', category: 'Vowel', is_vowel: true, image: '/assets/images/quiz_letters/a.jpg', description: 'Both hands form clenched fists with both thumbs pointing upwards and touching at their tips.', tips: 'Touch your thumb tips together firmly while keeping other fingers tucked in closed fists.' },
    { letter: 'B', name: 'Letter B', category: 'Consonant', is_vowel: false, image: '/assets/images/quiz_letters/b.jpg', description: 'Both hands join index fingers and thumbs into two touching circular loops (resembling eyeglasses or the letter "B").', tips: 'Make two "O" circles with thumb and index finger on each hand and touch the circles together.' },
    { letter: 'C', name: 'Letter C', category: 'Consonant', is_vowel: false, image: '/assets/images/quiz_letters/c.jpg', description: 'One hand curves all fingers and the thumb into a distinct, open "C" shape facing sideways.', tips: 'Curve your palm and fingers into an open arc, holding your hand sideways to the camera.' },
    { letter: 'D', name: 'Letter D', category: 'Consonant', is_vowel: false, image: '/assets/images/quiz_letters/d.jpg', description: 'Left index finger points upward while the right hand curves its index finger and thumb to meet it, forming the upright "D".', tips: 'Hold left index finger straight up as the vertical stem; curve right thumb and index into a semicircle touching the left index.' },
    { letter: 'E', name: 'Letter E', category: 'Vowel', is_vowel: true, image: '/assets/images/quiz_letters/e.jpg', description: 'Left hand held open with fingers spread; the right index finger touches the tip of the left index finger (first vowel).', tips: 'Touch the tip of your left index finger with your right index finger.' },
    { letter: 'F', name: 'Letter F', category: 'Consonant', is_vowel: false, image: '/assets/images/quiz_letters/f.jpg', description: 'Two fingers (index and middle) on both hands cross horizontally over one another in a crossbar formation.', tips: 'Extend index and middle fingers on both hands and lay one pair across the other like a cross.' },
    { letter: 'G', name: 'Letter G', category: 'Consonant', is_vowel: false, image: '/assets/images/quiz_letters/g.jpg', description: 'Both hands clenched in fists placed horizontally next to each other, knuckles aligned.', tips: 'Clench both fists and place them side-by-side with knuckles facing forward.' },
    { letter: 'H', name: 'Letter H', category: 'Consonant', is_vowel: false, image: '/assets/images/quiz_letters/h.jpg', description: 'Right hand flat with fingers straight, resting horizontally across the flat upward-facing palm of the left hand.', tips: 'Lay your flat right palm crosswise on top of your flat left palm.' },
    { letter: 'I', name: 'Letter I', category: 'Vowel', is_vowel: true, image: '/assets/images/quiz_letters/i.jpg', description: 'Left hand held open with fingers spread; the right index finger touches the tip of the left middle finger (second vowel).', tips: 'Point your right index finger directly at the tip of your left middle finger.' },
    { letter: 'J', name: 'Letter J', category: 'Consonant', is_vowel: false, image: '/assets/images/quiz_letters/j.jpg', description: 'Right index finger touches the tip of the left middle finger and traces the curve of the letter "J" down onto the palm.', tips: 'Start at the tip of the left middle finger and trace a hook downward across the palm.' },
    { letter: 'K', name: 'Letter K', category: 'Consonant', is_vowel: false, image: '/assets/images/quiz_letters/k.jpg', description: 'Left index finger held straight up; the right index finger curves and hooks against the left index knuckle.', tips: 'Left index points upward; right index forms a hook pressing against the middle joint of the left index.' },
    { letter: 'L', name: 'Letter L', category: 'Consonant', is_vowel: false, image: '/assets/images/quiz_letters/l.jpg', description: 'One hand forms a clean 90-degree right angle between the extended thumb and index finger, with other fingers curled.', tips: 'Extend thumb outward and index finger upward to form a sharp "L" angle.' },
    { letter: 'M', name: 'Letter M', category: 'Consonant', is_vowel: false, image: '/assets/images/quiz_letters/m.jpg', description: 'Right hand places three extended fingertips (index, middle, ring) downwards onto the open flat palm of the left hand.', tips: 'Rest three fingertips (index, middle, ring) of your right hand downward on your flat left palm.' },
    { letter: 'N', name: 'Letter N', category: 'Consonant', is_vowel: false, image: '/assets/images/quiz_letters/n.jpg', description: 'Right hand places two extended fingertips (index and middle) downwards onto the open flat palm of the left hand.', tips: 'Rest two fingertips (index and middle) of your right hand downward on your flat left palm.' },
    { letter: 'O', name: 'Letter O', category: 'Vowel', is_vowel: true, image: '/assets/images/quiz_letters/o.jpg', description: 'Left hand held open with fingers spread; the right index finger touches the tip of the left ring finger (fourth vowel).', tips: 'Touch the tip of your left ring finger with the tip of your right index finger.' },
    { letter: 'P', name: 'Letter P', category: 'Consonant', is_vowel: false, image: '/assets/images/quiz_letters/p.jpg', description: 'Left index finger points vertically upward; right index finger and thumb form a loop touching near the top of the left index.', tips: 'Left index finger held vertical; right thumb and index make a circular loop touching the upper left index finger.' },
    { letter: 'Q', name: 'Letter Q', category: 'Consonant', is_vowel: false, image: '/assets/images/quiz_letters/q.jpg', description: 'Left hand forms a circular loop with thumb and index finger; the right index finger hooks into the loop from above.', tips: 'Make a circle with left thumb and index; hook your right index finger into the circle from the top.' },
    { letter: 'R', name: 'Letter R', category: 'Consonant', is_vowel: false, image: '/assets/images/quiz_letters/r.jpg', description: 'Right index finger curled into a gentle hook shape and placed horizontally against the open palm of the left hand.', tips: 'Curl right index finger into a ring/hook and place it flat against your open left palm.' },
    { letter: 'S', name: 'Letter S', category: 'Consonant', is_vowel: false, image: '/assets/images/quiz_letters/s.jpg', description: 'Both hands hook their little fingers (pinkies) together securely in a linked lock.', tips: 'Extend both pinky fingers and hook them tightly together while tucking other fingers in.' },
    { letter: 'T', name: 'Letter T', category: 'Consonant', is_vowel: false, image: '/assets/images/quiz_letters/t.jpg', description: 'Right extended index finger touches perpendicular to the outer edge of the upright left hand.', tips: 'Keep left hand open vertically; touch your right index finger horizontally against its outer palm edge.' },
    { letter: 'U', name: 'Letter U', category: 'Vowel', is_vowel: true, image: '/assets/images/quiz_letters/u.jpg', description: 'Left hand held open with fingers spread; the right index finger touches the tip of the left little finger (fifth vowel).', tips: 'Touch the tip of your left pinky finger with the tip of your right index finger.' },
    { letter: 'V', name: 'Letter V', category: 'Consonant', is_vowel: false, image: '/assets/images/quiz_letters/v.jpg', description: 'Right hand forms a distinct "V" victory shape with index and middle fingers, resting gently on the open palm of the left hand.', tips: 'Make a "V" peace sign with right index and middle fingers, and set their tips onto your open left palm.' },
    { letter: 'W', name: 'Letter W', category: 'Consonant', is_vowel: false, image: '/assets/images/quiz_letters/w.jpg', description: 'Both hands interlock all fingers diagonally with fingertips pointing upward in a weave.', tips: 'Intertwine the fingers of both hands together pointing diagonally upwards like a basket weave.' },
    { letter: 'X', name: 'Letter X', category: 'Consonant', is_vowel: false, image: '/assets/images/quiz_letters/x.jpg', description: 'Both index fingers are extended and crossed over each other at their midpoints to form an "X".', tips: 'Extend both index fingers and cross them across each other to make a crisp "X" cross.' },
    { letter: 'Y', name: 'Letter Y', category: 'Consonant', is_vowel: false, image: '/assets/images/quiz_letters/y.jpg', description: 'Right extended index finger touches directly into the cleft (V-space) between the thumb and index finger of the left open hand.', tips: 'Open left hand with thumb wide; touch right index finger right into the web between left thumb and index.' },
    { letter: 'Z', name: 'Letter Z', category: 'Consonant', is_vowel: false, image: '/assets/images/quiz_letters/z.jpg', description: 'Left open palm held vertical with fingertips pointing upward; right fingertips touch horizontally against the left palm surface.', tips: 'Hold left hand open facing sideways; place your right fingertips horizontally flat against the left palm.' }
  ];

  let masterLetters = [...FALLBACK_LETTERS];

  // -------------------------------------------------------------------------
  // 3. Quiz State Management
  // -------------------------------------------------------------------------
  const state = {
    mode: 'camera', // 'camera' | 'visual-photo' | 'visual-letter'
    curriculum: 'all', // 'all' | 'vowels' | 'sprint10' | 'part1' | 'part2' | 'weak'
    shuffle: true,
    allowHints: true,
    soundOn: true,

    // Active Quiz Session
    activeQuestions: [],
    currentIndex: 0,
    score: 0,
    streak: 0,
    longestStreak: 0,
    correctFirstTry: 0,
    hintsUsed: 0,
    startTime: 0,
    elapsedSeconds: 0,
    timerInterval: null,
    isCompleted: false,

    // Per-letter performance record (Map letter char -> status)
    // status: 'correct' | 'hinted' | 'missed'
    performance: {},

    // Camera Prediction Session
    stream: null,
    isCameraRunning: false,
    isPredicting: false,
    holdFrames: 0,
    REQUIRED_HOLD_FRAMES: 5, // ~0.5s of steady correct gesture commitment
    currentHintRevealed: false,

    // Visual Quiz State
    visualSelected: false,
    currentOptions: [],
    correctOptionIndex: -1
  };

  // -------------------------------------------------------------------------
  // 4. DOM Elements
  // -------------------------------------------------------------------------
  const dom = {
    // Top Window Elements
    btnSoundToggle: document.getElementById('btn-sound-toggle'),
    soundIcon: document.getElementById('sound-icon'),
    backendStatus: document.getElementById('backend-status'),
    backendStatusText: document.getElementById('backend-status-text'),

    // Screens
    screenSetup: document.getElementById('screen-setup'),
    screenGameplay: document.getElementById('screen-gameplay'),
    screenResults: document.getElementById('screen-results'),

    // Setup Form
    modeCards: document.querySelectorAll('.mode-card'),
    curriculumChips: document.querySelectorAll('.curriculum-chip'),
    optShuffle: document.getElementById('opt-shuffle'),
    optHints: document.getElementById('opt-hints'),
    optSound: document.getElementById('opt-sound'),
    btnStartQuiz: document.getElementById('btn-start-quiz'),

    // HUD
    hudQIndex: document.getElementById('hud-q-index'),
    hudModeText: document.getElementById('hud-mode-text'),
    hudScore: document.getElementById('hud-score'),
    hudStreak: document.getElementById('hud-streak'),
    hudStreakMult: document.getElementById('hud-streak-mult'),
    hudStreakContainer: document.getElementById('hud-streak-container'),
    hudTimer: document.getElementById('hud-timer'),
    btnAbortQuiz: document.getElementById('btn-abort-quiz'),
    letterProgressStrip: document.getElementById('letterProgressStrip'),

    // Camera Arena
    arenaCamera: document.getElementById('arenaCamera'),
    cameraTargetLetter: document.getElementById('camera-target-letter'),
    cameraTargetName: document.getElementById('camera-target-name'),
    cameraTargetCategory: document.getElementById('camera-target-category'),
    cameraTargetShort: document.getElementById('camera-target-short'),
    btnCameraHint: document.getElementById('btn-camera-hint'),
    btnCameraHintText: document.getElementById('btn-camera-hint-text'),
    btnCameraSkip: document.getElementById('btn-camera-skip'),
    cameraHintPreview: document.getElementById('cameraHintPreview'),
    cameraHintImg: document.getElementById('camera-hint-img'),
    cameraHintDesc: document.getElementById('camera-hint-desc'),
    btnCloseHint: document.getElementById('btn-close-hint'),

    quizWebcam: document.getElementById('quiz-webcam'),
    quizSkeletonCanvas: document.getElementById('quiz-skeleton-canvas'),
    streamStatusText: document.getElementById('stream-status-text'),
    cameraHandsBadge: document.getElementById('camera-hands-badge'),
    btnToggleCam: document.getElementById('btn-toggle-cam'),
    liveDetectedSign: document.getElementById('live-detected-sign'),
    liveDetectedConf: document.getElementById('live-detected-conf'),
    holdStatusLabel: document.getElementById('hold-status-label'),
    holdPercentLabel: document.getElementById('hold-percent-label'),
    liveHoldMeter: document.getElementById('live-hold-meter'),
    liveTop3Strip: document.getElementById('live-top3-strip'),
    targetSuccessBanner: document.getElementById('targetSuccessBanner'),
    targetSuccessPoints: document.getElementById('targetSuccessPoints'),
    floatingScoreTag: document.getElementById('floatingScoreTag'),
    cameraFeedCard: document.querySelector('.camera-feed-card'),
    cameraTargetRing: document.querySelector('.target-letter-ring'),

    // Visual Arena
    arenaVisual: document.getElementById('arenaVisual'),
    visualQTypeBadge: document.getElementById('visual-q-type-badge'),
    visualQPrompt: document.getElementById('visual-q-prompt'),
    visualPhotoWrap: document.getElementById('visualPhotoWrap'),
    visualMainImage: document.getElementById('visual-main-image'),
    visualLetterWrap: document.getElementById('visualLetterWrap'),
    visualLargeLetter: document.getElementById('visual-large-letter'),
    visualOptionsGrid: document.getElementById('visualOptionsGrid'),
    visualFeedbackCard: document.getElementById('visualFeedbackCard'),
    feedbackStatusRow: document.querySelector('.feedback-status-row'),
    feedbackIcon: document.getElementById('feedback-icon'),
    feedbackHeading: document.getElementById('feedback-heading'),
    feedbackScoreAdd: document.getElementById('feedback-score-add'),
    feedbackExplanation: document.getElementById('feedback-explanation'),
    btnNextQuestion: document.getElementById('btn-next-question'),

    // Results Screen
    resultsRankBadge: document.getElementById('results-rank-badge'),
    resultsRankTitle: document.getElementById('results-rank-title'),
    resultsLeadText: document.getElementById('results-lead-text'),
    resScore: document.getElementById('res-score'),
    resAccuracy: document.getElementById('res-accuracy'),
    resCorrect: document.getElementById('res-correct'),
    resStreak: document.getElementById('res-streak'),
    resTime: document.getElementById('res-time'),
    lettersMatrixGrid: document.getElementById('lettersMatrixGrid'),
    btnRetakeQuiz: document.getElementById('btn-retake-quiz'),
    btnPracticeWeak: document.getElementById('btn-practice-weak'),
    weakCountBadge: document.getElementById('weak-count-badge'),
    confettiCanvas: document.getElementById('results-confetti-canvas'),

    // Modal
    letterModal: document.getElementById('letterModal'),
    modalBackdrop: document.getElementById('modalBackdrop'),
    btnModalClose: document.getElementById('btn-modal-close'),
    btnModalOk: document.getElementById('btn-modal-ok'),
    btnModalPronounce: document.getElementById('btn-modal-pronounce'),
    modalLetterChar: document.getElementById('modal-letter-char'),
    modalLetterName: document.getElementById('modal-letter-name'),
    modalImg: document.getElementById('modal-img'),
    modalCategory: document.getElementById('modal-category'),
    modalDesc: document.getElementById('modal-desc'),
    modalTips: document.getElementById('modal-tips')
  };

  // Offscreen canvas for frame capture (16:9 ratio 640x360)
  const offCanvas = document.createElement('canvas');
  offCanvas.width = 640;
  offCanvas.height = 360;
  const offCtx = offCanvas.getContext('2d');
  const skeletonCtx = dom.quizSkeletonCanvas.getContext('2d');

  // MediaPipe bone connections (standard 21 hand landmarks)
  const CONNECTIONS = [
    [0, 1], [1, 2], [2, 3], [3, 4],     // Thumb
    [0, 5], [5, 6], [6, 7], [7, 8],     // Index
    [5, 9], [9, 10], [10, 11], [11, 12], // Middle
    [9, 13], [13, 14], [14, 15], [15, 16], // Ring
    [13, 17], [17, 18], [18, 19], [19, 20], // Pinky
    [0, 17] // Palm base
  ];

  // -------------------------------------------------------------------------
  // 5. Backend Letters Fetch & Health Check
  // -------------------------------------------------------------------------
  async function loadLetters() {
    try {
      const res = await fetch('/api/quiz/letters');
      if (res.ok) {
        const data = await res.json();
        if (data.letters && data.letters.length === 26) {
          masterLetters = data.letters;
          console.log(`[Quiz] Loaded ${masterLetters.length} letters from backend.`);
        }
      }
    } catch (e) {
      console.warn('[Quiz] Using built-in 26 letters dataset.', e);
    }
  }

  async function checkBackendHealth() {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        dom.backendStatusText.textContent = 'AI Engine Online';
        dom.backendStatus.style.color = '#34d399';
      } else {
        dom.backendStatusText.textContent = 'AI Engine Offline';
        dom.backendStatus.style.color = '#ef4444';
      }
    } catch (e) {
      dom.backendStatusText.textContent = 'Standalone Mode';
      dom.backendStatus.style.color = '#fbbf24';
    }
  }

  // -------------------------------------------------------------------------
  // 6. Audio Toggle & Helper
  // -------------------------------------------------------------------------
  function setupSoundToggle() {
    dom.btnSoundToggle.addEventListener('click', () => {
      sound.enabled = !sound.enabled;
      state.soundOn = sound.enabled;
      dom.soundIcon.textContent = sound.enabled ? '🔊' : '🔇';
      dom.optSound.checked = sound.enabled;
    });

    dom.optSound.addEventListener('change', (e) => {
      sound.enabled = e.target.checked;
      state.soundOn = sound.enabled;
      dom.soundIcon.textContent = sound.enabled ? '🔊' : '🔇';
    });
  }

  // -------------------------------------------------------------------------
  // 7. Setup Screen Controls
  // -------------------------------------------------------------------------
  function initSetupScreen() {
    // Mode selector cards
    dom.modeCards.forEach((card) => {
      card.addEventListener('click', () => {
        dom.modeCards.forEach((c) => c.classList.remove('active'));
        card.classList.add('active');
        const radio = card.querySelector('input[type="radio"]');
        if (radio) {
          radio.checked = true;
          state.mode = radio.value;
        }
        sound.playTick();
      });
    });

    // Curriculum chips
    dom.curriculumChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        dom.curriculumChips.forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
        state.curriculum = chip.getAttribute('data-curriculum');
        sound.playTick();
      });
    });

    // Start button
    dom.btnStartQuiz.addEventListener('click', () => {
      state.shuffle = dom.optShuffle.checked;
      state.allowHints = dom.optHints.checked;
      startQuizSession();
    });

    // Abort button
    dom.btnAbortQuiz.addEventListener('click', () => {
      if (confirm('Are you sure you want to exit the current quiz session?')) {
        abortQuizSession();
      }
    });

    // Retake buttons
    dom.btnRetakeQuiz.addEventListener('click', () => {
      startQuizSession();
    });

    dom.btnPracticeWeak.addEventListener('click', () => {
      state.curriculum = 'weak';
      startQuizSession();
    });
  }

  // -------------------------------------------------------------------------
  // 8. Quiz Session Lifecycle
  // -------------------------------------------------------------------------
  function buildQuestionsList() {
    let list = [];

    if (state.curriculum === 'all') {
      list = [...masterLetters];
    } else if (state.curriculum === 'vowels') {
      list = masterLetters.filter((l) => l.is_vowel);
    } else if (state.curriculum === 'sprint10') {
      const shuffled = [...masterLetters].sort(() => 0.5 - Math.random());
      list = shuffled.slice(0, 10);
    } else if (state.curriculum === 'part1') {
      list = masterLetters.slice(0, 13); // A to M
    } else if (state.curriculum === 'part2') {
      list = masterLetters.slice(13); // N to Z
    } else if (state.curriculum === 'weak') {
      // Collect letters marked as 'missed' or 'hinted'
      const weakChars = Object.keys(state.performance).filter(
        (ch) => state.performance[ch] === 'missed' || state.performance[ch] === 'hinted'
      );
      if (weakChars.length > 0) {
        list = masterLetters.filter((l) => weakChars.includes(l.letter));
      } else {
        list = [...masterLetters];
      }
    }

    if (state.shuffle && state.curriculum !== 'vowels') {
      list = list.sort(() => 0.5 - Math.random());
    }

    return list;
  }

  function startQuizSession() {
    state.activeQuestions = buildQuestionsList();
    if (state.activeQuestions.length === 0) {
      state.activeQuestions = [...masterLetters];
    }

    state.currentIndex = 0;
    state.score = 0;
    state.streak = 0;
    state.longestStreak = 0;
    state.correctFirstTry = 0;
    state.hintsUsed = 0;
    state.performance = {};
    state.isCompleted = false;
    state.startTime = Date.now();
    state.elapsedSeconds = 0;

    // Reset UI
    dom.hudScore.textContent = '0';
    dom.hudStreak.textContent = '0';
    dom.hudStreakMult.textContent = '1x';
    dom.hudStreakContainer.classList.remove('active');

    // Update Mode text
    const modeLabels = {
      camera: '📸 AI Camera Prediction',
      'visual-photo': '🖼️ Recognize the Sign',
      'visual-letter': '🔤 Pick the Matching Sign'
    };
    dom.hudModeText.textContent = modeLabels[state.mode] || 'AI Mode';

    // Start Timer
    clearInterval(state.timerInterval);
    state.timerInterval = setInterval(updateTimerDisplay, 1000);
    updateTimerDisplay();

    // Render Progress Strip
    renderProgressStrip();

    // Switch Screens
    showScreen('screen-gameplay');

    // Launch Arena based on mode
    if (state.mode === 'camera') {
      dom.arenaCamera.removeAttribute('hidden');
      dom.arenaCamera.style.display = 'grid';
      dom.arenaVisual.setAttribute('hidden', '');
      dom.arenaVisual.style.display = 'none';
      startCamera();
      loadCameraQuestion();
    } else {
      dom.arenaCamera.setAttribute('hidden', '');
      dom.arenaCamera.style.display = 'none';
      dom.arenaVisual.removeAttribute('hidden');
      dom.arenaVisual.style.display = 'block';
      stopCamera();
      loadVisualQuestion();
    }

    sound.playTick();
  }

  function abortQuizSession() {
    clearInterval(state.timerInterval);
    stopCamera();
    dom.arenaVisual.style.display = 'none';
    dom.arenaCamera.style.display = 'none';
    dom.letterProgressStrip.innerHTML = '';
    showScreen('screen-setup');
  }

  function updateTimerDisplay() {
    state.elapsedSeconds = Math.floor((Date.now() - state.startTime) / 1000);
    const m = String(Math.floor(state.elapsedSeconds / 60)).padStart(2, '0');
    const s = String(state.elapsedSeconds % 60).padStart(2, '0');
    dom.hudTimer.textContent = `${m}:${s}`;
  }

  function showScreen(screenId) {
    [dom.screenSetup, dom.screenGameplay, dom.screenResults].forEach((s) => {
      s.classList.remove('active');
    });
    const target = document.getElementById(screenId);
    if (target) target.classList.add('active');
  }

  // -------------------------------------------------------------------------
  // 9. Letter Progress Strip
  // -------------------------------------------------------------------------
  function renderProgressStrip() {
    // Hide letter progress strip in visual quiz modes to prevent spoiling the answer
    if (state.mode === 'visual-photo' || state.mode === 'visual-letter') {
      dom.letterProgressStrip.style.display = 'none';
      dom.letterProgressStrip.innerHTML = '';
      dom.hudQIndex.textContent = `${state.currentIndex + 1}/${state.activeQuestions.length}`;
      return;
    }

    dom.letterProgressStrip.style.display = 'flex';
    dom.letterProgressStrip.innerHTML = '';
    state.activeQuestions.forEach((q, idx) => {
      const pill = document.createElement('div');
      pill.className = 'prog-letter-pill upcoming';
      pill.textContent = q.letter;
      pill.id = `prog-pill-${idx}`;
      pill.addEventListener('click', () => {
        // Can open study modal for any letter
        openLetterModal(q);
      });
      dom.letterProgressStrip.appendChild(pill);
    });
    updateProgressPillState();
  }

  function updateProgressPillState() {
    // Update Counter
    dom.hudQIndex.textContent = `${state.currentIndex + 1}/${state.activeQuestions.length}`;

    // Skip updating letter pills if in visual quiz mode
    if (state.mode === 'visual-photo' || state.mode === 'visual-letter') {
      return;
    }

    state.activeQuestions.forEach((q, idx) => {
      const pill = document.getElementById(`prog-pill-${idx}`);
      if (!pill) return;

      if (idx === state.currentIndex) {
        pill.className = 'prog-letter-pill current';
      } else if (idx < state.currentIndex) {
        const perf = state.performance[q.letter];
        if (perf === 'correct') {
          pill.className = 'prog-letter-pill correct';
        } else if (perf === 'hinted') {
          pill.className = 'prog-letter-pill hinted';
        } else {
          pill.className = 'prog-letter-pill missed';
        }
      } else {
        pill.className = 'prog-letter-pill upcoming';
      }
    });
  }

  // -------------------------------------------------------------------------
  // 10. Scoring & Streak Engine
  // -------------------------------------------------------------------------
  function addScore(points, isCorrect, usedHint) {
    if (isCorrect) {
      state.streak += 1;
      if (state.streak > state.longestStreak) {
        state.longestStreak = state.streak;
      }

      // Multiplier: 1x, 2x for streak >= 3, 3x for streak >= 6
      const mult = state.streak >= 6 ? 3 : state.streak >= 3 ? 2 : 1;
      const totalPoints = points * mult;
      state.score += totalPoints;

      if (!usedHint) {
        state.correctFirstTry += 1;
      } else {
        state.hintsUsed += 1;
      }

      dom.hudStreakContainer.classList.add('active');
      dom.hudStreak.textContent = state.streak;
      dom.hudStreakMult.textContent = `${mult}x`;

      return totalPoints;
    } else {
      state.streak = 0;
      dom.hudStreakContainer.classList.remove('active');
      dom.hudStreak.textContent = '0';
      dom.hudStreakMult.textContent = '1x';
      return 0;
    }
  }

  // -------------------------------------------------------------------------
  // 11. Camera Live Prediction Mode
  // -------------------------------------------------------------------------
  function resizeSkeletonCanvas() {
    const rect = dom.quizWebcam.getBoundingClientRect();
    if (rect.width && rect.height) {
      dom.quizSkeletonCanvas.width = Math.round(rect.width);
      dom.quizSkeletonCanvas.height = Math.round(rect.height);
    }
  }
  window.addEventListener('resize', resizeSkeletonCanvas);

  async function startCamera() {
    try {
      dom.streamStatusText.textContent = 'Connecting HD Camera...';
      const constraints = {
        video: {
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 360 },
          aspectRatio: { ideal: 1.7777777778 },
          facingMode: 'user'
        },
        audio: false
      };
      state.stream = await navigator.mediaDevices.getUserMedia(constraints);
      dom.quizWebcam.srcObject = state.stream;
      await dom.quizWebcam.play();
      state.isCameraRunning = true;
      dom.streamStatusText.textContent = 'Webcam Live';
      dom.btnToggleCam.textContent = 'Pause Camera';
      resizeSkeletonCanvas();
      requestAnimationFrame(cameraPredictionLoop);
    } catch (err) {
      console.error('Camera stream error:', err);
      dom.streamStatusText.textContent = 'Camera Unavailable';
      alert('Could not access webcam. Please verify browser camera permissions.');
    }
  }

  function stopCamera() {
    if (state.stream) {
      state.stream.getTracks().forEach((track) => track.stop());
      dom.quizWebcam.srcObject = null;
      state.stream = null;
    }
    state.isCameraRunning = false;
    skeletonCtx.clearRect(0, 0, dom.quizSkeletonCanvas.width, dom.quizSkeletonCanvas.height);
  }

  dom.btnToggleCam.addEventListener('click', () => {
    if (state.isCameraRunning) {
      stopCamera();
      dom.btnToggleCam.textContent = 'Resume Camera';
      dom.streamStatusText.textContent = 'Camera Paused';
    } else {
      startCamera();
    }
  });

  function loadCameraQuestion() {
    if (state.currentIndex >= state.activeQuestions.length) {
      finishQuiz();
      return;
    }

    const currentLetter = state.activeQuestions[state.currentIndex];
    state.currentHintRevealed = false;
    state.holdFrames = 0;
    state.resetVerifyBuffer = true;

    // Reset HUD meters
    dom.cameraTargetLetter.textContent = currentLetter.letter;
    dom.cameraTargetName.textContent = currentLetter.name;
    dom.cameraTargetCategory.textContent = currentLetter.category || 'ISL Letter';
    dom.cameraTargetShort.textContent = currentLetter.tips || currentLetter.description;

    setHintVisible(false);
    dom.cameraHintImg.src = currentLetter.image;
    dom.cameraHintDesc.textContent = currentLetter.description;

    dom.liveHoldMeter.style.width = '0%';
    dom.holdPercentLabel.textContent = '0%';
    dom.holdStatusLabel.textContent = `Form letter "${currentLetter.letter}" steady...`;
    dom.liveDetectedSign.textContent = '-';
    dom.liveDetectedConf.textContent = '(0%)';
    dom.liveDetectedSign.classList.remove('matched');

    if (dom.targetSuccessBanner) {
      dom.targetSuccessBanner.hidden = true;
      dom.targetSuccessBanner.style.display = 'none';
    }
    if (dom.cameraFeedCard) dom.cameraFeedCard.classList.remove('correct-pulse-border');
    if (dom.cameraTargetRing) dom.cameraTargetRing.classList.remove('correct-ring');

    updateProgressPillState();
  }

  // Hint Controls for Camera (Reliable Show / Hide)
  function setHintVisible(visible) {
    state.currentHintRevealed = visible;
    if (visible) {
      dom.cameraHintPreview.removeAttribute('hidden');
      dom.cameraHintPreview.classList.add('visible');
      dom.cameraHintPreview.style.display = 'flex';
      dom.btnCameraHintText.textContent = 'Hide Reference Photo';
    } else {
      dom.cameraHintPreview.setAttribute('hidden', '');
      dom.cameraHintPreview.classList.remove('visible');
      dom.cameraHintPreview.style.display = 'none';
      dom.btnCameraHintText.textContent = 'Show Reference Photo';
    }
  }

  dom.btnCameraHint.addEventListener('click', () => {
    setHintVisible(!state.currentHintRevealed);
    sound.playTick();
  });

  dom.btnCloseHint.addEventListener('click', () => {
    setHintVisible(false);
  });

  dom.btnCameraSkip.addEventListener('click', () => {
    onLetterSkipped();
  });

  // Real-Time Frame Loop
  async function cameraPredictionLoop() {
    if (!state.isCameraRunning || state.mode !== 'camera' || state.isCompleted) return;

    if (!state.isPredicting && dom.quizWebcam.readyState >= 2) {
      state.isPredicting = true;
      try {
        offCtx.drawImage(dom.quizWebcam, 0, 0, offCanvas.width, offCanvas.height);
        const dataUrl = offCanvas.toDataURL('image/jpeg', 0.6);
        const currentLetter = state.activeQuestions[state.currentIndex];

        if (currentLetter) {
          const res = await fetch('/api/quiz/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              image: dataUrl,
              target_letter: currentLetter.letter,
              threshold: 0.50,
              reset_buffer: Boolean(state.resetVerifyBuffer)
            })
          });
          state.resetVerifyBuffer = false;

          if (res.ok) {
            const data = await res.json();
            handleCameraVerificationResult(data, currentLetter);
          }
        }
      } catch (err) {
        // Suppress frame drop logs
      } finally {
        state.isPredicting = false;
      }
    }

    if (state.isCameraRunning && state.mode === 'camera' && !state.isCompleted) {
      requestAnimationFrame(cameraPredictionLoop);
    }
  }

  function handleCameraVerificationResult(data, currentLetter) {
    const handsCount = data.hands_count || 0;
    const detectedLabel = data.label || '-';
    const confidence = data.confidence || 0;
    const matched = Boolean(data.matched);

    // Update hands badge in header
    if (handsCount > 0) {
      dom.cameraHandsBadge.textContent = `🖐️ ${handsCount} Hand${handsCount > 1 ? 's' : ''}`;
      dom.cameraHandsBadge.classList.add('active');
    } else {
      dom.cameraHandsBadge.textContent = '🖐️ 0 Hands';
      dom.cameraHandsBadge.classList.remove('active');
    }

    // Detected Sign and Conf on the Left Target Card
    if (dom.liveDetectedSign) {
      dom.liveDetectedSign.textContent = detectedLabel;
      if (dom.liveDetectedConf) {
        dom.liveDetectedConf.textContent = `(${Math.round(confidence * 100)}%)`;
      }

      if (matched) {
        dom.liveDetectedSign.classList.add('matched');
      } else {
        dom.liveDetectedSign.classList.remove('matched');
      }
    }

    // Hold Progress Management on Target Card
    if (matched && handsCount > 0) {
      state.holdFrames += 1;
      const progress = Math.min(1.0, state.holdFrames / state.REQUIRED_HOLD_FRAMES);
      dom.liveHoldMeter.style.width = `${Math.round(progress * 100)}%`;
      dom.holdPercentLabel.textContent = `${Math.round(progress * 100)}%`;
      dom.holdStatusLabel.textContent = `Matching! Hold steady...`;

      if (state.holdFrames >= state.REQUIRED_HOLD_FRAMES) {
        // Sign committed!
        commitCameraCorrect(currentLetter);
      }
    } else {
      // Decay hold counter if hand left or switched
      if (state.holdFrames > 0) {
        state.holdFrames = Math.max(0, state.holdFrames - 1);
        const progress = Math.min(1.0, state.holdFrames / state.REQUIRED_HOLD_FRAMES);
        dom.liveHoldMeter.style.width = `${Math.round(progress * 100)}%`;
        dom.holdPercentLabel.textContent = `${Math.round(progress * 100)}%`;
      }
      if (handsCount === 0) {
        dom.holdStatusLabel.textContent = 'Show hands to camera...';
      } else {
        dom.holdStatusLabel.textContent = `Target is "${currentLetter.letter}". Detected: "${detectedLabel}".`;
      }
    }

    // Draw 3D Hand Skeleton Overlay directly aligned with camera (Exact 1:1 match)
    drawSkeleton(data.hands_landmarks || []);
  }

  function commitCameraCorrect(currentLetter) {
    state.holdFrames = 0;
    const basePoints = state.currentHintRevealed ? 50 : 100;
    const earned = addScore(basePoints, true, state.currentHintRevealed);
    dom.hudScore.textContent = state.score;

    state.performance[currentLetter.letter] = state.currentHintRevealed ? 'hinted' : 'correct';

    // 1. Floating Score Tag in HUD
    if (dom.floatingScoreTag) {
      dom.floatingScoreTag.textContent = `+${earned} PTS`;
      dom.floatingScoreTag.hidden = false;
      dom.floatingScoreTag.style.display = 'block';
      dom.floatingScoreTag.style.animation = 'none';
      void dom.floatingScoreTag.offsetWidth; // trigger reflow
      dom.floatingScoreTag.style.animation = 'floatUpFade 1.1s ease forwards';
      setTimeout(() => {
        dom.floatingScoreTag.hidden = true;
        dom.floatingScoreTag.style.display = 'none';
      }, 1100);
    }

    // 2. Glowing perimeter border on camera frame (Webcam video is completely unblocked!)
    if (dom.cameraFeedCard) {
      dom.cameraFeedCard.classList.add('correct-pulse-border');
    }
    if (dom.cameraTargetRing) {
      dom.cameraTargetRing.classList.add('correct-ring');
    }

    // 3. Clear non-obtrusive banner on the left Target Card
    if (dom.targetSuccessBanner) {
      dom.targetSuccessPoints.textContent = `+${earned} PTS`;
      dom.targetSuccessBanner.hidden = false;
      dom.targetSuccessBanner.style.display = 'block';
    }

    // 4. Update HUD status lines
    dom.holdStatusLabel.textContent = `✓ PERFECT! Letter "${currentLetter.letter}" (+${earned} PTS)`;
    dom.liveHoldMeter.style.width = '100%';

    sound.playChime();
    sound.speak(`Correct! Letter ${currentLetter.letter}`);

    setTimeout(() => {
      if (dom.targetSuccessBanner) {
      dom.targetSuccessBanner.hidden = true;
      dom.targetSuccessBanner.style.display = 'none';
    }
      if (dom.cameraFeedCard) dom.cameraFeedCard.classList.remove('correct-pulse-border');
      if (dom.cameraTargetRing) dom.cameraTargetRing.classList.remove('correct-ring');
      state.currentIndex += 1;
      loadCameraQuestion();
    }, 1100);
  }

  function onLetterSkipped() {
    const currentLetter = state.activeQuestions[state.currentIndex];
    state.performance[currentLetter.letter] = 'missed';
    addScore(0, false, false);
    sound.playWrong();

    state.currentIndex += 1;
    loadCameraQuestion();
  }

  function drawSkeleton(handsLandmarks) {
    skeletonCtx.clearRect(0, 0, dom.quizSkeletonCanvas.width, dom.quizSkeletonCanvas.height);
    if (!handsLandmarks || handsLandmarks.length === 0) return;

    const w = dom.quizSkeletonCanvas.width;
    const h = dom.quizSkeletonCanvas.height;

    handsLandmarks.forEach((landmarks) => {
      // Connect bones with glowing neon cyan lines
      skeletonCtx.lineWidth = 3;
      skeletonCtx.strokeStyle = '#00ffff';
      skeletonCtx.shadowColor = '#00ffff';
      skeletonCtx.shadowBlur = 8;

      CONNECTIONS.forEach(([i, j]) => {
        if (landmarks[i] && landmarks[j]) {
          const x1 = landmarks[i][0] * w;
          const y1 = landmarks[i][1] * h;
          const x2 = landmarks[j][0] * w;
          const y2 = landmarks[j][1] * h;

          skeletonCtx.beginPath();
          skeletonCtx.moveTo(x1, y1);
          skeletonCtx.lineTo(x2, y2);
          skeletonCtx.stroke();
        }
      });

      // Draw Joint Nodes directly where hands are detected
      const fingertips = [4, 8, 12, 16, 20];
      landmarks.forEach((lm, idx) => {
        const x = lm[0] * w;
        const y = lm[1] * h;
        const isTip = fingertips.includes(idx);

        skeletonCtx.beginPath();
        skeletonCtx.arc(x, y, isTip ? 6 : 4, 0, 2 * Math.PI);
        skeletonCtx.fillStyle = isTip ? '#10b981' : '#ffffff';
        skeletonCtx.shadowColor = isTip ? '#10b981' : '#00ffff';
        skeletonCtx.shadowBlur = isTip ? 12 : 6;
        skeletonCtx.fill();
      });
    });
  }

  // -------------------------------------------------------------------------
  // 12. Visual Multiple-Choice Quiz Modes
  // -------------------------------------------------------------------------
  function loadVisualQuestion() {
    if (state.currentIndex >= state.activeQuestions.length) {
      finishQuiz();
      return;
    }

    state.visualSelected = false;
    dom.visualFeedbackCard.setAttribute('hidden', '');
    dom.visualFeedbackCard.style.display = 'none';

    const currentLetter = state.activeQuestions[state.currentIndex];
    updateProgressPillState();

    if (state.mode === 'visual-photo') {
      // Prompt: Look at Photo -> Pick Letter (A, B, C, D)
      dom.visualQTypeBadge.textContent = 'Recognize the Sign';
      dom.visualQPrompt.textContent = 'Which Indian Sign Language letter is shown below?';

      dom.visualPhotoWrap.removeAttribute('hidden');
      dom.visualPhotoWrap.style.display = 'block';
      dom.visualLetterWrap.setAttribute('hidden', '');
      dom.visualLetterWrap.style.display = 'none';
      dom.visualMainImage.src = currentLetter.image;

      // Generate 4 letter choices
      generateTextOptions(currentLetter);
    } else {
      // Prompt: Target Letter given -> Pick 1 of 4 Sign Photos
      dom.visualQTypeBadge.textContent = 'Pick the Matching Sign';
      dom.visualQPrompt.textContent = `Find the authentic ISL sign for: Letter "${currentLetter.letter}"`;

      dom.visualPhotoWrap.setAttribute('hidden', '');
      dom.visualPhotoWrap.style.display = 'none';
      dom.visualLetterWrap.removeAttribute('hidden');
      dom.visualLetterWrap.style.display = 'flex';
      dom.visualLargeLetter.textContent = currentLetter.letter;

      // Generate 4 image choices
      generateImageOptions(currentLetter);
    }
  }

  function generateTextOptions(currentLetter) {
    dom.visualOptionsGrid.innerHTML = '';

    // Pick 3 random wrong options
    const pool = masterLetters.filter((l) => l.letter !== currentLetter.letter);
    const shuffledPool = pool.sort(() => 0.5 - Math.random()).slice(0, 3);
    const options = [currentLetter, ...shuffledPool].sort(() => 0.5 - Math.random());

    state.currentOptions = options;
    state.correctOptionIndex = options.findIndex((o) => o.letter === currentLetter.letter);

    options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'visual-opt-btn';
      btn.innerHTML = `
        <span class="opt-index-key">${idx + 1}</span>
        <span class="opt-text-label">Letter ${opt.letter}</span>
      `;
      btn.addEventListener('click', () => handleVisualSelection(idx, currentLetter));
      dom.visualOptionsGrid.appendChild(btn);
    });
  }

  function generateImageOptions(currentLetter) {
    dom.visualOptionsGrid.innerHTML = '';

    const pool = masterLetters.filter((l) => l.letter !== currentLetter.letter);
    const shuffledPool = pool.sort(() => 0.5 - Math.random()).slice(0, 3);
    const options = [currentLetter, ...shuffledPool].sort(() => 0.5 - Math.random());

    state.currentOptions = options;
    state.correctOptionIndex = options.findIndex((o) => o.letter === currentLetter.letter);

    options.forEach((opt, idx) => {
      const card = document.createElement('div');
      card.className = 'visual-opt-img-card';
      card.innerHTML = `
        <div class="opt-thumb-wrap">
          <img src="${opt.image}" alt="ISL Sign Option" class="opt-thumb-img" loading="lazy">
        </div>
        <span class="opt-thumb-key">Option [${idx + 1}]</span>
      `;
      card.addEventListener('click', () => handleVisualSelection(idx, currentLetter));
      dom.visualOptionsGrid.appendChild(card);
    });
  }

  function handleVisualSelection(selectedIndex, currentLetter) {
    if (state.visualSelected) return;
    state.visualSelected = true;

    const isCorrect = selectedIndex === state.correctOptionIndex;
    const optionEls = dom.visualOptionsGrid.children;

    // Highlight correct & incorrect
    Array.from(optionEls).forEach((el, idx) => {
      if (idx === state.correctOptionIndex) {
        el.classList.add('correct');
      } else if (idx === selectedIndex) {
        el.classList.add('incorrect');
      }
    });

    if (isCorrect) {
      const earned = addScore(100, true, false);
      state.performance[currentLetter.letter] = 'correct';
      dom.hudScore.textContent = state.score;

      dom.feedbackStatusRow.className = 'feedback-status-row correct';
      dom.feedbackIcon.textContent = '✓';
      dom.feedbackHeading.textContent = `Correct! That is Letter ${currentLetter.letter}.`;
      dom.feedbackScoreAdd.textContent = `+${earned} PTS`;
      sound.playChime();
      sound.speak(`Correct! Letter ${currentLetter.letter}`);
    } else {
      addScore(0, false, false);
      state.performance[currentLetter.letter] = 'missed';

      dom.feedbackStatusRow.className = 'feedback-status-row incorrect';
      dom.feedbackIcon.textContent = '✕';
      dom.feedbackHeading.textContent = `Incorrect. The correct sign is Letter ${currentLetter.letter}.`;
      dom.feedbackScoreAdd.textContent = '+0 PTS';
      sound.playWrong();
    }

    // Explanation
    dom.feedbackExplanation.textContent = `${currentLetter.description} Tip: ${currentLetter.tips}`;
    dom.visualFeedbackCard.removeAttribute('hidden');
    dom.visualFeedbackCard.style.display = 'flex';
  }

  dom.btnNextQuestion.addEventListener('click', () => {
    state.currentIndex += 1;
    loadVisualQuestion();
  });

  // Keyboard Navigation: keys 1-4 for options, Space/Enter for Next
  document.addEventListener('keydown', (e) => {
    if (dom.screenGameplay.classList.contains('active')) {
      if (state.mode !== 'camera') {
        if (!state.visualSelected) {
          if (['1', '2', '3', '4'].includes(e.key)) {
            const idx = parseInt(e.key, 10) - 1;
            const currentLetter = state.activeQuestions[state.currentIndex];
            if (currentLetter && idx < state.currentOptions.length) {
              handleVisualSelection(idx, currentLetter);
            }
          }
        } else {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            state.currentIndex += 1;
            loadVisualQuestion();
          }
        }
      } else {
        // Camera shortcuts
        if (e.key === 'h' || e.key === 'H') {
          dom.btnCameraHint.click();
        } else if (e.key === 's' || e.key === 'S') {
          dom.btnCameraSkip.click();
        }
      }
    }
  });

  // -------------------------------------------------------------------------
  // 13. Quiz Completion & 26-Letter Performance Matrix
  // -------------------------------------------------------------------------
  function finishQuiz() {
    state.isCompleted = true;
    clearInterval(state.timerInterval);
    stopCamera();

    const totalQuestions = state.activeQuestions.length;
    const correctCount = Object.values(state.performance).filter(
      (v) => v === 'correct' || v === 'hinted'
    ).length;
    const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    // Display Stats
    dom.resScore.textContent = state.score;
    dom.resAccuracy.textContent = `${accuracy}%`;
    dom.resCorrect.textContent = `${state.correctFirstTry}/${totalQuestions}`;
    dom.resStreak.textContent = state.longestStreak;

    const m = String(Math.floor(state.elapsedSeconds / 60)).padStart(2, '0');
    const s = String(state.elapsedSeconds % 60).padStart(2, '0');
    dom.resTime.textContent = `${m}:${s}`;

    // Rank Calculation
    let rankBadge = { icon: '👑', title: 'ISL Grand Master', lead: 'Flawless performance! You have mastered the 26 Indian Sign Language manual alphabets.' };
    if (accuracy < 60) {
      rankBadge = { icon: '📚', title: 'ISL Apprentice', lead: 'Good first run! Review the letter matrix below to practice the signs you missed.' };
    } else if (accuracy < 80) {
      rankBadge = { icon: '🎖️', title: 'ISL Intermediate Signer', lead: 'Solid work! With a little more practice on tricky consonants, you will reach mastery.' };
    } else if (accuracy < 95) {
      rankBadge = { icon: '🏆', title: 'ISL Advanced Signer', lead: 'Impressive accuracy! You recognize and perform Indian Sign Language letters with confidence.' };
    }

    dom.resultsRankBadge.querySelector('.rank-icon').textContent = rankBadge.icon;
    dom.resultsRankTitle.textContent = rankBadge.title;
    dom.resultsLeadText.textContent = rankBadge.lead;

    // Render 26-Letter Performance Matrix (A through Z)
    renderLettersMatrix();

    // Practice Weak Letters button visibility
    const weakLetters = Object.keys(state.performance).filter(
      (ch) => state.performance[ch] === 'missed' || state.performance[ch] === 'hinted'
    );
    if (weakLetters.length > 0) {
      dom.btnPracticeWeak.hidden = false;
      dom.weakCountBadge.textContent = weakLetters.length;
    } else {
      dom.btnPracticeWeak.hidden = true;
    }

    showScreen('screen-results');
    sound.playFanfare();
    launchConfetti();
  }

  function renderLettersMatrix() {
    dom.lettersMatrixGrid.innerHTML = '';

    // Render all 26 letters in alphabetical order
    masterLetters.forEach((letterObj) => {
      const char = letterObj.letter;
      const status = state.performance[char]; // 'correct' | 'hinted' | 'missed' | undefined

      const tile = document.createElement('div');
      let statusClass = 'untested';
      let icon = '–';

      if (status === 'correct') {
        statusClass = 'mastered';
        icon = '✓';
      } else if (status === 'hinted') {
        statusClass = 'hinted';
        icon = '💡';
      } else if (status === 'missed') {
        statusClass = 'needs-work';
        icon = '✕';
      }

      tile.className = `matrix-tile ${statusClass}`;
      tile.innerHTML = `
        <span class="tile-char">${char}</span>
        <span class="tile-status-icon">${icon}</span>
      `;
      tile.title = `Click to study Letter ${char}`;
      tile.addEventListener('click', () => {
        openLetterModal(letterObj);
      });

      dom.lettersMatrixGrid.appendChild(tile);
    });
  }

  // -------------------------------------------------------------------------
  // 14. Study Modal
  // -------------------------------------------------------------------------
  function openLetterModal(letterObj) {
    dom.modalLetterChar.textContent = letterObj.letter;
    dom.modalLetterName.textContent = letterObj.name;
    dom.modalCategory.textContent = letterObj.category || 'Alphabet';
    dom.modalImg.src = letterObj.image;
    dom.modalDesc.textContent = letterObj.description;
    dom.modalTips.textContent = letterObj.tips || 'Form hand posture firmly and face towards the camera.';

    dom.letterModal.classList.add('active');
    dom.letterModal.setAttribute('aria-hidden', 'false');

    dom.btnModalPronounce.onclick = () => {
      sound.speak(`Indian Sign Language letter ${letterObj.letter}`);
    };
  }

  function closeLetterModal() {
    dom.letterModal.classList.remove('active');
    dom.letterModal.setAttribute('aria-hidden', 'true');
  }

  dom.btnModalClose.addEventListener('click', closeLetterModal);
  dom.btnModalOk.addEventListener('click', closeLetterModal);
  dom.modalBackdrop.addEventListener('click', closeLetterModal);

  // -------------------------------------------------------------------------
  // 15. Confetti Celebration Effect
  // -------------------------------------------------------------------------
  function launchConfetti() {
    const canvas = dom.confettiCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#00f0ff', '#2563eb', '#7c3aed', '#10b981', '#fbbf24', '#f43f5e'];

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.8) * 18,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vr: (Math.random() - 0.5) * 10,
        gravity: 0.35,
        opacity: 1
      });
    }

    let animationId = null;
    function renderConfetti() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let activeCount = 0;

      particles.forEach((p) => {
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vr;
        p.opacity -= 0.008;

        if (p.opacity > 0) {
          activeCount += 1;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.4);
          ctx.restore();
        }
      });

      if (activeCount > 0) {
        animationId = requestAnimationFrame(renderConfetti);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        cancelAnimationFrame(animationId);
      }
    }
    renderConfetti();
  }

  // -------------------------------------------------------------------------
  // 16. Initialization
  // -------------------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    setupSoundToggle();
    initSetupScreen();
    loadLetters();
    checkBackendHealth();
  });
})();

