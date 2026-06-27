import { AudioSynth } from './audioSynth.js';
import { setAria, makeFocusable, onKeyActivation, prefersReducedMotion, onReducedMotionChange } from './utils.js';

export function createPendulumToggle(options = {}) {
  const wrapper = document.createElement('div');
  wrapper.className = 'pendulum-toggle-container';

  const pivotBox = document.createElement('div');
  pivotBox.className = 'pendulum-pivot-box';

  const bracket = document.createElement('div');
  bracket.className = 'pendulum-bracket';
  pivotBox.appendChild(bracket);

  const arm = document.createElement('div');
  arm.className = 'toggle-arm winky-focus-visible';
  arm.setAttribute('role', 'switch');
  makeFocusable(arm);

  const bob = document.createElement('div');
  bob.className = 'toggle-bob';
  bob.setAttribute('aria-hidden', 'true');
  arm.appendChild(bob);

  pivotBox.appendChild(arm);
  wrapper.appendChild(pivotBox);

  const labels = document.createElement('div');
  labels.className = 'pendulum-toggle-labels';

  const labelOff = document.createElement('span');
  labelOff.className = 'toggle-lbl';
  labelOff.textContent = 'OFF';
  labelOff.setAttribute('aria-hidden', 'true');
  labels.appendChild(labelOff);

  const labelOn = document.createElement('span');
  labelOn.className = 'toggle-lbl';
  labelOn.textContent = 'ON';
  labelOn.setAttribute('aria-hidden', 'true');
  labels.appendChild(labelOn);

  wrapper.appendChild(labels);

  let isOn = options.initialState ?? false;
  let damping = options.damping ?? 0.5;
  let swingTime = options.swingTime ?? 1.4;
  const onChange = options.onChange;
  let reducedMotion = prefersReducedMotion();

  arm.className = `toggle-arm winky-focus-visible ${isOn ? 'swing-right' : 'swing-left'}`;
  setAria(arm, {
    'checked': String(isOn),
    'label': 'Pendulum toggle switch',
  });

  if (isOn) labelOn.classList.add('active');
  else labelOff.classList.add('active');

  function triggerSwing() {
    isOn = !isOn;
    AudioSynth.playTick();

    if (reducedMotion) {
      arm.classList.remove('swing-left', 'swing-right', 'swinging');
      arm.classList.add(isOn ? 'swing-right' : 'swing-left');
    } else {
      const start = isOn ? -35 : 35;
      const target = isOn ? 35 : -35;
      const diff = target - start;

      const os1 = target + diff * damping * -0.5;
      const os2 = target + diff * damping * damping * 0.25;
      const os3 = target + diff * damping * damping * damping * -0.12;
      const os4 = target + diff * damping * damping * damping * damping * 0.06;

      arm.style.setProperty('--swing-start', `${start}deg`);
      arm.style.setProperty('--swing-overshoot1', `${os1}deg`);
      arm.style.setProperty('--swing-overshoot2', `${os2}deg`);
      arm.style.setProperty('--swing-overshoot3', `${os3}deg`);
      arm.style.setProperty('--swing-overshoot4', `${os4}deg`);
      arm.style.setProperty('--swing-target', `${target}deg`);

      arm.classList.remove('swing-left', 'swing-right', 'swinging');
      void arm.offsetWidth;
      arm.style.animationDuration = `${swingTime}s`;
      arm.classList.add('swinging');
    }

    if (isOn) {
      labelOn.classList.add('active');
      labelOff.classList.remove('active');
    } else {
      labelOff.classList.add('active');
      labelOn.classList.remove('active');
    }

    arm.setAttribute('aria-checked', String(isOn));
    if (onChange) onChange(isOn);
  }

  arm.addEventListener('animationend', () => {
    arm.classList.remove('swinging');
    arm.classList.add(isOn ? 'swing-right' : 'swing-left');
    AudioSynth.playClack();
  });

  arm.addEventListener('click', triggerSwing);
  onKeyActivation(arm, triggerSwing);

  const motionListener = onReducedMotionChange(() => {
    reducedMotion = prefersReducedMotion();
    if (reducedMotion) {
      arm.classList.remove('swinging');
      arm.classList.add(isOn ? 'swing-right' : 'swing-left');
    }
  });

  wrapper.destroy = () => {
    motionListener();
  };

  wrapper.getControls = () => {
    return [
      { label: 'Swing Weight (s)', type: 'range', min: 0.8, max: 2.5, step: 0.1, value: swingTime, onChange: (v) => { swingTime = parseFloat(v); } },
      { label: 'Physics Damping', type: 'range', min: 0.1, max: 0.8, step: 0.05, value: damping, onChange: (v) => { damping = parseFloat(v); } }
    ];
  };

  wrapper.getCodeSnippet = () => {
    return `import { createPendulumToggle } from 'winky-wonky';

const toggle = createPendulumToggle({
  initialState: false,
  damping: 0.5,
  swingTime: 1.4,
  onChange: (state) => console.log('Toggle state shifted to: ', state)
});
document.body.appendChild(toggle);`;
  };

  return wrapper;
}
