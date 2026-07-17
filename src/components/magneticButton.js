import { AudioSynth } from './audioSynth.js';
import { prefersReducedMotion, onReducedMotionChange } from './utils.js';

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
