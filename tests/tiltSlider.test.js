// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createTiltSlider } from '../src/components/tiltSlider.js';

// Intercepts requestAnimationFrame so tests can deterministically flush
// exactly the frames the component schedules, with no real-timer flakiness
// and no extra rAF calls polluting the count (as a real `await nextFrame()`
// helper would, since waiting for a frame is itself an rAF call).
let rafQueue;
let rafSpy;

function flushOneFrame() {
  const cb = rafQueue.shift();
  if (cb) cb();
}

beforeEach(() => {
  rafQueue = [];
  rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
    rafQueue.push(cb);
    return rafQueue.length;
  });
});

afterEach(() => {
  rafSpy.mockRestore();
});

describe('tiltSlider — rAF idle + onChange discipline (audit #3)', () => {
  it('paints once on creation, then goes idle: no pending frames, onChange never called', () => {
    const onChange = vi.fn();
    const slider = createTiltSlider({ onChange });
    document.body.appendChild(slider);

    // Exactly one frame is scheduled for the initial paint.
    expect(rafQueue.length).toBe(1);
    flushOneFrame();

    // Settled: not dragging, angle at rest -> the loop must not reschedule.
    expect(rafQueue.length).toBe(0);
    expect(onChange).not.toHaveBeenCalled();

    slider.destroy();
    slider.remove();
  });

  it('calls onChange exactly once for a single keyboard ArrowRight step', () => {
    const onChange = vi.fn();
    const slider = createTiltSlider({ initialValue: 50, onChange });
    document.body.appendChild(slider);
    const track = slider.querySelector('[role="slider"]');

    flushOneFrame(); // initial paint frame
    expect(rafQueue.length).toBe(0);

    track.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));

    // The key handler must schedule exactly one frame to apply the step.
    expect(rafQueue.length).toBe(1);
    flushOneFrame();

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(51);

    // And it goes idle again afterward.
    expect(rafQueue.length).toBe(0);

    slider.destroy();
    slider.remove();
  });

  it('does not double-fire onChange while dragging (only fires when the rounded value changes)', () => {
    const onChange = vi.fn();
    const slider = createTiltSlider({ initialValue: 50, onChange });
    document.body.appendChild(slider);
    const knob = slider.querySelector('.seesaw-slider-knob');
    const track = slider.querySelector('[role="slider"]');
    track.getBoundingClientRect = () => ({ left: 0, top: 0, width: 100, height: 20, right: 100, bottom: 20 });

    flushOneFrame(); // initial paint

    knob.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 50, pointerId: 1 }));
    flushOneFrame(); // onDown paint (angle reset), no value change yet

    // Simulate several pointermove events at the *same* target position in a
    // single frame window - only one frame should be scheduled, and only
    // one onChange call should result even though multiple move events fire.
    window.dispatchEvent(new PointerEvent('pointermove', { clientX: 51, pointerId: 1 }));
    window.dispatchEvent(new PointerEvent('pointermove', { clientX: 51, pointerId: 1 }));
    window.dispatchEvent(new PointerEvent('pointermove', { clientX: 51, pointerId: 1 }));
    expect(rafQueue.length).toBe(1);
    flushOneFrame();

    expect(onChange.mock.calls.length).toBeLessThanOrEqual(1);

    window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1 }));

    slider.destroy();
    slider.remove();
  });
});
