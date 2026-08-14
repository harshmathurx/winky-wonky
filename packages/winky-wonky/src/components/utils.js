// The physics-agnostic pieces that used to live here — the gesture layer
// (`addPointerDrag`) and the a11y/media helpers (`prefersReducedMotion` and
// friends) — moved to `@winkywonky/core` in Phase 5 (see docs/AUDIT.md Part 2).
// Re-exported from here so every one of the 19 not-yet-migrated components'
// `import { ... } from './utils.js'` keeps working unchanged — `@winkywonky/core`
// is the single source of truth, this is just a stable local alias.
export {
  addPointerDrag,
  prefersReducedMotion,
  prefersReducedSound,
  isCoarsePointer,
  shouldPlaySound,
  shouldAnimate,
  onReducedMotionChange,
  onReducedSoundChange,
  onPointerTypeChange,
} from '@winkywonky/core';

/**
 * DOM/ARIA helpers that are specific to wiring up winky-wonky's own
 * components (not part of the headless engine) — these stay here rather
 * than moving to `@winkywonky/core`.
 */

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
