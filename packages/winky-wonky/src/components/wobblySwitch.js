import { AudioSynth } from './audioSynth.js';
import { setAria, makeFocusable, onKeyActivation, prefersReducedMotion, onReducedMotionChange } from './utils.js';

/**
 * @typedef {Object} WobblySwitchOptions
 * @property {string} [labelText='Enable Physics'] - Visible label text.
 * @property {boolean} [initialState=false] - Starting on/off state.
 * @property {number} [springPower=1.3] - Cubic-bezier overshoot factor for
 *   the thumb's toggle animation.
 * @property {string} [ariaLabel] - Accessible name for the switch; defaults
 *   to `labelText`.
 * @property {(isOn: boolean) => void} [onChange] - Called with the new
 *   state whenever it's toggled by user interaction (never from `setValue`).
 */

/**
 * @typedef {Object} WobblySwitchInstance
 * @property {HTMLElement} el - Root element (track + label); append this to the DOM.
 * @property {() => boolean} getValue - Current on/off state.
 * @property {(value: boolean) => void} setValue - Programmatically sets the
 *   state. Updates the DOM and ARIA state; does NOT invoke `onChange`.
 * @property {() => void} destroy - Removes the reduced-motion listener.
 * @property {{springPower: number}} config - Live-mutable secondary knob;
 *   prefer `setOptions` for changes that need to update the applied CSS variable.
 * @property {(partial: {springPower?: number, labelText?: string}) => void} setOptions -
 *   Updates the spring power and/or label text.
 */

/**
 * Creates a toggle switch with an overshooting, wobbly thumb animation.
 * @param {WobblySwitchOptions} [options]
 * @returns {WobblySwitchInstance}
 */
export function createWobblySwitch(options = {}) {
  const container = document.createElement('div');
  container.className = 'winky-wobbly-switch-wrapper';

  const track = document.createElement('div');
  track.className = 'winky-wobbly-switch-track winky-focus-visible';
  track.setAttribute('role', 'switch');
  makeFocusable(track);

  const thumb = document.createElement('div');
  thumb.className = 'winky-wobbly-switch-thumb';
  thumb.setAttribute('aria-hidden', 'true');
  track.appendChild(thumb);

  const label = document.createElement('span');
  label.className = 'winky-wobbly-switch-label';
  label.textContent = options.labelText ?? 'Enable Physics';
  container.appendChild(track);
  container.appendChild(label);

  let isOn = options.initialState ?? false;
  const config = {
    springPower: options.springPower ?? 1.3,
  };
  const onChange = options.onChange;
  const ariaLabel = options.ariaLabel ?? label.textContent;
  let reducedMotion = prefersReducedMotion();

  setAria(track, {
    'checked': String(isOn),
    'label': ariaLabel,
  });

  function updateVisual() {
    if (isOn) {
      track.classList.add('winky-on');
      thumb.classList.add('winky-on');
    } else {
      track.classList.remove('winky-on');
      thumb.classList.remove('winky-on');
    }
    track.setAttribute('aria-checked', String(isOn));
  }

  function toggle() {
    isOn = !isOn;
    AudioSynth.playClack();
    updateVisual();
    if (onChange) onChange(isOn);
  }

  track.addEventListener('click', toggle);
  onKeyActivation(track, toggle);

  updateVisual();

  const motionListener = onReducedMotionChange(() => {
    reducedMotion = prefersReducedMotion();
  });

  function destroy() {
    motionListener();
  }

  function getValue() {
    return isOn;
  }

  function setValue(v) {
    isOn = Boolean(v);
    updateVisual();
  }

  function setOptions(partial = {}) {
    if (partial.springPower != null) {
      config.springPower = partial.springPower;
      track.style.setProperty('--winky-switch-spring', `cubic-bezier(0.34, ${config.springPower}, 0.64, 1)`);
    }
    if (partial.labelText != null) {
      label.textContent = partial.labelText;
    }
  }

  return { el: container, getValue, setValue, destroy, config, setOptions };
}
