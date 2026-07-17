import { AudioSynth } from './audioSynth.js';
import { prefersReducedMotion, onReducedMotionChange } from './utils.js';

/**
 * @typedef {Object} DrunkLoaderOptions
 * @property {number} [baseSpeed=3.5] - Base rotation speed in degrees/frame.
 * @property {number} [wobbleSeverity=4] - Max px offset of the wobble drift.
 * @property {number} [drunkenness=2.8] - Amplitude of the speed oscillation.
 */

/**
 * @typedef {Object} DrunkLoaderInstance
 * @property {HTMLElement} el - Root element (spinner + status label); append this to the DOM.
 * @property {() => void} destroy - Cancels the rAF loop and the reduced-motion listener.
 * @property {{baseSpeed: number, wobbleSeverity: number, drunkenness: number}} config -
 *   Live-mutable physics knobs, read every frame.
 */

/**
 * Creates an indeterminate loading spinner that "stumbles" instead of
 * spinning uniformly. Runs a continuous rAF loop by design — this is its
 * idle/settled state, there is no interaction to idle back to.
 * @param {DrunkLoaderOptions} [options]
 * @returns {DrunkLoaderInstance}
 */
export function createDrunkLoader(options = {}) {
  const container = document.createElement('div');
  container.className = 'winky-drunk-loader-container';

  const spinner = document.createElement('div');
  spinner.className = 'winky-drunk-loader-spinner';
  spinner.setAttribute('aria-hidden', 'true');
  container.appendChild(spinner);

  const label = document.createElement('span');
  label.style.fontSize = '0.85rem';
  label.style.fontWeight = '600';
  label.textContent = 'Loading curiosities...';
  label.setAttribute('role', 'status');
  label.setAttribute('aria-live', 'polite');
  container.appendChild(label);

  const config = {
    baseSpeed: options.baseSpeed ?? 3.5,
    wobbleSeverity: options.wobbleSeverity ?? 4,
    drunkenness: options.drunkenness ?? 2.8,
  };

  let angle = 0;
  let time = 0;
  let isDestroyed = false;
  let lastTickAngle = 0;
  let reducedMotion = prefersReducedMotion();
  let animId = null;

  function update() {
    if (isDestroyed) return;

    if (reducedMotion) {
      angle += config.baseSpeed;
      spinner.style.transform = `rotate(${angle}deg)`;
      time += 0.04;
    } else {
      time += 0.04;

      const currentSpeed = config.baseSpeed + Math.sin(time) * config.drunkenness;
      angle += currentSpeed;

      const rx = Math.sin(time * 1.7) * config.wobbleSeverity;
      const ry = Math.cos(time * 1.3) * config.wobbleSeverity;

      spinner.style.transform = `rotate(${angle}deg) translate(${rx}px, ${ry}px)`;

      if (Math.abs(currentSpeed) < 2.0 && Math.abs(angle - lastTickAngle) > 45) {
        AudioSynth.playTick();
        lastTickAngle = angle;
        label.textContent = 'Struggling to load...';
      } else if (Math.abs(currentSpeed) >= 2.0) {
        label.textContent = 'Loading curiosities...';
      }
    }

    animId = requestAnimationFrame(update);
  }

  animId = requestAnimationFrame(update);

  const motionListener = onReducedMotionChange(() => {
    reducedMotion = prefersReducedMotion();
  });

  function destroy() {
    isDestroyed = true;
    if (animId) cancelAnimationFrame(animId);
    motionListener();
  }

  return { el: container, destroy, config };
}
