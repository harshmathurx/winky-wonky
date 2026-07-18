// Runs in plain Node (this package's default environment — see
// vitest.config.js). Proves `@winky/core` — springs, gestures, audio, and
// a11y/media helpers alike — imports cleanly with no window/document at
// module-evaluation time, matching the "SSR-safe from day one" requirement.
import { describe, it, expect } from 'vitest';

describe('@winky/core — imports cleanly in Node', () => {
  it('imports the aggregate entry without throwing', async () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');

    await expect(import('../src/index.js')).resolves.toBeTruthy();
  });

  it('exposes every documented export', async () => {
    const mod = await import('../src/index.js');
    expect(typeof mod.createSpring).toBe('function');
    expect(typeof mod.addPointerDrag).toBe('function');
    expect(typeof mod.AudioSynth).toBe('object');
    expect(typeof mod.soundRecipes).toBe('object');
    expect(typeof mod.prefersReducedMotion).toBe('function');
    expect(typeof mod.prefersReducedSound).toBe('function');
    expect(typeof mod.isCoarsePointer).toBe('function');
    expect(typeof mod.shouldPlaySound).toBe('function');
    expect(typeof mod.shouldAnimate).toBe('function');
  });

  it('the media helpers are safe to call outside a browser and default to "not reduced"', async () => {
    const mod = await import('../src/index.js');
    expect(() => mod.prefersReducedMotion()).not.toThrow();
    expect(() => mod.prefersReducedSound()).not.toThrow();
    expect(() => mod.isCoarsePointer()).not.toThrow();
    expect(mod.prefersReducedMotion()).toBe(false);
    expect(mod.shouldAnimate()).toBe(true);
  });

  it('createSpring can be constructed (but not animated) without a scheduler', async () => {
    const { createSpring } = await import('../src/index.js');
    const spring = createSpring({ value: 5 });
    expect(spring.value).toBe(5);
    expect(spring.isSettled()).toBe(true);
    // No requestAnimationFrame exists in Node — targeting away from the
    // current value must not throw even though the loop can't actually run.
    expect(() => spring.target(10)).not.toThrow();
    expect(() => spring.destroy()).not.toThrow();
  });
});
