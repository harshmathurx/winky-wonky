import { AudioSynth } from './audioSynth.js';
import { setAria, makeFocusable, onKeyActivation, prefersReducedMotion, onReducedMotionChange } from './utils.js';

/**
 * @typedef {Object} WobblyCheckboxOptions
 * @property {string} [labelText='Indie Cinema Mode'] - Visible label text.
 * @property {string} [ariaLabel] - Accessible name; defaults to `labelText`.
 * @property {boolean} [isJitterEnabled=true] - Play a jiggle animation on check.
 * @property {(checked: boolean) => void} [onChange] - Called with the new
 *   checked state whenever it changes from user interaction.
 */

/**
 * @typedef {Object} WobblyCheckboxInstance
 * @property {HTMLElement} el - Root element; append this to the DOM.
 * @property {() => boolean} getValue - Current checked state.
 * @property {(value: boolean) => void} setValue - Programmatically set the
 *   checked state. Updates DOM/ARIA; does NOT invoke `onChange`.
 * @property {(partial: {labelText?: string}) => void} setOptions - Updates
 *   the visible label text (does not touch the accessible name).
 * @property {() => void} destroy
 * @property {{isJitterEnabled: boolean}} config - Live-mutable passive knob.
 */

/**
 * Creates a hand-drawn checkbox that jitters when checked.
 * @param {WobblyCheckboxOptions} [options]
 * @returns {WobblyCheckboxInstance}
 */
export function createWobblyCheckbox(options = {}) {
  const container = document.createElement('div');
  container.className = 'winky-wobbly-checkbox-wrapper winky-focus-visible';
  container.setAttribute('role', 'checkbox');
  makeFocusable(container);

  const box = document.createElement('div');
  box.className = 'winky-wobbly-checkbox-box';
  box.setAttribute('aria-hidden', 'true');

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'winky-wobbly-check-svg');
  svg.setAttribute('viewBox', '0 0 24 24');

  const tick = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  tick.setAttribute('class', 'winky-wobbly-check-tick');
  tick.setAttribute('d', 'M 4.5 12.5 L 9.5 17 L 19.5 6');
  svg.appendChild(tick);
  box.appendChild(svg);
  container.appendChild(box);

  const label = document.createElement('span');
  label.textContent = options.labelText ?? 'Indie Cinema Mode';
  container.appendChild(label);

  let isChecked = false;
  const config = {
    isJitterEnabled: options.isJitterEnabled ?? true,
  };
  const onChange = options.onChange;
  const ariaLabel = options.ariaLabel ?? options.labelText ?? 'Indie Cinema Mode';
  let reducedMotion = prefersReducedMotion();

  setAria(container, {
    'checked': 'false',
    'label': ariaLabel,
  });

  // silent=true suppresses the click sound and onChange, used by setValue()
  // so programmatic toggles never fire the callback.
  function toggle(silent = false) {
    isChecked = !isChecked;

    if (isChecked) {
      if (!silent) AudioSynth.playClack();
      box.classList.add('winky-checked');

      if (config.isJitterEnabled && !reducedMotion && !silent) {
        box.classList.remove('winky-jittering');
        void box.offsetWidth;
        box.classList.add('winky-jittering');
      }
    } else {
      if (!silent) AudioSynth.playTick();
      box.classList.remove('winky-checked');
    }

    container.setAttribute('aria-checked', String(isChecked));

    if (!silent && onChange) {
      onChange(isChecked);
    }
  }

  container.addEventListener('click', () => toggle());
  onKeyActivation(container, () => toggle());

  box.addEventListener('animationend', () => {
    box.classList.remove('winky-jittering');
  });

  const motionListener = onReducedMotionChange(() => {
    reducedMotion = prefersReducedMotion();
    if (reducedMotion) {
      box.classList.remove('winky-jittering');
    }
  });

  function destroy() {
    motionListener();
  }

  function getValue() {
    return isChecked;
  }

  function setValue(v) {
    if (Boolean(v) === isChecked) return;
    toggle(true);
  }

  function setOptions(partial = {}) {
    if (partial.labelText !== undefined) {
      label.textContent = partial.labelText;
    }
  }

  return { el: container, getValue, setValue, setOptions, destroy, config };
}
