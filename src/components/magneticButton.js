import { AudioSynth } from './audioSynth.js';
import { prefersReducedMotion, onReducedMotionChange } from './utils.js';

export function createMagneticButton(options = {}) {
  const wrapper = document.createElement('div');
  wrapper.className = 'magnetic-btn-wrapper';

  const btn = document.createElement('button');
  btn.className = 'magnetic-btn winky-focus-visible';
  btn.textContent = 'Hold Magnet';
  wrapper.appendChild(btn);

  let magneticRange = options.magneticRange ?? 90;
  let pullStrength = options.pullStrength ?? 0.45;
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

    if (dist < magneticRange) {
      if (!activeHum) {
        activeHum = AudioSynth.startHum();
      }
      activeHum.updateVolume(dist);

      const force = (1 - dist / magneticRange) * pullStrength;
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

  wrapper.destroy = () => {
    window.removeEventListener('pointermove', onMouseMove);
    if (activeHum) activeHum.stop();
    motionListener();
  };

  wrapper.getControls = () => {
    return [
      { label: 'Magnetic Range', type: 'range', min: 50, max: 130, step: 5, value: magneticRange, onChange: (v) => { magneticRange = parseInt(v); } },
      { label: 'Pull Strength', type: 'range', min: 0.1, max: 0.8, step: 0.05, value: pullStrength, onChange: (v) => { pullStrength = parseFloat(v); } }
    ];
  };

  wrapper.getCodeSnippet = () => {
    return `import { createMagneticButton } from 'winky-wonky';

const btn = createMagneticButton({
  magneticRange: 100,
  pullStrength: 0.5
});
document.body.appendChild(btn);`;
  };

  return wrapper;
}
