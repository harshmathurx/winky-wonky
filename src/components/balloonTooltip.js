import { AudioSynth } from './audioSynth.js';
import { setAria, prefersReducedMotion, onReducedMotionChange } from './utils.js';

export function createBalloonTooltip(options = {}) {
  const container = document.createElement('div');
  container.className = 'tooltip-target-wrapper';

  const trigger = options.triggerNode ?? document.createElement('button');
  if (!options.triggerNode) {
    trigger.className = 'mischievous-btn winky-focus-visible';
    trigger.style.boxShadow = 'none';
    trigger.textContent = 'Hover Over Me';
  }
  trigger.classList.add('winky-focus-visible');
  container.appendChild(trigger);

  const tooltip = document.createElement('div');
  tooltip.className = 'balloon-tooltip';
  tooltip.setAttribute('role', 'tooltip');

  const body = document.createElement('div');
  body.className = 'balloon-body';
  body.textContent = options.text ?? 'Curiosity Box!';
  tooltip.appendChild(body);

  const stringSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  stringSvg.setAttribute('class', 'balloon-string-svg');
  stringSvg.setAttribute('aria-hidden', 'true');

  const stringPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  stringPath.setAttribute('class', 'balloon-string-path');
  stringSvg.appendChild(stringPath);
  tooltip.appendChild(stringSvg);

  container.appendChild(tooltip);

  setAria(trigger, {
    'describedby': undefined,
  });
  tooltip.id = `winky-tooltip-${Math.random().toString(36).slice(2, 9)}`;
  trigger.setAttribute('aria-describedby', tooltip.id);

  let stringLength = options.stringLength ?? 25;
  let text = options.text ?? 'Curiosity Box!';
  let reducedMotion = prefersReducedMotion();

  function updateString() {
    stringSvg.setAttribute('height', `${stringLength}`);
    const half = stringLength / 2;
    stringPath.setAttribute('d', `M 10 0 Q 3 ${half / 2} 10 ${half} T 10 ${stringLength}`);
    tooltip.style.bottom = `calc(100% + ${stringLength - 5}px)`;
  }

  function showTooltip() {
    tooltip.style.transform = 'translate(-50%, 0) scale(1)';
    tooltip.style.opacity = '1';
    AudioSynth.playClack();
  }

  function hideTooltip() {
    tooltip.style.transform = 'translate(-50%, 15px) scale(0)';
    tooltip.style.opacity = '0';
  }

  trigger.addEventListener('pointerenter', showTooltip);
  trigger.addEventListener('pointerleave', hideTooltip);
  trigger.addEventListener('focus', showTooltip);
  trigger.addEventListener('blur', hideTooltip);

  const motionListener = onReducedMotionChange(() => {
    reducedMotion = prefersReducedMotion();
  });

  updateString();

  container.destroy = () => {
    motionListener();
  };

  container.getControls = () => {
    return [
      { label: 'String Length', type: 'range', min: 15, max: 45, step: 5, value: stringLength, onChange: (v) => { stringLength = parseInt(v); updateString(); } },
      { label: 'Tooltip Text', type: 'text', value: text, onChange: (v) => { text = v; body.textContent = v; } }
    ];
  };

  container.getCodeSnippet = () => {
    return `import { createBalloonTooltip } from 'winky-wonky';

const targetBtn = document.createElement('button');
targetBtn.textContent = 'Hover me';

const tooltip = createBalloonTooltip({
  text: 'Behold the secret!',
  stringLength: 20,
  triggerNode: targetBtn
});
document.body.appendChild(tooltip);`;
  };

  return container;
}
