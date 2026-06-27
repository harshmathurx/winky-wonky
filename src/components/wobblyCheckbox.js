import { AudioSynth } from './audioSynth.js';
import { setAria, makeFocusable, onKeyActivation, prefersReducedMotion, onReducedMotionChange } from './utils.js';

export function createWobblyCheckbox(options = {}) {
  const container = document.createElement('div');
  container.className = 'wobbly-checkbox-wrapper winky-focus-visible';
  container.setAttribute('role', 'checkbox');
  makeFocusable(container);

  const box = document.createElement('div');
  box.className = 'wobbly-checkbox-box';
  box.setAttribute('aria-hidden', 'true');

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'wobbly-check-svg');
  svg.setAttribute('viewBox', '0 0 24 24');

  const tick = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  tick.setAttribute('class', 'wobbly-check-tick');
  tick.setAttribute('d', 'M 4.5 12.5 L 9.5 17 L 19.5 6');
  svg.appendChild(tick);
  box.appendChild(svg);
  container.appendChild(box);

  const label = document.createElement('span');
  label.textContent = options.labelText ?? 'Indie Cinema Mode';
  container.appendChild(label);

  let isChecked = false;
  let isJitterEnabled = options.isJitterEnabled ?? true;
  let labelText = options.labelText ?? 'Indie Cinema Mode';
  const onChange = options.onChange;
  let reducedMotion = prefersReducedMotion();

  setAria(container, {
    'checked': 'false',
    'label': labelText,
  });

  function toggle() {
    isChecked = !isChecked;

    if (isChecked) {
      AudioSynth.playClack();
      box.classList.add('checked');

      if (isJitterEnabled && !reducedMotion) {
        box.classList.remove('jittering');
        void box.offsetWidth;
        box.classList.add('jittering');
      }
    } else {
      AudioSynth.playTick();
      box.classList.remove('checked');
    }

    container.setAttribute('aria-checked', String(isChecked));

    if (onChange) {
      onChange(isChecked);
    }
  }

  container.addEventListener('click', toggle);
  onKeyActivation(container, toggle);

  box.addEventListener('animationend', () => {
    box.classList.remove('jittering');
  });

  const motionListener = onReducedMotionChange(() => {
    reducedMotion = prefersReducedMotion();
    if (reducedMotion) {
      box.classList.remove('jittering');
    }
  });

  container.destroy = () => {
    motionListener();
  };

  container.getControls = () => {
    return [
      { label: 'Enable Jitter', type: 'checkbox', value: isJitterEnabled, onChange: (v) => { isJitterEnabled = v; } },
      { label: 'Checkbox Label', type: 'text', value: labelText, onChange: (v) => { labelText = v; label.textContent = v; container.setAttribute('aria-label', v); } }
    ];
  };

  container.getCodeSnippet = () => {
    return `import { createWobblyCheckbox } from 'winky-wonky';

const checkbox = createWobblyCheckbox({
  labelText: 'Agree to Peculiarity',
  isJitterEnabled: true,
  onChange: (isChecked) => console.log('Checkbox status: ', isChecked)
});
document.body.appendChild(checkbox);`;
  };

  return container;
}
