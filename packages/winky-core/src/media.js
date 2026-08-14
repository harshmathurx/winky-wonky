/**
 * a11y/media helpers: `prefers-reduced-motion`, `prefers-reduced-sound`, and
 * pointer-type detection. Moved here verbatim from `winky-wonky`'s
 * `src/components/utils.js` — same lazy-getter pattern (init on first call,
 * not at module-evaluation time) so importing this module never touches
 * `window` and stays SSR-safe.
 */

function hasMatchMedia() {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function';
}

let reducedMotionMQ = null;
let reducedSoundMQ = null;
let coarsePointerMQ = null;

function getReducedMotionMQ() {
  if (!hasMatchMedia()) return null;
  if (!reducedMotionMQ) reducedMotionMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  return reducedMotionMQ;
}
function getReducedSoundMQ() {
  if (!hasMatchMedia()) return null;
  if (!reducedSoundMQ) reducedSoundMQ = window.matchMedia('(prefers-reduced-sound: reduce)');
  return reducedSoundMQ;
}
function getCoarsePointerMQ() {
  if (!hasMatchMedia()) return null;
  if (!coarsePointerMQ) coarsePointerMQ = window.matchMedia('(pointer: coarse)');
  return coarsePointerMQ;
}

/** @returns {boolean} Whether the user has requested reduced motion. Always `false` outside a browser. */
export const prefersReducedMotion = () => getReducedMotionMQ()?.matches ?? false;
/** @returns {boolean} Whether the user has requested reduced sound. Always `false` outside a browser. */
export const prefersReducedSound = () => getReducedSoundMQ()?.matches ?? false;
/** @returns {boolean} Whether the primary pointer is coarse (touch). Always `false` outside a browser. */
export const isCoarsePointer = () => getCoarsePointerMQ()?.matches ?? false;

/**
 * @param {(e: MediaQueryListEvent) => void} cb
 * @returns {() => void} Unsubscribe function; safe to call even if the
 *   subscription was a no-op (no `matchMedia` available).
 */
export const onReducedMotionChange = (cb) => {
  const mq = getReducedMotionMQ();
  if (!mq) return () => {};
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
};
/**
 * @param {(e: MediaQueryListEvent) => void} cb
 * @returns {() => void} Unsubscribe function.
 */
export const onReducedSoundChange = (cb) => {
  const mq = getReducedSoundMQ();
  if (!mq) return () => {};
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
};
/**
 * @param {(e: MediaQueryListEvent) => void} cb
 * @returns {() => void} Unsubscribe function.
 */
export const onPointerTypeChange = (cb) => {
  const mq = getCoarsePointerMQ();
  if (!mq) return () => {};
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
};

/** @returns {boolean} `true` unless the user prefers reduced sound. */
export const shouldPlaySound = () => !prefersReducedSound();
/** @returns {boolean} `true` unless the user prefers reduced motion. */
export const shouldAnimate = () => !prefersReducedMotion();
