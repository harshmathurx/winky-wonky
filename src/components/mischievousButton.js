import { AudioSynth } from './audioSynth.js';
import { setAria, prefersReducedMotion, onReducedMotionChange } from './utils.js';

export function createMischievousButtons(options = {}) {
  const container = document.createElement('div');
  container.className = 'button-grid';

  let dodgePower = options.dodgePower ?? 0.8;
  let maxDodgeRange = options.maxDodgeRange ?? 75;
  let isDodgeEnabled = options.isDodgeEnabled ?? true;
  const onClick = options.onClick;
  let reducedMotion = prefersReducedMotion();

  // --- BUTTON 1: DODGE BUTTON ---
  const dodgeBtn = document.createElement('button');
  dodgeBtn.className = 'mischievous-btn btn-dodge winky-focus-visible';
  dodgeBtn.textContent = 'Click Me if You Can';
  dodgeBtn.setAttribute('aria-label', 'Dodge button — try to catch it');
  container.appendChild(dodgeBtn);

  let dodgeX = 0;
  let dodgeY = 0;

  dodgeBtn.addEventListener('pointermove', (e) => {
    if (!isDodgeEnabled || reducedMotion) return;

    const rect = dodgeBtn.getBoundingClientRect();
    const btnCenterX = rect.left + rect.width / 2;
    const btnCenterY = rect.top + rect.height / 2;

    const dx = e.clientX - btnCenterX;
    const dy = e.clientY - btnCenterY;
    const dist = Math.hypot(dx, dy);

    if (dist < maxDodgeRange) {
      const angle = Math.atan2(dy, dx);
      const escapeDist = (maxDodgeRange - dist) * dodgePower * 1.5;

      dodgeX -= Math.cos(angle) * escapeDist;
      dodgeY -= Math.sin(angle) * escapeDist;

      const boundary = 70;
      dodgeX = Math.max(-boundary, Math.min(boundary, dodgeX));
      dodgeY = Math.max(-boundary + 20, Math.min(boundary - 20, dodgeY));

      dodgeBtn.style.transform = `translate(${dodgeX}px, ${dodgeY}px)`;
      AudioSynth.playTick();
    }
  });

  dodgeBtn.addEventListener('pointerleave', () => {
    setTimeout(() => {
      dodgeX = 0;
      dodgeY = 0;
      dodgeBtn.style.transform = 'translate(0, 0)';
    }, reducedMotion ? 0 : 1500);
  });

  dodgeBtn.addEventListener('click', () => {
    AudioSynth.playClack();
    if (onClick) {
      onClick('dodge');
    }
    dodgeX = 0;
    dodgeY = 0;
    dodgeBtn.style.transform = 'translate(0,0)';
  });

  // --- BUTTON 2: SQUASH BUTTON ---
  const squashBtn = document.createElement('button');
  squashBtn.className = 'mischievous-btn btn-squash winky-focus-visible';
  squashBtn.textContent = 'Squash & Stretch';
  squashBtn.setAttribute('aria-label', 'Squash and stretch button');
  container.appendChild(squashBtn);

  squashBtn.addEventListener('click', () => {
    AudioSynth.playClack();
    if (onClick) onClick('squash');
  });

  // --- BUTTON 3: LAZY SHADOW BUTTON ---
  const lazyWrapper = document.createElement('div');
  lazyWrapper.className = 'btn-lazy-shadow-wrapper';

  const shadow = document.createElement('div');
  shadow.className = 'btn-lazy-shadow-shadow';
  shadow.setAttribute('aria-hidden', 'true');
  lazyWrapper.appendChild(shadow);

  const lazyBtn = document.createElement('button');
  lazyBtn.className = 'mischievous-btn btn-lazy-shadow winky-focus-visible';
  lazyBtn.textContent = 'Tactile Keypress';
  lazyBtn.setAttribute('aria-label', 'Tactile button with lazy shadow');
  lazyWrapper.appendChild(lazyBtn);
  container.appendChild(lazyWrapper);

  lazyBtn.addEventListener('pointerdown', () => {
    AudioSynth.playClack();
    lazyBtn.style.transform = 'translate(4px, 4px)';
    shadow.classList.remove('catching-up');
    shadow.style.top = '0px';
    shadow.style.left = '0px';
    if (onClick) onClick('lazy-shadow');
  });

  lazyBtn.addEventListener('pointerup', () => {
    lazyBtn.style.transform = 'translate(0px, 0px)';
    shadow.classList.add('catching-up');
    shadow.style.top = '4px';
    shadow.style.left = '4px';
  });

  lazyBtn.addEventListener('pointerleave', () => {
    lazyBtn.style.transform = 'translate(0px, 0px)';
    shadow.classList.add('catching-up');
    shadow.style.top = '4px';
    shadow.style.left = '4px';
  });

  const motionListener = onReducedMotionChange(() => {
    reducedMotion = prefersReducedMotion();
    if (reducedMotion) {
      dodgeX = 0;
      dodgeY = 0;
      dodgeBtn.style.transform = 'translate(0,0)';
    }
  });

  container.destroy = () => {
    motionListener();
  };

  container.getControls = () => {
    return [
      { label: 'Enable Dodge', type: 'checkbox', value: isDodgeEnabled, onChange: (v) => {
        isDodgeEnabled = v;
        if (!v) { dodgeX = 0; dodgeY = 0; dodgeBtn.style.transform = 'translate(0,0)'; }
      }},
      { label: 'Dodge Evasion', type: 'range', min: 0.2, max: 1.0, step: 0.1, value: dodgePower, onChange: (v) => { dodgePower = parseFloat(v); } },
      { label: 'Dodge Range (px)', type: 'range', min: 40, max: 120, step: 5, value: maxDodgeRange, onChange: (v) => { maxDodgeRange = parseInt(v); } }
    ];
  };

  container.getCodeSnippet = () => {
    return `import { createMischievousButtons } from 'winky-wonky';

const buttons = createMischievousButtons({
  isDodgeEnabled: true,
  dodgePower: 0.8,
  maxDodgeRange: 75,
  onClick: (type) => console.log('Clicked button of type: ', type)
});
document.body.appendChild(buttons);`;
  };

  return container;
}
