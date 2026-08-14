import { describe, it, expect } from 'vitest';
import { AudioSynth } from '../src/audio.js';
import { soundRecipes } from '../src/soundRecipes.js';

// This suite runs in plain Node (this package's default vitest
// environment — no window, no AudioContext, no document) to prove
// AudioSynth no-ops safely rather than throwing: no user gesture has
// happened (there's no `document` to attach the priming listeners to,
// and even if there were, nothing dispatches pointerdown/keydown here),
// so every method must be a safe no-op.
describe('AudioSynth — no-ops safely without a user gesture / in Node', () => {
  it('init() does not throw', () => {
    expect(() => AudioSynth.init()).not.toThrow();
  });

  it('playTick()/playClack() do not throw and produce no audible side effect to observe', () => {
    expect(() => AudioSynth.playTick()).not.toThrow();
    expect(() => AudioSynth.playClack()).not.toThrow();
  });

  it('playRecipe() with a custom recipe does not throw', () => {
    expect(() => AudioSynth.playRecipe({ ...soundRecipes.tick, freqStart: 1200 })).not.toThrow();
  });

  it('startSlide()/startHum() return safe no-op controllers', () => {
    const slide = AudioSynth.startSlide();
    expect(() => slide.update(300)).not.toThrow();
    expect(() => slide.stop()).not.toThrow();

    const hum = AudioSynth.startHum();
    expect(() => hum.updateVolume(50)).not.toThrow();
    expect(() => hum.stop()).not.toThrow();
  });

  it('volume/mute controls do not throw and report sane defaults', () => {
    expect(() => AudioSynth.setVolume(0.5)).not.toThrow();
    expect(() => AudioSynth.mute()).not.toThrow();
    expect(() => AudioSynth.unmute()).not.toThrow();
    expect(typeof AudioSynth.getVolume()).toBe('number');
    expect(typeof AudioSynth.isMuted()).toBe('boolean');
  });
});

describe('soundRecipes', () => {
  it('exposes tick/clack/slide/hum presets with the expected shape', () => {
    expect(soundRecipes.tick).toMatchObject({ freqStart: 800, freqEnd: 400 });
    expect(soundRecipes.clack).toMatchObject({ freqStart: 200, freqEnd: 100 });
    expect(soundRecipes.slide).toMatchObject({ minFreq: 200, maxFreq: 600 });
    expect(soundRecipes.hum).toMatchObject({ freq: 60, maxGain: 0.06 });
  });
});
