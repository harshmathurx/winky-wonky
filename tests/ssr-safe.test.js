// @vitest-environment node
//
// Regression test for audit finding #2: the library must not touch
// `window`/`document` at module-evaluation time, or importing it from a
// server-rendering context (Next.js, Remix, Astro, ...) throws immediately.
// This file runs in a plain Node environment (no jsdom, no `window` global
// at all) to prove that.
import { describe, it, expect } from 'vitest';

describe('SSR-safe import', () => {
  it('imports src/index.js in plain Node without throwing', async () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');

    await expect(import('../src/index.js')).resolves.toBeTruthy();
  });

  it('the reduced-motion/sound helpers are safe to call outside a browser', async () => {
    const mod = await import('../src/index.js');
    expect(() => mod.prefersReducedMotion()).not.toThrow();
    expect(() => mod.prefersReducedSound()).not.toThrow();
    expect(() => mod.isCoarsePointer()).not.toThrow();
    expect(mod.prefersReducedMotion()).toBe(false);
  });

  it('AudioSynth methods are safe to call outside a browser', async () => {
    const { AudioSynth } = await import('../src/index.js');
    expect(() => AudioSynth.playTick()).not.toThrow();
    expect(() => AudioSynth.getVolume()).not.toThrow();
  });
});
