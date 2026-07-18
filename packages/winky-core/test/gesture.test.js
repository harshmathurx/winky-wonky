// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { addPointerDrag } from '../src/gesture.js';

describe('addPointerDrag', () => {
  it('fires onDown/onMove/onUp for a full drag sequence and stops after pointerup', () => {
    const target = document.createElement('div');
    document.body.appendChild(target);

    const onDown = vi.fn();
    const onMove = vi.fn();
    const onUp = vi.fn();
    const teardown = addPointerDrag(target, { onDown, onMove, onUp });

    target.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1 }));
    expect(onDown).toHaveBeenCalledTimes(1);

    window.dispatchEvent(new PointerEvent('pointermove', { pointerId: 1 }));
    window.dispatchEvent(new PointerEvent('pointermove', { pointerId: 1 }));
    expect(onMove).toHaveBeenCalledTimes(2);

    window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1 }));
    expect(onUp).toHaveBeenCalledTimes(1);

    // Move events after pointerup must not fire onMove again (dragging ended).
    window.dispatchEvent(new PointerEvent('pointermove', { pointerId: 1 }));
    expect(onMove).toHaveBeenCalledTimes(2);

    teardown();
    target.remove();
  });

  it('teardown removes all listeners (no further callbacks fire)', () => {
    const target = document.createElement('div');
    document.body.appendChild(target);

    const onDown = vi.fn();
    const teardown = addPointerDrag(target, { onDown });
    teardown();

    target.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1 }));
    expect(onDown).not.toHaveBeenCalled();

    target.remove();
  });

  it('supports a custom captureElement instead of window', () => {
    const target = document.createElement('div');
    const capture = document.createElement('div');
    document.body.appendChild(target);
    document.body.appendChild(capture);

    const onMove = vi.fn();
    const teardown = addPointerDrag(target, { onMove, captureElement: capture });

    target.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1 }));
    capture.dispatchEvent(new PointerEvent('pointermove', { pointerId: 1 }));
    expect(onMove).toHaveBeenCalledTimes(1);

    // window is not the capture element here, so a window-level move must not fire onMove.
    window.dispatchEvent(new PointerEvent('pointermove', { pointerId: 1 }));
    expect(onMove).toHaveBeenCalledTimes(1);

    teardown();
    target.remove();
    capture.remove();
  });
});
