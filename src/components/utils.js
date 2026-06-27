const reducedMotionMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
const reducedSoundMQ = window.matchMedia('(prefers-reduced-sound: reduce)');
const coarsePointerMQ = window.matchMedia('(pointer: coarse)');

export const prefersReducedMotion = () => reducedMotionMQ.matches;
export const prefersReducedSound = () => reducedSoundMQ.matches;
export const isCoarsePointer = () => coarsePointerMQ.matches;

export const onReducedMotionChange = (cb) => {
  reducedMotionMQ.addEventListener('change', cb);
  return () => reducedMotionMQ.removeEventListener('change', cb);
};
export const onReducedSoundChange = (cb) => {
  reducedSoundMQ.addEventListener('change', cb);
  return () => reducedSoundMQ.removeEventListener('change', cb);
};
export const onPointerTypeChange = (cb) => {
  coarsePointerMQ.addEventListener('change', cb);
  return () => coarsePointerMQ.removeEventListener('change', cb);
};

export const shouldPlaySound = () => !prefersReducedSound();
export const shouldAnimate = () => !prefersReducedMotion();

export function setAria(el, attrs) {
  for (const [key, value] of Object.entries(attrs)) {
    if (value === null || value === undefined) {
      el.removeAttribute(`aria-${key}`);
    } else {
    el.setAttribute(`aria-${key}`, value);
    }
  }
}

export function setRole(el, role) {
  if (role) el.setAttribute('role', role);
  else el.removeAttribute('role');
}

export function makeFocusable(el) {
  if (!el.hasAttribute('tabindex')) {
    el.setAttribute('tabindex', '0');
  }
}

export function onKeyActivation(el, handler) {
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handler(e);
    }
  });
}

export function trapFocus(container) {
  const selector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  const focusables = () => Array.from(container.querySelectorAll(selector)).filter(el => el.offsetParent !== null);

  function onKeyDown(e) {
    if (e.key !== 'Tab') return;
    const els = focusables();
    if (els.length === 0) return;
    const first = els[0];
    const last = els[els.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  container.addEventListener('keydown', onKeyDown);

  return {
    activate() {
      const els = focusables();
      if (els.length > 0) els[0].focus();
    },
    release() {
      container.removeEventListener('keydown', onKeyDown);
    }
  };
}

export function addPointerDrag(target, {
  onDown,
  onMove,
  onUp,
  captureElement = window,
} = {}) {
  let isDragging = false;

  function handleDown(e) {
    isDragging = true;
    if (onDown) onDown(e);
    captureElement.addEventListener('pointermove', handleMove);
    captureElement.addEventListener('pointerup', handleUp);
    captureElement.addEventListener('pointercancel', handleUp);
  }

  function handleMove(e) {
    if (!isDragging) return;
    if (onMove) onMove(e);
  }

  function handleUp(e) {
    isDragging = false;
    if (onUp) onUp(e);
    captureElement.removeEventListener('pointermove', handleMove);
    captureElement.removeEventListener('pointerup', handleUp);
    captureElement.removeEventListener('pointercancel', handleUp);
  }

  target.addEventListener('pointerdown', handleDown);

  return () => {
    target.removeEventListener('pointerdown', handleDown);
    captureElement.removeEventListener('pointermove', handleMove);
    captureElement.removeEventListener('pointerup', handleUp);
    captureElement.removeEventListener('pointercancel', handleUp);
  };
}
