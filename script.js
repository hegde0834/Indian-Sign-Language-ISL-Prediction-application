/**
 * ISL Detect – 3D Interactive Client Engine
 * Handles 3D tilt effects, hand landmark hologram visualizer,
 * mobile drawer, smooth navigation, vocabulary filtering, and backend integration.
 */

document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -------------------------------------------------------------------------
     1. STICKY NAVBAR & ACTIVE SECTION OBSERVER
     ------------------------------------------------------------------------- */
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  function updateNavbar() {
    if (window.scrollY > 30) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Update active nav link
    const scrollPos = window.scrollY + 120;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }
  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar();

  /* -------------------------------------------------------------------------
     2. MOBILE MENU DRAWER
     ------------------------------------------------------------------------- */
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');

  function toggleMenu(open) {
    const isOpen = open !== undefined ? open : !navMenu.classList.contains('open');
    navMenu.classList.toggle('open', isOpen);
    mobileToggle.setAttribute('aria-expanded', isOpen);
  }

  mobileToggle.addEventListener('click', () => toggleMenu());

  // Close when clicking any nav link
  navMenu.addEventListener('click', (e) => {
    if (e.target.closest('a')) {
      toggleMenu(false);
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('open')) {
      toggleMenu(false);
    }
  });

  /* -------------------------------------------------------------------------
     3. PREDICTION PAGE NAVIGATION LOADER
     ------------------------------------------------------------------------- */
  const pageLoader = document.getElementById('pageLoader');
  const predictLinks = document.querySelectorAll('[data-predict]');

  predictLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return; // Allow opening in new tab
      e.preventDefault();
      const targetUrl = link.getAttribute('href') || '/predict';

      if (pageLoader) {
        pageLoader.hidden = false;
      }

      setTimeout(() => {
        window.location.href = targetUrl;
      }, reduceMotion ? 0 : 350);
    });
  });

  // Hide loader if user navigates back using browser history
  window.addEventListener('pageshow', () => {
    if (pageLoader) {
      pageLoader.hidden = true;
    }
  });

  /* -------------------------------------------------------------------------
     4. 3D INTERACTIVE HAND LANDMARK HOLOGRAM (Hero Visual)
     ------------------------------------------------------------------------- */
  (function initHandHologram() {
    const svg = document.getElementById('heroHandSvg');
    if (!svg) return;

    // 21 MediaPipe standard 3D metric hand landmark normalized coordinates
    const POINTS = [
      [150, 320], // 0: Wrist
      [110, 285], // 1: Thumb CMC
      [75, 245],  // 2: Thumb MCP
      [52, 205],  // 3: Thumb IP
      [32, 168],  // 4: Thumb Tip
      [112, 205], // 5: Index MCP
      [104, 155], // 6: Index PIP
      [100, 118], // 7: Index DIP
      [96, 80],   // 8: Index Tip
      [150, 195], // 9: Middle MCP
      [150, 140], // 10: Middle PIP
      [150, 98],  // 11: Middle DIP
      [150, 56],  // 12: Middle Tip
      [188, 202], // 13: Ring MCP
      [196, 150], // 14: Ring PIP
      [200, 112], // 15: Ring DIP
      [204, 78],  // 16: Ring Tip
      [222, 222], // 17: Pinky MCP
      [240, 182], // 18: Pinky PIP
      [250, 154], // 19: Pinky DIP
      [260, 126]  // 20: Pinky Tip
    ];

    // Standard 21 MediaPipe skeletal bone connections
    const BONES = [
      [0, 1], [1, 2], [2, 3], [3, 4],     // Thumb
      [0, 5], [5, 6], [6, 7], [7, 8],     // Index
      [9, 10], [10, 11], [11, 12],        // Middle
      [13, 14], [14, 15], [15, 16],       // Ring
      [17, 18], [18, 19], [19, 20],       // Pinky
      [5, 9], [9, 13], [13, 17], [0, 17]  // Palm base
    ];

    const NS = 'http://www.w3.org/2000/svg';

    // Draw bones
    BONES.forEach(([a, b]) => {
      const line = document.createElementNS(NS, 'line');
      line.setAttribute('x1', POINTS[a][0]);
      line.setAttribute('y1', POINTS[a][1]);
      line.setAttribute('x2', POINTS[b][0]);
      line.setAttribute('y2', POINTS[b][1]);
      svg.appendChild(line);
    });

    // Draw joint nodes
    const TIPS = [4, 8, 12, 16, 20];
    POINTS.forEach(([x, y], idx) => {
      const circle = document.createElementNS(NS, 'circle');
      circle.setAttribute('cx', x);
      circle.setAttribute('cy', y);
      circle.setAttribute('r', TIPS.includes(idx) ? '6.5' : '4.5');
      if (TIPS.includes(idx)) {
        circle.setAttribute('class', 'tip');
      }
      svg.appendChild(circle);
    });
  })();

  /* -------------------------------------------------------------------------
     5. 3D TILT EFFECT (Mouse tracking with perspective & specular light)
     ------------------------------------------------------------------------- */
  function applyTilt(card, maxAngle = 14) {
    if (!card || reduceMotion) return;

    card.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      card.style.setProperty('--ry', `${x * maxAngle}deg`);
      card.style.setProperty('--rx', `${-y * maxAngle}deg`);
    });

    card.addEventListener('pointerleave', () => {
      card.style.removeProperty('--ry');
      card.style.removeProperty('--rx');
    });
  }

  // Apply tilt to hologram visualizer
  const hologramCard = document.getElementById('hologramCard');
  if (hologramCard) {
    applyTilt(hologramCard, 22);
  }

  // Apply tilt to all interactive glass cards
  document.querySelectorAll('.tilt-card').forEach(card => {
    applyTilt(card, 12);
  });

  /* -------------------------------------------------------------------------
     6. ISL VOCABULARY DATA & INTERACTIVE SIGN PREVIEW MODAL
     ------------------------------------------------------------------------- */
  const ISL_ALPHABETS = [
    { key: 'A', name: 'Letter A', img: '/assets/images/letters/a.jpg', desc: 'Both hands form clenched fists with both thumbs pointing upwards and touching at their tips.' },
    { key: 'B', name: 'Letter B', img: '/assets/images/letters/b.jpg', desc: 'Both hands join index fingers and thumbs into two touching circular loops (resembling eyeglasses or the letter "B").' },
    { key: 'C', name: 'Letter C', img: '/assets/images/letters/c.jpg', desc: 'One hand curves all fingers and the thumb into a distinct, open "C" shape facing sideways.' },
    { key: 'D', name: 'Letter D', img: '/assets/images/letters/d.jpg', desc: 'Left index finger points upward while the right hand curves its index finger and thumb to meet it, forming the upright "D".' },
    { key: 'E', name: 'Letter E', img: '/assets/images/letters/e.jpg', desc: 'Left hand held open with fingers spread; the right index finger touches the tip of the left index finger (first vowel).' },
    { key: 'F', name: 'Letter F', img: '/assets/images/letters/f.jpg', desc: 'Two fingers (index and middle) on both hands cross horizontally over one another in a crossbar formation.' },
    { key: 'G', name: 'Letter G', img: '/assets/images/letters/g.jpg', desc: 'Both hands clenched in fists placed horizontally next to each other, knuckles aligned.' },
    { key: 'H', name: 'Letter H', img: '/assets/images/letters/h.jpg', desc: 'Right hand flat with fingers straight, resting horizontally across the flat upward-facing palm of the left hand.' },
    { key: 'I', name: 'Letter I', img: '/assets/images/letters/i.jpg', desc: 'Left hand held open with fingers spread; the right index finger touches the tip of the left middle finger (second vowel).' },
    { key: 'J', name: 'Letter J', img: '/assets/images/letters/j.jpg', desc: 'Right index finger touches the tip of the left middle finger and traces the curve of the letter "J" down onto the palm.' },
    { key: 'K', name: 'Letter K', img: '/assets/images/letters/k.jpg', desc: 'Left index finger held straight up; the right index finger curves and hooks against the left index knuckle.' },
    { key: 'L', name: 'Letter L', img: '/assets/images/letters/l.jpg', desc: 'One hand forms a clean 90-degree right angle between the extended thumb and index finger, with other fingers curled.' },
    { key: 'M', name: 'Letter M', img: '/assets/images/letters/m.jpg', desc: 'Right hand places three extended fingertips (index, middle, ring) downwards onto the open flat palm of the left hand.' },
    { key: 'N', name: 'Letter N', img: '/assets/images/letters/n.jpg', desc: 'Right hand places two extended fingertips (index and middle) downwards onto the open flat palm of the left hand.' },
    { key: 'O', name: 'Letter O', img: '/assets/images/letters/o.jpg', desc: 'Left hand held open with fingers spread; the right index finger touches the tip of the left ring finger (fourth vowel).' },
    { key: 'P', name: 'Letter P', img: '/assets/images/letters/p.jpg', desc: 'Left index finger points vertically upward; right index finger and thumb form a loop touching near the top of the left index.' },
    { key: 'Q', name: 'Letter Q', img: '/assets/images/letters/q.jpg', desc: 'Left hand forms a circular loop with thumb and index finger; the right index finger hooks into the loop from above.' },
    { key: 'R', name: 'Letter R', img: '/assets/images/letters/r.jpg', desc: 'Right index finger curled into a gentle hook shape and placed horizontally against the open palm of the left hand.' },
    { key: 'S', name: 'Letter S', img: '/assets/images/letters/s.jpg', desc: 'Both hands hook their little fingers (pinkies) together securely in a linked lock.' },
    { key: 'T', name: 'Letter T', img: '/assets/images/letters/t.jpg', desc: 'Right extended index finger touches perpendicular to the outer edge of the upright left hand.' },
    { key: 'U', name: 'Letter U', img: '/assets/images/letters/u.jpg', desc: 'Left hand held open with fingers spread; the right index finger touches the tip of the left little finger (fifth vowel).' },
    { key: 'V', name: 'Letter V', img: '/assets/images/letters/v.jpg', desc: 'Right hand forms a distinct "V" victory shape with index and middle fingers, resting gently on the open palm of the left hand.' },
    { key: 'W', name: 'Letter W', img: '/assets/images/letters/w.jpg', desc: 'Both hands interlock all fingers diagonally with fingertips pointing upward in a weave.' },
    { key: 'X', name: 'Letter X', img: '/assets/images/letters/x.jpg', desc: 'Both index fingers are extended and crossed over each other at their midpoints to form an "X".' },
    { key: 'Y', name: 'Letter Y', img: '/assets/images/letters/y.jpg', desc: 'Right extended index finger touches directly into the cleft (V-space) between the thumb and index finger of the left open hand.' },
    { key: 'Z', name: 'Letter Z', img: '/assets/images/letters/z.jpg', desc: 'Left open palm held vertical with fingertips pointing upward; right fingertips touch horizontally against the left palm surface.' }
  ];

  const ISL_EXTRA_SIGNS = {
    'HELLO': { name: 'Word: HELLO', category: 'Conversational Sign', desc: 'Raise dominant hand to eyebrow/temple level and move outward in a polite waving salute.' },
    'THANK YOU': { name: 'Word: THANK YOU', category: 'Conversational Sign', desc: 'Touch fingertips of the flat hand to the chin, then move the hand forward and open towards the other person.' },
    'PLEASE': { name: 'Word: PLEASE', category: 'Conversational Sign', desc: 'Place flat dominant palm over the center of the chest and make gentle clockwise circles.' },
    'YES': { name: 'Word: YES', category: 'Conversational Sign', desc: 'Form a closed fist with dominant hand at chest height and nod the wrist up and down repeatedly.' },
    'NO': { name: 'Word: NO', category: 'Conversational Sign', desc: 'Extend index and middle fingers together, quickly snap them down against the thumb or wave firmly side-to-side.' },
    'HELP': { name: 'Word: HELP', category: 'Conversational Sign', desc: 'Place a closed "A" fist onto the open flat palm of the non-dominant hand and lift both hands upward together.' },
    'SORRY': { name: 'Word: SORRY', category: 'Conversational Sign', desc: 'Make a closed fist with thumb forward and rub gently in small circular motions over the chest/heart.' },
    'WATER': { name: 'Word: WATER', category: 'Conversational Sign', desc: 'Form a "W" shape with index, middle, and ring fingers and tap the index finger twice against the chin.' },
    'FOOD': { name: 'Word: FOOD', category: 'Conversational Sign', desc: 'Bring all fingertips together touching the thumb and tap them twice towards the mouth as if eating.' },
    'GOOD': { name: 'Word: GOOD', category: 'Conversational Sign', desc: 'Form a prominent thumbs-up gesture and hold it forward at chest height with confident posture.' },
    'SPACE': { name: 'Gesture: SPACE', category: 'Gesture Command', desc: 'Hold an open flat hand steady in front of the camera for 8 frames to finalize the word.' },
    'DEL': { name: 'Gesture: DEL (Backspace)', category: 'Gesture Command', desc: 'Swipe hand to the left or hold the backspace posture to delete the most recent signed letter.' },
    'CLEAR': { name: 'Gesture: CLEAR (Reset)', category: 'Gesture Command', desc: 'Cross both hands in an "X" shape across the camera field of view to reset the entire sentence.' }
  };

  // Filter Tabs
  const vocabTabs = document.querySelectorAll('.vocab-tab');
  const vocabCards = document.querySelectorAll('.vocab-card');

  vocabTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      vocabTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.getAttribute('data-filter');

      vocabCards.forEach(card => {
        const cat = card.getAttribute('data-cat');
        if (filter === 'all' || cat === filter) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 20);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(10px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 150);
        }
      });
    });
  });

  // Modal Elements
  const signModal = document.getElementById('signModal');
  const signModalBackdrop = document.getElementById('signModalBackdrop');
  const signModalClose = document.getElementById('signModalClose');
  const modalCategoryBadge = document.getElementById('modalCategoryBadge');
  const modalSignTitle = document.getElementById('modalSignTitle');
  const modalSignDesc = document.getElementById('modalSignDesc');
  const signModalImg = document.getElementById('signModalImg');
  const signImageSkeleton = document.getElementById('signImageSkeleton');
  const modalGestureText = document.getElementById('modalGestureText');
  const prevSignBtn = document.getElementById('prevSignBtn');
  const nextSignBtn = document.getElementById('nextSignBtn');
  const modalNavCounter = document.getElementById('modalNavCounter');

  let currentAlphaIndex = 0;

  function showAlpha(index) {
    if (index < 0 || index >= ISL_ALPHABETS.length) return;
    currentAlphaIndex = index;
    const item = ISL_ALPHABETS[currentAlphaIndex];

    modalCategoryBadge.textContent = 'Alphabet';
    modalCategoryBadge.className = 'modal-badge modal-badge-cat';
    modalSignTitle.innerHTML = `Letter <span id="modalLetterHighlight">${item.key}</span> Sign`;
    modalSignDesc.textContent = 'Official manual gesture for Indian Sign Language fingerspelling.';
    modalGestureText.textContent = item.desc;
    modalNavCounter.textContent = `${currentAlphaIndex + 1} / ${ISL_ALPHABETS.length}`;

    // Show image loading skeleton
    if (signImageSkeleton) signImageSkeleton.classList.remove('hidden');
    signModalImg.style.opacity = '0';

    const tempImg = new Image();
    tempImg.onload = () => {
      signModalImg.src = item.img;
      signModalImg.alt = `Indian Sign Language Sign for Letter ${item.key}`;
      signModalImg.style.opacity = '1';
      if (signImageSkeleton) signImageSkeleton.classList.add('hidden');
    };
    tempImg.onerror = () => {
      signModalImg.src = item.img;
      signModalImg.style.opacity = '1';
      if (signImageSkeleton) signImageSkeleton.classList.add('hidden');
    };
    tempImg.src = item.img;

    prevSignBtn.style.visibility = 'visible';
    nextSignBtn.style.visibility = 'visible';
  }

  function showWordOrControl(key) {
    const item = ISL_EXTRA_SIGNS[key];
    if (!item) return;

    modalCategoryBadge.textContent = item.category;
    modalCategoryBadge.className = 'modal-badge';
    modalSignTitle.innerHTML = `<span>${item.name}</span>`;
    modalSignDesc.textContent = 'Supported vocabulary recognized by the AI machine learning model.';
    modalGestureText.textContent = item.desc;
    modalNavCounter.textContent = item.category;

    // Use about visual as conceptual gesture illustration
    if (signImageSkeleton) signImageSkeleton.classList.remove('hidden');
    signModalImg.style.opacity = '0';
    const fallbackSrc = '/assets/images/about_isl_visual.jpg';
    const tempImg = new Image();
    tempImg.onload = () => {
      signModalImg.src = fallbackSrc;
      signModalImg.alt = `ISL Gesture for ${key}`;
      signModalImg.style.opacity = '1';
      if (signImageSkeleton) signImageSkeleton.classList.add('hidden');
    };
    tempImg.src = fallbackSrc;

    prevSignBtn.style.visibility = 'hidden';
    nextSignBtn.style.visibility = 'hidden';
  }

  function openSignModal(signKey) {
    if (!signModal) return;
    const cleanKey = (signKey || '').trim().toUpperCase();

    const alphaIdx = ISL_ALPHABETS.findIndex(a => a.key === cleanKey);
    if (alphaIdx !== -1) {
      showAlpha(alphaIdx);
    } else if (ISL_EXTRA_SIGNS[cleanKey]) {
      showWordOrControl(cleanKey);
    } else {
      // Default to first alphabet
      showAlpha(0);
    }

    signModal.classList.add('active');
    signModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (signModalClose) signModalClose.focus();
  }

  function closeSignModal() {
    if (!signModal) return;
    signModal.classList.remove('active');
    signModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Click & Keyboard on Vocabulary Cards
  vocabCards.forEach(card => {
    const handleCardActivate = () => {
      const sign = card.getAttribute('data-sign') || card.querySelector('.sign-key')?.textContent?.trim();
      openSignModal(sign);
    };

    card.addEventListener('click', handleCardActivate);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleCardActivate();
      }
    });
  });

  // Modal navigation & dismissal
  if (signModalClose) signModalClose.addEventListener('click', closeSignModal);
  if (signModalBackdrop) signModalBackdrop.addEventListener('click', closeSignModal);

  if (prevSignBtn) {
    prevSignBtn.addEventListener('click', () => {
      const prevIdx = (currentAlphaIndex - 1 + ISL_ALPHABETS.length) % ISL_ALPHABETS.length;
      showAlpha(prevIdx);
    });
  }

  if (nextSignBtn) {
    nextSignBtn.addEventListener('click', () => {
      const nextIdx = (currentAlphaIndex + 1) % ISL_ALPHABETS.length;
      showAlpha(nextIdx);
    });
  }

  // Keyboard navigation for modal
  document.addEventListener('keydown', (e) => {
    if (!signModal || !signModal.classList.contains('active')) return;
    if (e.key === 'Escape') {
      closeSignModal();
    } else if (e.key === 'ArrowLeft') {
      const prevIdx = (currentAlphaIndex - 1 + ISL_ALPHABETS.length) % ISL_ALPHABETS.length;
      showAlpha(prevIdx);
    } else if (e.key === 'ArrowRight') {
      const nextIdx = (currentAlphaIndex + 1) % ISL_ALPHABETS.length;
      showAlpha(nextIdx);
    }
  });

  /* -------------------------------------------------------------------------
     7. SCROLL REVEAL ANIMATIONS (IntersectionObserver)
     ------------------------------------------------------------------------- */
  const revealTargets = document.querySelectorAll(
    '.section-header, .about-visual-card, .glass-card, .architecture-showcase, .arch-pillar-card, .step-card, .vocab-grid, .cta-box'
  );

  revealTargets.forEach(el => el.classList.add('reveal-init'));

  if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-in');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealTargets.forEach(el => observer.observe(el));
  } else {
    revealTargets.forEach(el => el.classList.add('reveal-in'));
  }

  /* -------------------------------------------------------------------------
     8. BACKEND LIVE STATUS MONITOR
     ------------------------------------------------------------------------- */
  async function monitorBackend() {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        console.log('[ISL Platform] Backend Connected:', data);
      }
    } catch (e) {
      console.warn('[ISL Platform] Backend check info:', e.message);
    }
  }
  monitorBackend();
});
