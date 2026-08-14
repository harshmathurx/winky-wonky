import { AudioSynth } from './audioSynth.js';
import { prefersReducedMotion, onReducedMotionChange } from './utils.js';

/**
 * @typedef {Object} MagneticButtonOptions
 * @property {number} [magneticRange=90] - Pointer distance in px within
 *   which the button starts being pulled toward the cursor.
 * @property {number} [pullStrength=0.45] - How strongly the button follows
 *   the cursor within range (0-1-ish; higher pulls harder).
 */

/**
 * @typedef {Object} MagneticButtonInstance
 * @property {HTMLElement} el - Root wrapper element; append this to the DOM.
 * @property {() => void} destroy - Removes the window-level pointermove
 *   listener, stops any in-flight hum sound, and removes the reduced-motion listener.
 * @property {{magneticRange: number, pullStrength: number}} config -
 *   Live-mutable physics knobs, read on every pointermove.
 */

/**
 * Creates a button that magnetically follows the pointer within range and
 * plays a proximity hum whose volume tracks distance.
 * @param {MagneticButtonOptions} [options]
 * @returns {MagneticButtonInstance}
 */
export function createMagneticButton(options = {}) {
  const wrapper = document.createElement('div');
  wrapper.className = 'winky-magnetic-btn-wrapper';

  const btn = document.createElement('button');
  btn.className = 'winky-magnetic-btn winky-focus-visible';
  btn.textContent = 'Hold Magnet';
  wrapper.appendChild(btn);

  const config = {
    magneticRange: options.magneticRange ?? 90,
    pullStrength: options.pullStrength ?? 0.45,
  };
  let activeHum = null;
  let reducedMotion = prefersReducedMotion();

  const onMouseMove = (e) => {
    if (reducedMotion) return;

    const rect = btn.getBoundingClientRect();
    const btnCenterX = rect.left + rect.width / 2;
    const btnCenterY = rect.top + rect.height / 2;

    const dx = e.clientX - btnCenterX;
    const dy = e.clientY - btnCenterY;
    const dist = Math.hypot(dx, dy);

    if (dist < config.magneticRange) {
      if (!activeHum) {
        activeHum = AudioSynth.startHum();
      }
      activeHum.updateVolume(dist);

      const force = (1 - dist / config.magneticRange) * config.pullStrength;
      const pullX = dx * force;
      const pullY = dy * force;

      const skewX = dx * 0.15 * force;
      const skewY = dy * 0.15 * force;

      btn.style.transform = `translate(${pullX}px, ${pullY}px) skew(${skewX}deg, ${skewY}deg)`;

      const pctLeft = 4 + Math.round(force * 10);
      const pctRight = 4 - Math.round(force * 5);
      btn.style.borderRadius = `${pctLeft}px ${pctRight}px ${pctLeft}px ${pctRight}px`;
    } else {
      btn.style.transform = 'none';
      btn.style.borderRadius = 'var(--winky-border-radius)';
      if (activeHum) {
        activeHum.stop();
        activeHum = null;
      }
    }
  };

  const onMouseLeave = () => {
    btn.style.transform = 'none';
    btn.style.borderRadius = 'var(--winky-border-radius)';
    if (activeHum) {
      activeHum.stop();
      activeHum = null;
    }
  };

  window.addEventListener('pointermove', onMouseMove);
  wrapper.addEventListener('pointerleave', onMouseLeave);

  btn.addEventListener('click', () => {
    AudioSynth.playClack();
    if (!reducedMotion) {
      btn.style.transform += ' scale(0.9)';
      setTimeout(() => { btn.style.transform = 'none'; }, 120);
    }
  });

  const motionListener = onReducedMotionChange(() => {
    reducedMotion = prefersReducedMotion();
    if (reducedMotion) {
      btn.style.transform = 'none';
      btn.style.borderRadius = 'var(--winky-border-radius)';
      if (activeHum) { activeHum.stop(); activeHum = null; }
    }
  });

  function destroy() {
    window.removeEventListener('pointermove', onMouseMove);
    if (activeHum) activeHum.stop();
    motionListener();
  }

  return { el: wrapper, destroy, config };
}
