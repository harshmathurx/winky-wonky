// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import * as WinkyWonky from '../src/index.js';

const factoryNames = Object.keys(WinkyWonky).filter((name) => name.startsWith('create'));

describe('winky-wonky smoke tests', () => {
  it('exports at least the 24 documented create* factories', () => {
    // src/index.js currently re-exports 24 createX factories plus AudioSynth
    // and the media-query helpers. This guards against a factory silently
    // disappearing from the public API.
    expect(factoryNames.length).toBeGreaterThanOrEqual(24);
  });

  for (const name of factoryNames) {
    it(`${name}() returns a DOM node and can be destroyed without throwing`, () => {
      const factory = WinkyWonky[name];
      let node;
      expect(() => {
        node = factory();
      }).not.toThrow();

      expect(node).toBeInstanceOf(globalThis.Node);
      document.body.appendChild(node);

      if (typeof node.destroy === 'function') {
        expect(() => node.destroy()).not.toThrow();
      }

      node.remove();
    });
  }

  it('AudioSynth is exported and its methods no-op safely without a user gesture', () => {
    const { AudioSynth } = WinkyWonky;
    expect(AudioSynth).toBeTruthy();
    expect(() => AudioSynth.playTick()).not.toThrow();
    expect(() => AudioSynth.playClack()).not.toThrow();
    expect(() => AudioSynth.setVolume(0.5)).not.toThrow();
    expect(() => AudioSynth.mute()).not.toThrow();
    expect(() => AudioSynth.unmute()).not.toThrow();
  });

  it('exports the reduced-motion / reduced-sound / pointer helper functions', () => {
    expect(typeof WinkyWonky.prefersReducedMotion).toBe('function');
    expect(typeof WinkyWonky.prefersReducedSound).toBe('function');
    expect(typeof WinkyWonky.isCoarsePointer).toBe('function');
    expect(typeof WinkyWonky.shouldPlaySound).toBe('function');
    expect(typeof WinkyWonky.shouldAnimate).toBe('function');
    expect(() => WinkyWonky.prefersReducedMotion()).not.toThrow();
  });
});
