import { AudioSynth } from './audioSynth.js';
import { setAria, makeFocusable, onKeyActivation, prefersReducedMotion, onReducedMotionChange } from './utils.js';

export function createWobblySwitch(options = {}) {
  const container = document.createElement('div');
  container.className = 'wobbly-switch-wrapper';

  const track = document.createElement('div');
  track.className = 'wobbly-switch-track winky-focus-visible';
  track.setAttribute('role', 'switch');
  makeFocusable(track);

  const thumb = document.createElement('div');
  thumb.className = 'wobbly-switch-thumb';
  thumb.setAttribute('aria-hidden', 'true');
  track.appendChild(thumb);

  const label = document.createElement('span');
  label.className = 'wobbly-switch-label';
  label.textContent = options.labelText ?? 'Enable Physics';
  container.appendChild(track);
  container.appendChild(label);

  let isOn = options.initialState ?? false;
  let springPower = options.springPower ?? 1.3;
  const onChange = options.onChange;
  let reducedMotion = prefersReducedMotion();

  setAria(track, {
    'checked': String(isOn),
    'label': label.textContent,
  });

  function updateVisual() {
    if (isOn) {
      track.classList.add('on');
      thumb.classList.add('on');
    } else {
      track.classList.remove('on');
      thumb.classList.remove('on');
    }
  }

  function toggle() {
    isOn = !isOn;
    AudioSynth.playClack();
    updateVisual();
    track.setAttribute('aria-checked', String(isOn));
    if (onChange) onChange(isOn);
  }

  track.addEventListener('click', toggle);
  onKeyActivation(track, toggle);

  updateVisual();

  const motionListener = onReducedMotionChange(() => {
    reducedMotion = prefersReducedMotion();
  });

  container.destroy = () => {
    motionListener();
  };

  container.getControls = () => {
    return [
      { label: 'Spring Power', type: 'range', min: 1.0, max: 1.8, step: 0.05, value: springPower, onChange: (v) => {
        springPower = parseFloat(v);
        track.style.setProperty('--winky-switch-spring', `cubic-bezier(0.34, ${springPower}, 0.64, 1)`);
      }},
      { label: 'Switch Label', type: 'text', value: label.textContent, onChange: (v) => {
        label.textContent = v;
        track.setAttribute('aria-label', v);
      }}
    ];
  };

  container.getCodeSnippet = () => {
    return `import { createWobblySwitch } from 'winky-wonky';

const sw = createWobblySwitch({
  labelText: 'Enable Physics',
  initialState: false,
  onChange: (isOn) => console.log('Switch:', isOn)
});
document.body.appendChild(sw);`;
  };

  return container;
}
