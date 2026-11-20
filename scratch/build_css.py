with open(r'c:\ISL Major Project\scratch\real_old_css.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Add styling for any missing classes and ensure hud-step-tracker is display: none
additional_css = """
/* =============================================================================
   ENHANCED POLISH & SPECIFIC COMPONENT FIXES
   ============================================================================= */

/* Cleanly hide the middle motion step tracker as requested */
.hud-step-tracker {
  display: none !important;
}

/* Nav Brand Text */
.brand-text {
  font-family: var(--font-display, 'Outfit', sans-serif);
  font-weight: 700;
  font-size: 1.1rem;
  color: #ffffff;
  letter-spacing: -0.01em;
}

/* Stage Reset Camera Button */
.btn-reset-cam {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: #cbd5e1;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: all 0.2s ease;
}

.btn-reset-cam:hover {
  background: rgba(0, 240, 255, 0.15);
  border-color: var(--s2s-cyan, #00f0ff);
  color: #ffffff;
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.25);
}

/* Footer Feature Item Icon */
.feat-icon {
  font-size: 1.05rem;
  display: inline-flex;
  align-items: center;
}

/* HUD Banner Title Line */
.hud-title-line {
  margin-top: 2px;
}

/* Match Feedback Message */
.match-msg {
  font-size: 0.88rem;
  color: #cbd5e1;
  line-height: 1.4;
}

.match-msg strong {
  color: var(--s2s-cyan, #00f0ff);
}

/* Mic Ripple Rings on Listening */
.mic-ripple-ring {
  position: absolute;
  border-radius: 50%;
  border: 2px solid var(--s2s-cyan, #00f0ff);
  opacity: 0;
  pointer-events: none;
}

.ring-1 {
  width: 100%;
  height: 100%;
}

.ring-2 {
  width: 125%;
  height: 125%;
}

.s2s-mic-btn.listening .ring-1 {
  animation: s2sRipple 1.6s infinite cubic-bezier(0.2, 0.8, 0.4, 1);
}

.s2s-mic-btn.listening .ring-2 {
  animation: s2sRipple 1.6s 0.75s infinite cubic-bezier(0.2, 0.8, 0.4, 1);
}

@keyframes s2sRipple {
  0% {
    transform: scale(0.9);
    opacity: 0.8;
  }
  100% {
    transform: scale(1.6);
    opacity: 0;
  }
}

/* Linguistic Side Card Header */
.side-card-header {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.side-card-title-wrap {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* Ensure stage-viewport-container height is roomy for large avatar */
.stage-viewport-container {
  height: 560px !important;
  min-height: 560px !important;
}
"""

full_css = css + "\n" + additional_css

with open(r'c:\ISL Major Project\speech_to_sign.css', 'w', encoding='utf-8') as f:
    f.write(full_css)

print('Updated speech_to_sign.css successfully, length:', len(full_css))
