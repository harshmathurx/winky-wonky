import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { WobblyCheckbox } from '../src/index.jsx';

afterEach(cleanup);

describe('<WobblyCheckbox> — controlled usage (Phase 3)', () => {
  it('a controlled `value={true}` prop reflects checked state from first render, even though the underlying factory has no initial-checked creation option', () => {
    const onChange = vi.fn();
    const { container } = render(<WobblyCheckbox value={true} onChange={onChange} labelText="Accept" />);

    const box = container.querySelector('[role="checkbox"]');
    expect(box.getAttribute('aria-checked')).toBe('true');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('toggling the controlled value across re-renders updates aria-checked without onChange', () => {
    const onChange = vi.fn();
    const { container, rerender } = render(<WobblyCheckbox value={false} onChange={onChange} />);
    let box = container.querySelector('[role="checkbox"]');
    expect(box.getAttribute('aria-checked')).toBe('false');

    rerender(<WobblyCheckbox value={true} onChange={onChange} />);
    box = container.querySelector('[role="checkbox"]');
    expect(box.getAttribute('aria-checked')).toBe('true');
    expect(onChange).not.toHaveBeenCalled();
  });
});
