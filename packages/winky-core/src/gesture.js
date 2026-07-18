/**
 * The gesture layer: pointer-drag tracking used by every draggable winky
 * component (sliders, drag lists, magnetic elements). Moved here verbatim
 * from `winky-wonky`'s `src/components/utils.js` — no behavior change.
 */

/**
 * @typedef {Object} PointerDragHandlers
 * @property {(e: PointerEvent) => void} [onDown] - Called on `pointerdown` on `target`.
 * @property {(e: PointerEvent) => void} [onMove] - Called on `pointermove` on
 *   `captureElement` while dragging.
 * @property {(e: PointerEvent) => void} [onUp] - Called on `pointerup`/`pointercancel`
 *   on `captureElement`.
 * @property {EventTarget} [captureElement=window] - Element that move/up
 *   listeners are attached to (lets dragging continue outside `target`).
 */

/**
 * Wires up a drag gesture: `pointerdown` on `target` starts tracking,
 * `pointermove`/`pointerup`/`pointercancel` on `captureElement` (default
 * `window`) continue/end it.
 * @param {EventTarget} target
 * @param {PointerDragHandlers} [handlers]
 * @returns {() => void} Teardown function that removes all listeners.
 */
export function addPointerDrag(target, {
  onDown,
  onMove,
  onUp,
  captureElement = typeof window !== 'undefined' ? window : undefined,
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
    if (captureElement) {
      captureElement.removeEventListener('pointermove', handleMove);
      captureElement.removeEventListener('pointerup', handleUp);
      captureElement.removeEventListener('pointercancel', handleUp);
    }
  };
}
