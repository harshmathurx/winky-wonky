import { AudioSynth } from './audioSynth.js';
import { setAria, prefersReducedMotion, onReducedMotionChange } from './utils.js';

/**
 * @typedef {Object} RippleButtonOptions
 * @property {string} [label='Press Me'] - Visible button text.
 * @property {string} [ariaLabel] - Accessible name override (falls back to the visible label).
 * @property {string} [rippleColor] - CSS color for the ripple; defaults to the theme accent.
 * @property {number} [maxRipples=1] - Max concurrent ripples before the oldest is evicted.
 * @property {() => void} [onClick] - Called on activation (pointerdown or Enter/Space).
 */

/**
 * @typedef {Object} RippleButtonInstance
 * @property {HTMLElement} el - Root element; append this to the DOM.
 * @property {() => void} destroy - Removes any in-flight ripples and listeners.
 * @property {{maxRipples: number}} config - Live-mutable secondary knob.
 * @property {(partial: {label?: string}) => void} setOptions - Update the
 *   visible button label after creation.
 */

/**
 * Creates a button with a material-style ripple that originates from the
 * click/tap point, plus a haptic "clack" on press.
 * @param {RippleButtonOptions} [options]
 * @returns {RippleButtonInstance}
 */
export function createRippleButton(options = {}) {
  const container = document.createElement('div');
  container.className = 'winky-ripple-btn-container';

  const btn = document.createElement('button');
  btn.className = 'winky-ripple-btn winky-focus-visible';
  btn.textContent = options.label ?? 'Press Me';
  if (options.ariaLabel) btn.setAttribute('aria-label', options.ariaLabel);
  container.appendChild(btn);

  let rippleColor = options.rippleColor ?? null;
  const config = {
    maxRipples: options.maxRipples ?? 1,
  };
  let reducedMotion = prefersReducedMotion();
  const onClick = options.onClick;
  let activeRipples = [];

  function createRipple(x, y) {
    while (activeRipples.length >= config.maxRipples) {
      const old = activeRipples.shift();
      if (old && old.parentNode) old.remove();
    }

    const ripple = document.createElement('span');
    ripple.className = 'winky-ripple-effect';
    ripple.setAttribute('aria-hidden', 'true');

    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const left = x - rect.left - size / 2;
    const top = y - rect.top - size / 2;

    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${left}px`;
    ripple.style.top = `${top}px`;

    if (rippleColor) {
      ripple.style.background = rippleColor;
    }

    btn.appendChild(ripple);
    activeRipples.push(ripple);

    if (reducedMotion) {
      ripple.style.opacity = '0';
      setTimeout(() => { if (ripple.parentNode) ripple.remove(); }, 100);
    } else {
      ripple.classList.add('winky-expanding');
      setTimeout(() => {
        if (ripple.parentNode) ripple.remove();
        activeRipples = activeRipples.filter(r => r !== ripple);
      }, 600);
    }
  }

  btn.addEventListener('pointerdown', (e) => {
    AudioSynth.playClack();
    createRipple(e.clientX, e.clientY);
    if (onClick) onClick();
  });

  btn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      AudioSynth.playClack();
      const rect = btn.getBoundingClientRect();
      createRipple(rect.left + rect.width / 2, rect.top + rect.height / 2);
      if (onClick) onClick();
    }
  });

  const motionListener = onReducedMotionChange(() => {
    reducedMotion = prefersReducedMotion();
  });

  function destroy() {
    activeRipples.forEach(r => { if (r.parentNode) r.remove(); });
    motionListener();
  }

  function setOptions(partial = {}) {
    if (partial.label != null) {
      btn.textContent = partial.label;
    }
  }

  return { el: container, destroy, config, setOptions };
}
