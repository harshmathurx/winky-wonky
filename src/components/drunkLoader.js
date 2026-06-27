import { AudioSynth } from './audioSynth.js';
import { prefersReducedMotion, onReducedMotionChange } from './utils.js';

export function createDrunkLoader(options = {}) {
  const container = document.createElement('div');
  container.className = 'drunk-loader-container';

  const spinner = document.createElement('div');
  spinner.className = 'drunk-loader-spinner';
  spinner.setAttribute('aria-hidden', 'true');
  container.appendChild(spinner);

  const label = document.createElement('span');
  label.style.fontSize = '0.85rem';
  label.style.fontWeight = '600';
  label.textContent = 'Loading curiosities...';
  label.setAttribute('role', 'status');
  label.setAttribute('aria-live', 'polite');
  container.appendChild(label);

  let baseSpeed = options.baseSpeed ?? 3.5;
  let wobbleSeverity = options.wobbleSeverity ?? 4;
  let drunkenness = options.drunkenness ?? 2.8;

  let angle = 0;
  let time = 0;
  let isDestroyed = false;
  let lastTickAngle = 0;
  let reducedMotion = prefersReducedMotion();
  let animId = null;

  function update() {
    if (isDestroyed) return;

    if (reducedMotion) {
      angle += baseSpeed;
      spinner.style.transform = `rotate(${angle}deg)`;
      time += 0.04;
    } else {
      time += 0.04;

      const currentSpeed = baseSpeed + Math.sin(time) * drunkenness;
      angle += currentSpeed;

      const rx = Math.sin(time * 1.7) * wobbleSeverity;
      const ry = Math.cos(time * 1.3) * wobbleSeverity;

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

  container.destroy = () => {
    isDestroyed = true;
    if (animId) cancelAnimationFrame(animId);
    motionListener();
  };

  container.getControls = () => {
    return [
      { label: 'Base Speed', type: 'range', min: 1.0, max: 8.0, step: 0.5, value: baseSpeed, onChange: (v) => { baseSpeed = parseFloat(v); } },
      { label: 'Drunkenness', type: 'range', min: 0.5, max: 5.0, step: 0.5, value: drunkenness, onChange: (v) => { drunkenness = parseFloat(v); } },
      { label: 'Wobble Severity', type: 'range', min: 0, max: 10, step: 1, value: wobbleSeverity, onChange: (v) => { wobbleSeverity = parseInt(v); } }
    ];
  };

  container.getCodeSnippet = () => {
    return `import { createDrunkLoader } from 'winky-wonky';

const loader = createDrunkLoader({
  baseSpeed: 4.0,
  drunkenness: 3.0,
  wobbleSeverity: 5
});
document.body.appendChild(loader);`;
  };

  return container;
}
