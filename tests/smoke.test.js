// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import * as WinkyWonky from '../src/index.js';

const factoryNames = Object.keys(WinkyWonky).filter((name) => name.startsWith('create'));

// audit #6 / Phase 3: components that must implement getValue/setValue.
const valueBearing = new Set([
  'createTiltSlider',
  'createGroovySlider',
  'createPendulumToggle',
  'createWobblyCheckbox',
  'createWobblyRadioGroup',
  'createRatingStars',
  'createSpringyTabs',
  'createWobblySwitch',
  'createHingeDropdown',
  'createTypewriterInput',
  'createSlimeProgress',
  'createRotaryColorPicker',
]);

describe('winky-wonky smoke tests', () => {
  it('exports at least the 24 documented create* factories', () => {
    // src/index.js currently re-exports 24 createX factories plus AudioSynth
    // and the media-query helpers. This guards against a factory silently
    // disappearing from the public API.
    expect(factoryNames.length).toBeGreaterThanOrEqual(24);
  });

  for (const name of factoryNames) {
    it(`${name}() returns an { el, destroy } instance and can be destroyed without throwing`, () => {
      const factory = WinkyWonky[name];
      let instance;
      expect(() => {
        instance = factory();
      }).not.toThrow();

      // Phase 3: factories return an instance object, not a bare DOM node.
      expect(instance).toBeTruthy();
      expect(instance.el).toBeInstanceOf(globalThis.Node);
      expect(typeof instance.destroy).toBe('function');

      // Playground concerns must NOT leak into the library (audit #4).
      expect(instance.getControls).toBeUndefined();
      expect(instance.getCodeSnippet).toBeUndefined();
      expect(instance.el.getControls).toBeUndefined();
      expect(instance.el.getCodeSnippet).toBeUndefined();

      if (valueBearing.has(name)) {
        expect(typeof instance.getValue).toBe('function');
        expect(typeof instance.setValue).toBe('function');
      }

      document.body.appendChild(instance.el);
      expect(() => instance.destroy()).not.toThrow();
      instance.el.remove();
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
