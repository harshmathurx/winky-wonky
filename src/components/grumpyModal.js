import { AudioSynth } from './audioSynth.js';
import { setAria, trapFocus, onKeyActivation, prefersReducedMotion, onReducedMotionChange } from './utils.js';

export function createGrumpyModalTrigger(options = {}) {
  const triggerBtn = document.createElement('button');
  triggerBtn.className = 'winky-mischievous-btn winky-focus-visible';
  triggerBtn.textContent = 'Trigger Modal';
  triggerBtn.style.backgroundColor = 'var(--winky-accent-alt)';
  triggerBtn.setAttribute('aria-haspopup', 'dialog');

  const headerText = options.headerText ?? 'Peculiar Notice!';
  const bodyText = options.bodyText ?? 'This is a grumpy modal. It does not like to be closed by clicking outside. If you try, it will throw a temper tantrum and shake! You must click the button below to dismiss it.';
  const buttonText = options.buttonText ?? 'Dismiss Me';
  const onClose = options.onClose;
  let reducedMotion = prefersReducedMotion();

  const overlay = document.createElement('div');
  overlay.className = 'winky-modal-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.backgroundColor = 'rgba(43, 37, 32, 0.7)';
  overlay.style.display = 'flex';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = 'center';
  overlay.style.zIndex = '1000';
  overlay.style.opacity = '0';
  overlay.style.pointerEvents = 'none';
  overlay.style.transition = 'opacity 0.3s';
  overlay.setAttribute('role', 'presentation');

  const box = document.createElement('div');
  box.className = 'winky-grumpy-modal-box';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-labelledby', 'grumpy-modal-title');

  const header = document.createElement('div');
  header.className = 'winky-modal-header';
  header.id = 'grumpy-modal-title';
  header.textContent = headerText;
  box.appendChild(header);

  const modalBody = document.createElement('div');
  modalBody.className = 'winky-modal-body';
  modalBody.textContent = bodyText;
  box.appendChild(modalBody);

  const footer = document.createElement('div');
  footer.className = 'winky-modal-footer';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'winky-modal-btn winky-modal-btn-close winky-focus-visible';
  closeBtn.textContent = buttonText;
  footer.appendChild(closeBtn);

  box.appendChild(footer);
  overlay.appendChild(box);

  let isModalOpen = false;
  let focusTrap = null;
  let previouslyFocused = null;

  function openModal() {
    header.textContent = headerText;
    modalBody.textContent = bodyText;
    closeBtn.textContent = buttonText;

    AudioSynth.playTick();
    document.body.appendChild(overlay);
    overlay.classList.add('winky-open');
    isModalOpen = true;
    previouslyFocused = document.activeElement;

    requestAnimationFrame(() => {
      focusTrap = trapFocus(box);
      focusTrap.activate();
    });
  }

  function closeModal() {
    AudioSynth.playClack();
    overlay.classList.remove('winky-open');
    isModalOpen = false;

    setTimeout(() => {
      if (overlay.parentNode) overlay.remove();
      if (focusTrap) { focusTrap.release(); focusTrap = null; }
      if (previouslyFocused && previouslyFocused.focus) previouslyFocused.focus();
    }, 300);

    if (onClose) onClose();
  }

  function triggerGrumpyShake() {
    AudioSynth.playClack();
    if (reducedMotion) return;
    box.classList.remove('winky-shaking');
    void box.offsetWidth;
    box.classList.add('winky-shaking');
  }

  triggerBtn.addEventListener('click', openModal);

  closeBtn.addEventListener('click', closeModal);

  overlay.addEventListener('pointerdown', (e) => {
    if (e.target === overlay) {
      triggerGrumpyShake();
    }
  });

  function handleDocumentKeydown(e) {
    if (!isModalOpen) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      triggerGrumpyShake();
    }
  }
  document.addEventListener('keydown', handleDocumentKeydown);

  box.addEventListener('animationend', () => {
    box.classList.remove('winky-shaking');
  });

  const motionListener = onReducedMotionChange(() => {
    reducedMotion = prefersReducedMotion();
  });

  function destroy() {
    if (isModalOpen) closeModal();
    document.removeEventListener('keydown', handleDocumentKeydown);
    motionListener();
  }

  return { el: triggerBtn, destroy };
}
