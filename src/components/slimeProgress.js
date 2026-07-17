import { AudioSynth } from './audioSynth.js';
import { setAria, prefersReducedMotion, onReducedMotionChange } from './utils.js';

/**
 * @typedef {Object} SlimeProgressOptions
 * @property {number} [initialProgress=35] - Starting progress, 0-100.
 * @property {number} [meltDuration=1.5] - Drip animation duration in seconds
 *   when "melting" progress back down.
 * @property {string} [ariaLabel='Slime progress bar'] - Accessible name for
 *   the progressbar.
 * @property {(remainingProgress: number) => void} [onMeltComplete] - Called
 *   once all melt drips finish animating, with the progress value the melt
 *   started at (or `0` when melted via `setValue`/reduced motion).
 */

/**
 * @typedef {Object} SlimeProgressInstance
 * @property {HTMLElement} el - Root element (track + refill/melt buttons); append this to the DOM.
 * @property {() => number} getValue - Current rounded progress (0-100).
 * @property {(value: number) => void} setValue - Programmatically sets
 *   progress. Updates the DOM and ARIA state; does NOT invoke `onMeltComplete`.
 * @property {() => void} destroy - Removes the reduced-motion listener.
 * @property {{meltDuration: number}} config - Live-mutable secondary knob,
 *   read whenever a new melt starts.
 */

/**
 * Creates a progress bar that "melts" (drips) down instead of just shrinking.
 * @param {SlimeProgressOptions} [options]
 * @returns {SlimeProgressInstance}
 */
export function createSlimeProgress(options = {}) {
  const container = document.createElement('div');
  container.className = 'winky-slime-progress-container';

  const track = document.createElement('div');
  track.className = 'winky-slime-track';
  track.setAttribute('role', 'progressbar');

  const fill = document.createElement('div');
  fill.className = 'winky-slime-fill';
  fill.setAttribute('aria-hidden', 'true');
  track.appendChild(fill);

  const dripsContainer = document.createElement('div');
  dripsContainer.className = 'winky-slime-drips-container';
  dripsContainer.setAttribute('aria-hidden', 'true');
  track.appendChild(dripsContainer);

  container.appendChild(track);

  const btnRow = document.createElement('div');
  btnRow.style.display = 'flex';
  btnRow.style.gap = '0.5rem';

  const fillBtn = document.createElement('button');
  fillBtn.className = 'winky-slime-btn winky-focus-visible';
  fillBtn.textContent = 'Refill';
  btnRow.appendChild(fillBtn);

  const meltBtn = document.createElement('button');
  meltBtn.className = 'winky-slime-btn winky-focus-visible';
  meltBtn.textContent = 'Melt Progress';
  meltBtn.style.backgroundColor = 'var(--winky-accent-teal)';
  meltBtn.style.color = '#fff';
  btnRow.appendChild(meltBtn);

  container.appendChild(btnRow);

  let progress = options.initialProgress ?? 35;
  const config = {
    meltDuration: options.meltDuration ?? 1.5,
  };
  const onMeltComplete = options.onMeltComplete;
  const ariaLabel = options.ariaLabel ?? 'Slime progress bar';
  let reducedMotion = prefersReducedMotion();

  setAria(track, {
    'valuemin': '0',
    'valuemax': '100',
    'valuenow': String(Math.round(progress)),
    'valuetext': `${Math.round(progress)}%`,
    'label': ariaLabel,
  });

  function applyProgress(pct) {
    progress = Math.max(0, Math.min(100, pct));
    fill.style.width = `${progress}%`;
    track.setAttribute('aria-valuenow', String(Math.round(progress)));
    track.setAttribute('aria-valuetext', `${Math.round(progress)}%`);
  }

  function triggerMelt() {
    if (progress <= 5) return;
    if (reducedMotion) {
      applyProgress(0);
      if (onMeltComplete) onMeltComplete(0);
      return;
    }

    dripsContainer.replaceChildren();

    const dripCount = Math.floor(Math.random() * 3) + 3;
    const filledWidthPx = (progress / 100) * 260;

    let completedDrips = 0;

    for (let i = 0; i < dripCount; i++) {
      const leftOffset = Math.random() * (filledWidthPx - 15) + 5;

      const drip = document.createElement('div');
      drip.className = 'winky-slime-drip';
      drip.style.left = `${leftOffset}px`;
      drip.style.animationDuration = `${config.meltDuration}s`;

      const w = Math.random() * 6 + 6;
      drip.style.width = `${w}px`;

      dripsContainer.appendChild(drip);

      setTimeout(() => {
        drip.classList.add('winky-dripping');
        AudioSynth.playTick();
      }, i * 220);

      drip.addEventListener('animationend', () => {
        completedDrips++;
        if (completedDrips === dripCount && onMeltComplete) {
          onMeltComplete(progress);
        }
      });
    }
  }

  fillBtn.addEventListener('click', () => {
    AudioSynth.playClack();
    applyProgress(0);
    setTimeout(() => {
      applyProgress(Math.floor(Math.random() * 50) + 40);
    }, 150);
  });

  meltBtn.addEventListener('click', () => {
    AudioSynth.playClack();
    triggerMelt();
  });

  const motionListener = onReducedMotionChange(() => {
    reducedMotion = prefersReducedMotion();
  });

  applyProgress(progress);

  function destroy() {
    motionListener();
  }

  function getValue() {
    return Math.round(progress);
  }

  function setValue(v) {
    applyProgress(v);
  }

  return { el: container, getValue, setValue, destroy, config };
}
