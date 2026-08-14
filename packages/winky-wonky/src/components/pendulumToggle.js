import { AudioSynth } from './audioSynth.js';
import { setAria, makeFocusable, onKeyActivation, prefersReducedMotion, onReducedMotionChange } from './utils.js';

/**
 * @typedef {Object} PendulumToggleOptions
 * @property {boolean} [initialState=false] - Starting on/off state.
 * @property {number} [damping=0.5] - Overshoot damping for the swing physics.
 * @property {number} [swingTime=1.4] - Swing animation duration in seconds.
 * @property {string} [ariaLabel='Pendulum toggle switch'] - Accessible name.
 * @property {(state: boolean) => void} [onChange] - Called with the new
 *   on/off state whenever it changes from user interaction.
 */

/**
 * @typedef {Object} PendulumToggleInstance
 * @property {HTMLElement} el - Root element; append this to the DOM.
 * @property {() => boolean} getValue - Current on/off state.
 * @property {(value: boolean) => void} setValue - Programmatically set the
 *   state (snaps instantly, no swing). Updates DOM/ARIA; does NOT invoke `onChange`.
 * @property {() => void} destroy
 * @property {{damping: number, swingTime: number}} config - Live-mutable
 *   passive physics knobs.
 */

/**
 * Creates a pendulum-style toggle switch that swings and settles under damping.
 * @param {PendulumToggleOptions} [options]
 * @returns {PendulumToggleInstance}
 */
export function createPendulumToggle(options = {}) {
  const wrapper = document.createElement('div');
  wrapper.className = 'winky-pendulum-toggle-container';

  const pivotBox = document.createElement('div');
  pivotBox.className = 'winky-pendulum-pivot-box';

  const bracket = document.createElement('div');
  bracket.className = 'winky-pendulum-bracket';
  pivotBox.appendChild(bracket);

  const arm = document.createElement('div');
  arm.className = 'winky-toggle-arm winky-focus-visible';
  arm.setAttribute('role', 'switch');
  makeFocusable(arm);

  const bob = document.createElement('div');
  bob.className = 'winky-toggle-bob';
  bob.setAttribute('aria-hidden', 'true');
  arm.appendChild(bob);

  pivotBox.appendChild(arm);
  wrapper.appendChild(pivotBox);

  const labels = document.createElement('div');
  labels.className = 'winky-pendulum-toggle-labels';

  const labelOff = document.createElement('span');
  labelOff.className = 'winky-toggle-lbl';
  labelOff.textContent = 'OFF';
  labelOff.setAttribute('aria-hidden', 'true');
  labels.appendChild(labelOff);

  const labelOn = document.createElement('span');
  labelOn.className = 'winky-toggle-lbl';
  labelOn.textContent = 'ON';
  labelOn.setAttribute('aria-hidden', 'true');
  labels.appendChild(labelOn);

  wrapper.appendChild(labels);

  let isOn = options.initialState ?? false;
  const config = {
    damping: options.damping ?? 0.5,
    swingTime: options.swingTime ?? 1.4,
  };
  const onChange = options.onChange;
  const ariaLabel = options.ariaLabel ?? 'Pendulum toggle switch';
  let reducedMotion = prefersReducedMotion();

  arm.className = `winky-toggle-arm winky-focus-visible ${isOn ? 'winky-swing-right' : 'winky-swing-left'}`;
  setAria(arm, {
    'checked': String(isOn),
    'label': ariaLabel,
  });

  if (isOn) labelOn.classList.add('winky-active');
  else labelOff.classList.add('winky-active');

  function triggerSwing() {
    isOn = !isOn;
    AudioSynth.playTick();

    if (reducedMotion) {
      arm.classList.remove('winky-swing-left', 'winky-swing-right', 'winky-swinging');
      arm.classList.add(isOn ? 'winky-swing-right' : 'winky-swing-left');
    } else {
      const start = isOn ? -35 : 35;
      const target = isOn ? 35 : -35;
      const diff = target - start;

      const os1 = target + diff * config.damping * -0.5;
      const os2 = target + diff * config.damping * config.damping * 0.25;
      const os3 = target + diff * config.damping * config.damping * config.damping * -0.12;
      const os4 = target + diff * config.damping * config.damping * config.damping * config.damping * 0.06;

      arm.style.setProperty('--swing-start', `${start}deg`);
      arm.style.setProperty('--swing-overshoot1', `${os1}deg`);
      arm.style.setProperty('--swing-overshoot2', `${os2}deg`);
      arm.style.setProperty('--swing-overshoot3', `${os3}deg`);
      arm.style.setProperty('--swing-overshoot4', `${os4}deg`);
      arm.style.setProperty('--swing-target', `${target}deg`);

      arm.classList.remove('winky-swing-left', 'winky-swing-right', 'winky-swinging');
      void arm.offsetWidth;
      arm.style.animationDuration = `${config.swingTime}s`;
      arm.classList.add('winky-swinging');
    }

    if (isOn) {
      labelOn.classList.add('winky-active');
      labelOff.classList.remove('winky-active');
    } else {
      labelOff.classList.add('winky-active');
      labelOn.classList.remove('winky-active');
    }

    arm.setAttribute('aria-checked', String(isOn));
    if (onChange) onChange(isOn);
  }

  arm.addEventListener('animationend', () => {
    arm.classList.remove('winky-swinging');
    arm.classList.add(isOn ? 'winky-swing-right' : 'winky-swing-left');
    AudioSynth.playClack();
  });

  arm.addEventListener('click', triggerSwing);
  onKeyActivation(arm, triggerSwing);

  const motionListener = onReducedMotionChange(() => {
    reducedMotion = prefersReducedMotion();
    if (reducedMotion) {
      arm.classList.remove('winky-swinging');
      arm.classList.add(isOn ? 'winky-swing-right' : 'winky-swing-left');
    }
  });

  function destroy() {
    motionListener();
  }

  function getValue() {
    return isOn;
  }

  function setValue(v) {
    const next = Boolean(v);
    if (next === isOn) return;
    isOn = next;

    arm.classList.remove('winky-swing-left', 'winky-swing-right', 'winky-swinging');
    arm.classList.add(isOn ? 'winky-swing-right' : 'winky-swing-left');

    if (isOn) {
      labelOn.classList.add('winky-active');
      labelOff.classList.remove('winky-active');
    } else {
      labelOff.classList.add('winky-active');
      labelOn.classList.remove('winky-active');
    }

    arm.setAttribute('aria-checked', String(isOn));
  }

  return { el: wrapper, getValue, setValue, destroy, config };
}
