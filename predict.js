/**
 * ISL to Text & Speech – Client Engine
 * Mirrors the exact workflow, HUD overlays, suggestion pagination, and keybindings of app.py
 */

document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('webcam-video');
  const canvas = document.getElementById('landmark-canvas');
  const ctx = canvas.getContext('2d');

  // Top Overlay elements
  const signText = document.getElementById('sign-text');
  const confText = document.getElementById('conf-text');
  const meterFill = document.getElementById('meter-fill');
  const voiceBtn = document.getElementById('voice-btn');
  const connStatus = document.getElementById('conn-status');
  const connText = document.getElementById('conn-text');
  const handsBadge = document.getElementById('hands-badge');

  // Bottom Overlay elements
  const sentenceText = document.getElementById('sentence-text');
  const translationText = document.getElementById('translation-text');
  const suggestionsRow = document.getElementById('suggestions-row');
  const pageInfo = document.getElementById('page-info');
  const btnPrevPage = document.getElementById('btn-prev-page');
  const btnNextPage = document.getElementById('btn-next-page');
  const statusText = document.getElementById('status-text');

  // Toolbar elements
  const btnSpeak = document.getElementById('btn-speak');
  const btnReplay = document.getElementById('btn-replay');
  const btnLang = document.getElementById('btn-lang');
  const btnSpace = document.getElementById('btn-space');
  const btnBack = document.getElementById('btn-back');
  const btnClear = document.getElementById('btn-clear');
  const btnCam = document.getElementById('btn-cam');

  // Suggestions Pagination State (exact matching to app.py PAGE = 9)
  const PAGE_SIZE = 9;
  let allSuggestions = [];
  let sugPage = 0;
  let prevCurrentLetters = '';

  // Stream & Prediction State
  let stream = null;
  let isCameraActive = false;
  let isPredicting = false;
  let currentLanguage = 'English';
  let backendOnline = false;

  // Offscreen canvas for frame capture (640x360 16:9 widescreen for zero distortion)
  const offCanvas = document.createElement('canvas');
  offCanvas.width = 640;
  offCanvas.height = 360;
  const offCtx = offCanvas.getContext('2d');

  // MediaPipe 21 Landmark Connections
  const CONNECTIONS = [
    [0, 1], [1, 2], [2, 3], [3, 4],
    [0, 5], [5, 6], [6, 7], [7, 8],
    [5, 9], [9, 10], [10, 11], [11, 12],
    [9, 13], [13, 14], [14, 15], [15, 16],
    [13, 17], [17, 18], [18, 19], [19, 20],
    [0, 17]
  ];

  /* -------------------------------------------------------------------------
     1. HEALTH CHECK
     ------------------------------------------------------------------------- */
  async function checkBackend() {
    try {
      const t0 = performance.now();
      const res = await fetch('/api/health');
      const ping = Math.round(performance.now() - t0);
      if (res.ok) {
        backendOnline = true;
        if (connText) connText.textContent = `Backend Connected (${ping}ms)`;
        if (connStatus) {
          connStatus.style.color = '#34d399';
          connStatus.style.borderColor = 'rgba(52, 211, 153, 0.4)';
          connStatus.style.background = 'rgba(52, 211, 153, 0.12)';
        }
      } else {
        throw new Error('Offline');
      }
    } catch (e) {
      backendOnline = false;
      if (connText) connText.textContent = 'Backend Offline';
      if (connStatus) {
        connStatus.style.color = '#ef4444';
        connStatus.style.borderColor = 'rgba(239, 68, 68, 0.4)';
        connStatus.style.background = 'rgba(239, 68, 68, 0.12)';
      }
    }
  }
  checkBackend();
  setInterval(checkBackend, 4000);

  /* -------------------------------------------------------------------------
     2. CAMERA MANAGEMENT (Wide Angle HD 16:9)
     ------------------------------------------------------------------------- */
  async function startCamera() {
    try {
      statusText.textContent = 'Connecting wide-angle HD camera...';
      const constraints = {
        video: {
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 360 },
          aspectRatio: { ideal: 1.7777777778 },
          facingMode: 'user'
        },
        audio: false
      };

      stream = await navigator.mediaDevices.getUserMedia(constraints);
      video.srcObject = stream;
      await video.play();

      isCameraActive = true;
      statusText.textContent = 'Ready';
      btnCam.textContent = 'Pause Camera';

      resizeCanvases();
      requestAnimationFrame(predictionLoop);
    } catch (err) {
      console.error('Camera Error:', err);
      statusText.textContent = 'Camera unavailable';
      alert('Could not access webcam. Ensure no other application (like desktop OpenCV) is locking the camera.');
    }
  }

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      video.srcObject = null;
      stream = null;
    }
    isCameraActive = false;
    statusText.textContent = 'Camera paused';
    btnCam.textContent = 'Resume Camera';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function resizeCanvases() {
    const rect = video.getBoundingClientRect();
    if (rect.width && rect.height) {
      canvas.width = Math.round(rect.width);
      canvas.height = Math.round(rect.height);
    }
  }
  window.addEventListener('resize', resizeCanvases);
  video.addEventListener('loadedmetadata', resizeCanvases);

  /* -------------------------------------------------------------------------
     3. REAL-TIME PREDICTION LOOP
     ------------------------------------------------------------------------- */
  async function predictionLoop() {
    if (!isCameraActive) return;

    if (!isPredicting && video.readyState >= 2) {
      isPredicting = true;
      try {
        offCtx.drawImage(video, 0, 0, offCanvas.width, offCanvas.height);
        const dataUrl = offCanvas.toDataURL('image/jpeg', 0.6);

        if (backendOnline) {
          const res = await fetch('/api/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: dataUrl })
          });

          if (res.ok) {
            const data = await res.json();
            updateHUD(data);
          }
        }
      } catch (err) {
        console.warn('Prediction request error:', err);
      } finally {
        isPredicting = false;
      }
    }

    if (isCameraActive) {
      requestAnimationFrame(predictionLoop);
    }
  }

  /* -------------------------------------------------------------------------
     4. UPDATE HUD OVERLAYS (Exact app.py layout)
     ------------------------------------------------------------------------- */
  function updateHUD(data) {
    // Top Bar
    const label = data.label || '-';
    const conf = data.confidence || 0;
    currentLanguage = data.language || currentLanguage;

    signText.textContent = `Sign: ${label}`;
    confText.textContent = `Confidence: ${Math.round(conf * 100)}%`;

    // Hold progress or confidence meter
    if (data.hold_progress !== undefined && data.hold_progress > 0) {
      meterFill.style.width = `${Math.min(100, Math.round(data.hold_progress * 100))}%`;
      meterFill.style.background = '#00ff88';
    } else {
      meterFill.style.width = `${Math.min(100, Math.max(0, Math.round(conf * 100)))}%`;
      meterFill.style.background = conf >= 0.80 ? '#00ff00' : '#38bdf8';
    }
    voiceBtn.textContent = `Voice: ${currentLanguage}`;

    // Hands tracker indicator
    if (handsBadge) {
      const hCount = data.hands_count || 0;
      if (hCount > 0) {
        handsBadge.textContent = `🖐️ ${hCount} Hand${hCount > 1 ? 's' : ''}`;
        handsBadge.classList.add('active');
      } else {
        handsBadge.textContent = '🖐️ 0 Hands';
        handsBadge.classList.remove('active');
      }
    }

    // Sentence Line
    if (data.sentence !== undefined) {
      sentenceText.textContent = data.sentence;
    }

    // Translation Line
    if (currentLanguage !== 'English' && data.translation) {
      translationText.textContent = data.translation;
      translationText.style.display = 'block';
    } else {
      translationText.textContent = '';
      translationText.style.display = 'none';
    }

    // Suggestions Paging (Exact app.py logic)
    const currentLetters = data.current_letters || '';
    if (currentLetters !== prevCurrentLetters) {
      sugPage = 0;
      prevCurrentLetters = currentLetters;
    }

    allSuggestions = Array.isArray(data.suggestions) ? data.suggestions : [];
    renderSuggestions();

    // Status Message
    if (data.status) {
      statusText.textContent = data.status;
    }

    // Draw Hands Skeleton (Exact 1:1 overlay)
    drawSkeleton(data.hands_landmarks || []);
  }

  function renderSuggestions() {
    suggestionsRow.innerHTML = '';
    const total = allSuggestions.length;
    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    sugPage = Math.min(sugPage, pages - 1);

    if (total === 0) {
      pageInfo.textContent = '';
      btnPrevPage.style.visibility = 'hidden';
      btnNextPage.style.visibility = 'hidden';
      return;
    }

    btnPrevPage.style.visibility = pages > 1 ? 'visible' : 'hidden';
    btnNextPage.style.visibility = pages > 1 ? 'visible' : 'hidden';
    pageInfo.textContent = `${total} words starting with '${prevCurrentLetters}'  |  page ${sugPage + 1}/${pages}  (N next, P prev)`;

    const pageItems = allSuggestions.slice(sugPage * PAGE_SIZE, sugPage * PAGE_SIZE + PAGE_SIZE);

    pageItems.forEach((word, idx) => {
      const itemEl = document.createElement('div');
      itemEl.className = 'sug-item';
      itemEl.textContent = `[${idx + 1}] ${word}`;
      itemEl.addEventListener('click', () => {
        const absoluteIndex = sugPage * PAGE_SIZE + idx;
        acceptSuggestion(absoluteIndex);
      });
      suggestionsRow.appendChild(itemEl);
    });
  }

  function drawSkeleton(handsLandmarks) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!handsLandmarks || handsLandmarks.length === 0) return;

    const w = canvas.width;
    const h = canvas.height;

    handsLandmarks.forEach((landmarks) => {
      // Connect bones
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#00ffff';
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 6;

      CONNECTIONS.forEach(([i, j]) => {
        if (landmarks[i] && landmarks[j]) {
          const p1 = landmarks[i];
          const p2 = landmarks[j];
          ctx.beginPath();
          ctx.moveTo(p1[0] * w, p1[1] * h);
          ctx.lineTo(p2[0] * w, p2[1] * h);
          ctx.stroke();
        }
      });

      // Joint dots
      landmarks.forEach((p, idx) => {
        const isTip = [4, 8, 12, 16, 20].includes(idx);
        ctx.beginPath();
        ctx.arc(p[0] * w, p[1] * h, isTip ? 5.5 : 3.5, 0, Math.PI * 2);
        ctx.fillStyle = isTip ? '#00ff66' : '#00e5ff';
        ctx.shadowColor = isTip ? '#00ff66' : '#00e5ff';
        ctx.shadowBlur = 8;
        ctx.fill();
      });
      ctx.shadowBlur = 0;
    });
  }

  /* -------------------------------------------------------------------------
     5. CONTROLS & KEYBOARD COMMANDS (Exact app.py key bindings)
     ------------------------------------------------------------------------- */
  async function sendControl(action, payload = {}) {
    if (!backendOnline) return;
    try {
      const res = await fetch('/api/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...payload })
      });
      if (res.ok) {
        const data = await res.json();
        updateHUD(data);
      }
    } catch (e) {
      console.error('Control error:', e);
    }
  }

  function acceptSuggestion(index) {
    sendControl('accept_suggestion', { index });
    sugPage = 0;
  }

  function nextPage() {
    const pages = Math.max(1, Math.ceil(allSuggestions.length / PAGE_SIZE));
    sugPage = (sugPage + 1) % pages;
    renderSuggestions();
  }

  function prevPage() {
    const pages = Math.max(1, Math.ceil(allSuggestions.length / PAGE_SIZE));
    sugPage = (sugPage - 1 + pages) % pages;
    renderSuggestions();
  }

  // Button Listeners
  btnNextPage.addEventListener('click', nextPage);
  btnPrevPage.addEventListener('click', prevPage);

  btnSpace.addEventListener('click', () => sendControl('space'));
  btnBack.addEventListener('click', () => sendControl('backspace'));
  btnClear.addEventListener('click', () => sendControl('clear'));
  btnLang.addEventListener('click', () => sendControl('next_lang'));
  voiceBtn.addEventListener('click', () => sendControl('next_lang'));

  btnSpeak.addEventListener('click', async () => {
    statusText.textContent = `Speaking in ${currentLanguage}...`;
    try {
      const res = await fetch('/api/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: currentLanguage })
      });
      const data = await res.json();
      statusText.textContent = data.message || 'Ready';
    } catch (e) {
      statusText.textContent = 'Voice error';
    }
  });

  btnReplay.addEventListener('click', async () => {
    statusText.textContent = 'Replaying sentence...';
    try {
      const res = await fetch('/api/replay', { method: 'POST' });
      const data = await res.json();
      statusText.textContent = data.message || 'Ready';
    } catch (e) {
      statusText.textContent = 'Replay error';
    }
  });

  btnCam.addEventListener('click', () => {
    if (isCameraActive) {
      stopCamera();
    } else {
      startCamera();
    }
  });

  // Keyboard Shortcuts (Matches app.py lines 333-353)
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    const key = e.key.toLowerCase();

    if (e.key >= '1' && e.key <= '9') {
      const pickIdx = sugPage * PAGE_SIZE + (parseInt(e.key) - 1);
      if (pickIdx < allSuggestions.length) {
        acceptSuggestion(pickIdx);
      }
    } else if (key === 'n') {
      nextPage();
    } else if (key === 'p') {
      prevPage();
    } else if (key === 's') {
      btnSpeak.click();
    } else if (key === 'r') {
      btnReplay.click();
    } else if (key === 'l') {
      sendControl('next_lang');
    } else if (key === 'b' || e.key === 'Backspace') {
      sendControl('backspace');
    } else if (key === 'c') {
      sendControl('clear');
    } else if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
      sendControl('space');
    }
  });

  // Start camera on load
  startCamera();
});
