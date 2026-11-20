/**
 * ISL Detect – Real Human Video Lessons Engine
 * Interactive learning interface with authentic human sign language video demonstrations.
 */

document.addEventListener('DOMContentLoaded', () => {
  let phrasesData = [];
  let currentLessonIdx = 0;
  let currentFilter = 'all';

  // DOM Elements - Spotlight Player
  const spotlightIframe = document.getElementById('spotlightIframe');
  const spotlightLessonNum = document.getElementById('spotlightLessonNum');
  const spotlightCategoryBadge = document.getElementById('spotlightCategoryBadge');
  const spotlightInstructorBadge = document.getElementById('spotlightInstructorBadge');
  const spotlightPhraseTitle = document.getElementById('spotlightPhraseTitle');
  const spotlightDesc = document.getElementById('spotlightDesc');
  const spotlightTranslations = document.getElementById('spotlightTranslations');
  const spotlightComponentsGrid = document.getElementById('spotlightComponentsGrid');
  const spotlightStepsList = document.getElementById('spotlightStepsList');
  const spotlightCulturalNote = document.getElementById('spotlightCulturalNote');
  const extYtLink = document.getElementById('extYtLink');

  // Navigation & Control Elements
  const btnPrevLesson = document.getElementById('btnPrevLesson');
  const btnNextLesson = document.getElementById('btnNextLesson');
  const lessonNavIndicator = document.getElementById('lessonNavIndicator');
  const lessonsGrid = document.getElementById('lessonsGrid');
  const lessonsGridCount = document.getElementById('lessonsGridCount');
  const filterTabs = document.querySelectorAll('.lesson-tab-btn');

  // Trilingual Audio Buttons
  const btnSpeakEnglish = document.getElementById('btnSpeakEnglish');
  const btnSpeakHindi = document.getElementById('btnSpeakHindi');
  const btnSpeakKannada = document.getElementById('btnSpeakKannada');

  // Speed Pill Buttons
  const speedPills = document.querySelectorAll('.speed-pill-btn');

  /**
   * Trilingual Speech Synthesis (English, Hindi, Kannada)
   */
  function speakPhrase(text, lang) {
    if (!('speechSynthesis' in window) || !text) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const match = voices.find(v => v.lang.startsWith(lang.slice(0, 2)));
      if (match) utterance.voice = match;
    }
    window.speechSynthesis.speak(utterance);
  }

  /**
   * Display selected lesson in the Spotlight Demonstration Panel
   */
  function displayLesson(idx) {
    if (!phrasesData || phrasesData.length === 0) return;
    if (idx < 0) idx = phrasesData.length - 1;
    if (idx >= phrasesData.length) idx = 0;
    currentLessonIdx = idx;

    const item = phrasesData[currentLessonIdx];
    if (!item) return;

    // 1. Update Real Human Video IFrame Embed with that lesson's unique video
    if (spotlightIframe) {
      const embedUrl = item.embed_url || `https://www.youtube-nocookie.com/embed/${item.youtube_id}?rel=0`;
      spotlightIframe.src = embedUrl;
      spotlightIframe.title = `Real Human Demonstration for "${item.phrase}" by ${item.instructor}`;
    }

    // 2. Update Header Info
    if (spotlightLessonNum) {
      spotlightLessonNum.textContent = `Lesson ${item.id.toString().padStart(2, '0')} / 10`;
    }
    if (spotlightCategoryBadge) {
      spotlightCategoryBadge.textContent = item.category;
    }
    if (spotlightInstructorBadge) {
      spotlightInstructorBadge.innerHTML = `<span>👤 Human Signer:</span> <strong>${item.instructor || 'Certified ISL Interpreter'}</strong>`;
    }
    if (spotlightPhraseTitle) {
      spotlightPhraseTitle.textContent = item.phrase;
    }
    if (spotlightDesc) {
      spotlightDesc.textContent = item.description;
    }

    // 3. Update External Link
    if (extYtLink) {
      extYtLink.href = item.reference_url || `https://www.youtube.com/watch?v=${item.youtube_id}`;
      extYtLink.title = `Watch complete tutorial on YouTube for "${item.phrase}"`;
    }

    // 4. Update Trilingual Translations
    if (spotlightTranslations) {
      spotlightTranslations.innerHTML = `
        <span class="trans-tag"><strong>English:</strong> ${item.english}</span>
        <span class="trans-tag"><strong>Hindi:</strong> ${item.hindi}</span>
        <span class="trans-tag"><strong>Kannada:</strong> ${item.kannada}</span>
      `;
    }

    // 5. Update 4-Part Spatial Components
    if (spotlightComponentsGrid && item.components) {
      spotlightComponentsGrid.innerHTML = `
        <div class="comp-item">
          <span class="comp-item-label">🖐️ Handshape</span>
          <span class="comp-item-val">${item.components.handshape || 'Open Flat Palm'}</span>
        </div>
        <div class="comp-item">
          <span class="comp-item-label">📍 Signing Location</span>
          <span class="comp-item-val">${item.components.location || 'Center Chest / Torso'}</span>
        </div>
        <div class="comp-item">
          <span class="comp-item-label">🔄 Movement Dynamic</span>
          <span class="comp-item-val">${item.components.movement || 'Smooth forward arc'}</span>
        </div>
        <div class="comp-item">
          <span class="comp-item-label">😊 Facial Expression</span>
          <span class="comp-item-val">${item.components.expression || 'Welcoming eye contact'}</span>
        </div>
      `;
    }

    // 6. Update Step-by-Step Instructions
    if (spotlightStepsList && item.steps) {
      spotlightStepsList.innerHTML = '';
      item.steps.forEach(step => {
        const li = document.createElement('li');
        li.textContent = step;
        spotlightStepsList.appendChild(li);
      });
    }

    // 7. Cultural / Interpreter Note
    if (spotlightCulturalNote) {
      spotlightCulturalNote.textContent = item.cultural_note || 'Practice this sign with natural hand posture and steady eye contact.';
    }

    // 8. Navigation Counter
    if (lessonNavIndicator) {
      lessonNavIndicator.textContent = `${currentLessonIdx + 1} of ${phrasesData.length}`;
    }

    // 9. Highlight active card in grid
    document.querySelectorAll('.lesson-card').forEach(card => {
      const pid = parseInt(card.getAttribute('data-id'), 10);
      card.classList.toggle('active', pid === item.id);
    });
  }

  /**
   * Render 10-Lesson Interactive Cards Grid
   */
  function renderLessonsGrid() {
    if (!lessonsGrid || !phrasesData) return;
    lessonsGrid.innerHTML = '';

    const filtered = currentFilter === 'all'
      ? phrasesData
      : phrasesData.filter(p => p.category.toLowerCase().includes(currentFilter.toLowerCase()));

    if (lessonsGridCount) {
      lessonsGridCount.textContent = `Showing ${filtered.length} of ${phrasesData.length} Real Human Lessons`;
    }

    filtered.forEach(p => {
      const card = document.createElement('article');
      card.className = `lesson-card ${p.id === phrasesData[currentLessonIdx]?.id ? 'active' : ''}`;
      card.setAttribute('data-id', p.id);
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `Watch Real Human Video Lesson for ${p.phrase}`);

      card.innerHTML = `
        <div class="lesson-card-top">
          <span class="card-lesson-num">Lesson ${p.id.toString().padStart(2, '0')}</span>
          <span class="card-human-pill">👤 Real Human</span>
          <span class="card-category-tag">${p.category}</span>
        </div>
        <h4 class="card-title">${p.phrase}</h4>
        <div class="card-translations">${p.hindi} • ${p.kannada}</div>
        <div class="card-footer">
          <span class="card-instructor-text">${p.instructor || 'Certified ISL Interpreter'}</span>
          <span class="card-watch-cta">Watch Lesson →</span>
        </div>
      `;

      card.addEventListener('click', () => {
        const targetIdx = phrasesData.findIndex(item => item.id === p.id);
        if (targetIdx !== -1) {
          displayLesson(targetIdx);
          const spotlightEl = document.getElementById('lessonSpotlightCard');
          if (spotlightEl) {
            spotlightEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.click();
        }
      });

      lessonsGrid.appendChild(card);
    });
  }

  // Prev / Next Navigation Buttons
  if (btnPrevLesson) {
    btnPrevLesson.addEventListener('click', () => {
      displayLesson(currentLessonIdx - 1);
    });
  }

  if (btnNextLesson) {
    btnNextLesson.addEventListener('click', () => {
      displayLesson(currentLessonIdx + 1);
    });
  }

  // Trilingual Audio Pronunciation Click Handlers
  if (btnSpeakEnglish) {
    btnSpeakEnglish.addEventListener('click', () => {
      const p = phrasesData[currentLessonIdx];
      if (p) speakPhrase(p.english, 'en-IN');
    });
  }

  if (btnSpeakHindi) {
    btnSpeakHindi.addEventListener('click', () => {
      const p = phrasesData[currentLessonIdx];
      if (p) speakPhrase(p.hindi, 'hi-IN');
    });
  }

  if (btnSpeakKannada) {
    btnSpeakKannada.addEventListener('click', () => {
      const p = phrasesData[currentLessonIdx];
      if (p) speakPhrase(p.kannada, 'kn-IN');
    });
  }

  // Speed Pill Switchers (Helpful guidance tips for slow-motion learning)
  if (speedPills) {
    speedPills.forEach(pill => {
      pill.addEventListener('click', () => {
        speedPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const speed = pill.getAttribute('data-speed');
        // If user clicks slow-mo, remind them they can also use YouTube's gear icon
        console.log(`[Lessons] Speed preference set to: ${speed}x`);
      });
    });
  }

  // Category Filter Tabs
  if (filterTabs) {
    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentFilter = tab.getAttribute('data-filter') || 'all';
        renderLessonsGrid();
      });
    });
  }

  // Initialize Lessons by Fetching from API
  async function initLessons() {
    try {
      const res = await fetch('/api/phrases');
      if (res.ok) {
        const data = await res.json();
        phrasesData = data.phrases || [];
      }
    } catch (e) {
      console.warn('[Lessons] Could not fetch phrases:', e);
    }

    if (phrasesData.length > 0) {
      displayLesson(0);
      renderLessonsGrid();
    }
  }

  initLessons();
});

