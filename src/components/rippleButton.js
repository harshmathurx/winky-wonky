import { AudioSynth } from './audioSynth.js';
import { setAria, prefersReducedMotion, onReducedMotionChange } from './utils.js';

export function createRippleButton(options = {}) {
  const container = document.createElement('div');
  container.className = 'ripple-btn-container';

  const btn = document.createElement('button');
  btn.className = 'ripple-btn winky-focus-visible';
  btn.textContent = options.label ?? 'Press Me';
  if (options.ariaLabel) btn.setAttribute('aria-label', options.ariaLabel);
  container.appendChild(btn);

  let rippleColor = options.rippleColor ?? null;
  let maxRipples = options.maxRipples ?? 1;
  let reducedMotion = prefersReducedMotion();
  const onClick = options.onClick;
  let activeRipples = [];

  function createRipple(x, y) {
    while (activeRipples.length >= maxRipples) {
      const old = activeRipples.shift();
      if (old && old.parentNode) old.remove();
    }

    const ripple = document.createElement('span');
    ripple.className = 'ripple-effect';
    ripple.setAttribute('aria-hidden', 'true');

    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const left = x - rect.left - size / 2;
    const top = y - rect.top - size / 2;

    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${left}px`;
    ripple.style.top = `${top}px`;

    if (rippleColor) {
      ripple.style.background = rippleColor;
    }

    btn.appendChild(ripple);
    activeRipples.push(ripple);

    if (reducedMotion) {
      ripple.style.opacity = '0';
      setTimeout(() => { if (ripple.parentNode) ripple.remove(); }, 100);
    } else {
      ripple.classList.add('expanding');
      setTimeout(() => {
        if (ripple.parentNode) ripple.remove();
        activeRipples = activeRipples.filter(r => r !== ripple);
      }, 600);
    }
  }

  btn.addEventListener('pointerdown', (e) => {
    AudioSynth.playClack();
    createRipple(e.clientX, e.clientY);
    if (onClick) onClick();
  });

  btn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      AudioSynth.playClack();
      const rect = btn.getBoundingClientRect();
      createRipple(rect.left + rect.width / 2, rect.top + rect.height / 2);
      if (onClick) onClick();
    }
  });

  const motionListener = onReducedMotionChange(() => {
    reducedMotion = prefersReducedMotion();
  });

  container.destroy = () => {
    activeRipples.forEach(r => { if (r.parentNode) r.remove(); });
    motionListener();
  };

  container.getControls = () => {
    return [
      { label: 'Button Label', type: 'text', value: btn.textContent, onChange: (v) => { btn.textContent = v; } },
      { label: 'Max Ripples', type: 'range', min: 1, max: 5, step: 1, value: maxRipples, onChange: (v) => { maxRipples = parseInt(v); } }
    ];
  };

  container.getCodeSnippet = () => {
    return `import { createRippleButton } from 'winky-wonky';

const btn = createRippleButton({
  label: 'Submit',
  onClick: () => console.log('Clicked!')
});
document.body.appendChild(btn);`;
  };

  return container;
}
