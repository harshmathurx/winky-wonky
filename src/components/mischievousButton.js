import { AudioSynth } from './audioSynth.js';
import { setAria, prefersReducedMotion, onReducedMotionChange } from './utils.js';

export function createMischievousButtons(options = {}) {
  const container = document.createElement('div');
  container.className = 'winky-button-grid';

  const config = {
    dodgePower: options.dodgePower ?? 0.8,
    maxDodgeRange: options.maxDodgeRange ?? 75,
    dodgeEnabled: options.isDodgeEnabled ?? true,
  };
  const onClick = options.onClick;
  let reducedMotion = prefersReducedMotion();

  // --- BUTTON 1: DODGE BUTTON ---
  const dodgeBtn = document.createElement('button');
  dodgeBtn.className = 'winky-mischievous-btn winky-btn-dodge winky-focus-visible';
  dodgeBtn.textContent = 'Click Me if You Can';
  dodgeBtn.setAttribute('aria-label', options.dodgeAriaLabel ?? 'Dodge button — try to catch it');
  container.appendChild(dodgeBtn);

  let dodgeX = 0;
  let dodgeY = 0;

  function resetDodge() {
    dodgeX = 0;
    dodgeY = 0;
    dodgeBtn.style.transform = 'translate(0, 0)';
  }

  dodgeBtn.addEventListener('pointermove', (e) => {
    if (!config.dodgeEnabled || reducedMotion) return;

    const rect = dodgeBtn.getBoundingClientRect();
    const btnCenterX = rect.left + rect.width / 2;
    const btnCenterY = rect.top + rect.height / 2;

    const dx = e.clientX - btnCenterX;
    const dy = e.clientY - btnCenterY;
    const dist = Math.hypot(dx, dy);

    if (dist < config.maxDodgeRange) {
      const angle = Math.atan2(dy, dx);
      const escapeDist = (config.maxDodgeRange - dist) * config.dodgePower * 1.5;

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
    setTimeout(resetDodge, reducedMotion ? 0 : 1500);
  });

  dodgeBtn.addEventListener('click', () => {
    AudioSynth.playClack();
    if (onClick) {
      onClick('dodge');
    }
    resetDodge();
  });

  // --- BUTTON 2: SQUASH BUTTON ---
  const squashBtn = document.createElement('button');
  squashBtn.className = 'winky-mischievous-btn winky-btn-squash winky-focus-visible';
  squashBtn.textContent = 'Squash & Stretch';
  squashBtn.setAttribute('aria-label', options.squashAriaLabel ?? 'Squash and stretch button');
  container.appendChild(squashBtn);

  squashBtn.addEventListener('click', () => {
    AudioSynth.playClack();
    if (onClick) onClick('squash');
  });

  // --- BUTTON 3: LAZY SHADOW BUTTON ---
  const lazyWrapper = document.createElement('div');
  lazyWrapper.className = 'winky-btn-lazy-shadow-wrapper';

  const shadow = document.createElement('div');
  shadow.className = 'winky-btn-lazy-shadow-shadow';
  shadow.setAttribute('aria-hidden', 'true');
  lazyWrapper.appendChild(shadow);

  const lazyBtn = document.createElement('button');
  lazyBtn.className = 'winky-mischievous-btn winky-btn-lazy-shadow winky-focus-visible';
  lazyBtn.textContent = 'Tactile Keypress';
  lazyBtn.setAttribute('aria-label', options.lazyAriaLabel ?? 'Tactile button with lazy shadow');
  lazyWrapper.appendChild(lazyBtn);
  container.appendChild(lazyWrapper);

  lazyBtn.addEventListener('pointerdown', () => {
    AudioSynth.playClack();
    lazyBtn.style.transform = 'translate(4px, 4px)';
    shadow.classList.remove('winky-catching-up');
    shadow.style.top = '0px';
    shadow.style.left = '0px';
    if (onClick) onClick('lazy-shadow');
  });

  lazyBtn.addEventListener('pointerup', () => {
    lazyBtn.style.transform = 'translate(0px, 0px)';
    shadow.classList.add('winky-catching-up');
    shadow.style.top = '4px';
    shadow.style.left = '4px';
  });

  lazyBtn.addEventListener('pointerleave', () => {
    lazyBtn.style.transform = 'translate(0px, 0px)';
    shadow.classList.add('winky-catching-up');
    shadow.style.top = '4px';
    shadow.style.left = '4px';
  });

  const motionListener = onReducedMotionChange(() => {
    reducedMotion = prefersReducedMotion();
    if (reducedMotion) {
      resetDodge();
    }
  });

  function destroy() {
    motionListener();
  }

  function setOptions(partial = {}) {
    if (partial.dodgeEnabled != null) {
      config.dodgeEnabled = partial.dodgeEnabled;
      if (!config.dodgeEnabled) resetDodge();
    }
    if (partial.dodgePower != null) config.dodgePower = partial.dodgePower;
    if (partial.maxDodgeRange != null) config.maxDodgeRange = partial.maxDodgeRange;
  }

  return { el: container, destroy, config, setOptions };
}
