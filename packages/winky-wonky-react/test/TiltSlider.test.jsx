import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { TiltSlider } from '../src/index.jsx';

afterEach(cleanup);

describe('<TiltSlider> — controlled usage (Phase 3)', () => {
  it('renders and mounts the underlying winky-wonky element', () => {
    const { container } = render(<TiltSlider initialValue={30} />);
    const track = container.querySelector('[role="slider"]');
    expect(track).toBeTruthy();
    expect(track.getAttribute('aria-valuenow')).toBe('30');
  });

  it('a controlled `value` prop re-render moves the knob without firing onChange', () => {
    const onChange = vi.fn();
    const { container, rerender } = render(<TiltSlider value={20} onChange={onChange} />);

    let track = container.querySelector('[role="slider"]');
    expect(track.getAttribute('aria-valuenow')).toBe('20');

    rerender(<TiltSlider value={80} onChange={onChange} />);

    track = container.querySelector('[role="slider"]');
    expect(track.getAttribute('aria-valuenow')).toBe('80');
    // setValue (used to sync the controlled prop) never invokes onChange.
    expect(onChange).not.toHaveBeenCalled();
  });

  it('unmounting calls destroy without throwing', () => {
    const { unmount } = render(<TiltSlider initialValue={50} />);
    expect(() => unmount()).not.toThrow();
  });
});
