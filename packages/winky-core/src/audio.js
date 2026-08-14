import { shouldPlaySound } from './media.js';
import { soundRecipes } from './soundRecipes.js';

/**
 * Synthesized UI audio via the Web Audio API. Moved here verbatim (byte-for-byte
 * identical envelopes/frequencies) from `winky-wonky`'s
 * `src/components/audioSynth.js`, refactored to source `playTick`/`playClack`
 * from `soundRecipes` via the new `playRecipe()` method.
 *
 * SSR/Node-safe: every method is wrapped so it no-ops instead of throwing
 * when there's no `window`/`AudioContext`, and no audio plays until a real
 * user gesture (`pointerdown`/`keydown`) has primed the `AudioContext` —
 * browsers block autoplay before a gesture, and this makes that the
 * explicit, tested contract rather than an incidental side effect.
 */

let audioCtx = null;
let masterGainNode = null;
let masterVolume = 0.15;
let isMuted = false;
let userInteracted = false;
let primeListenersAttached = false;

function getAudioContext() {
  if (!audioCtx) {
    const Ctx = window.AudioContext || /** @type {*} */ (window).webkitAudioContext;
    audioCtx = new Ctx();
    masterGainNode = audioCtx.createGain();
    masterGainNode.gain.value = isMuted ? 0 : masterVolume;
    masterGainNode.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function canActivate() {
  ensurePrimeListeners();
  return userInteracted && !isMuted && shouldPlaySound();
}

function primeAudio() {
  if (!userInteracted) {
    userInteracted = true;
    try { getAudioContext(); } catch (e) {}
  }
}

function ensurePrimeListeners() {
  if (primeListenersAttached) return;
  if (typeof document === 'undefined') return;
  primeListenersAttached = true;
  document.addEventListener('pointerdown', primeAudio, { once: true });
  document.addEventListener('keydown', primeAudio, { once: true });
}

/**
 * Plays a single oscillator envelope described by a
 * {@link import('./soundRecipes.js').OneShotSoundRecipe}. Assumes `canActivate()`
 * has already gated the call — used internally by `playTick`/`playClack`/`playRecipe`.
 * @param {import('./soundRecipes.js').OneShotSoundRecipe} recipe
 */
function playOneShot(recipe) {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(masterGainNode);

  osc.type = recipe.waveform ?? 'sine';
  osc.frequency.setValueAtTime(recipe.freqStart, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(recipe.freqEnd, ctx.currentTime + recipe.freqRampTime);

  gain.gain.setValueAtTime(recipe.gainStart, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(recipe.gainEnd, ctx.currentTime + recipe.gainRampTime);

  osc.start();
  osc.stop(ctx.currentTime + recipe.stopTime);
}

export const AudioSynth = {
  /**
   * Explicitly attaches the gesture-priming listeners. Safe to call multiple
   * times and safe to call outside a browser (no-op). Also called lazily by
   * every other AudioSynth method on first use.
   */
  init() {
    ensurePrimeListeners();
  },

  setVolume(level) {
    ensurePrimeListeners();
    try {
      const ctx = getAudioContext();
      masterVolume = Math.max(0, Math.min(1.0, level));
      if (!isMuted) {
        masterGainNode.gain.setTargetAtTime(masterVolume, ctx.currentTime, 0.05);
      }
    } catch (e) {}
  },

  getVolume() {
    return masterVolume;
  },

  mute() {
    ensurePrimeListeners();
    try {
      const ctx = getAudioContext();
      isMuted = true;
      masterGainNode.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
    } catch (e) {}
  },

  unmute() {
    ensurePrimeListeners();
    try {
      const ctx = getAudioContext();
      isMuted = false;
      masterGainNode.gain.setTargetAtTime(masterVolume, ctx.currentTime, 0.05);
    } catch (e) {}
  },

  isMuted() {
    return isMuted;
  },

  /**
   * Plays an arbitrary one-shot recipe (see `soundRecipes.js`), gated by the
   * same "user gestured, not muted, no reduced-sound preference" checks as
   * `playTick`/`playClack`. This is the composable half of the sound-recipe
   * API: `AudioSynth.playRecipe({ ...soundRecipes.tick, freqStart: 1200 })`.
   * @param {import('./soundRecipes.js').OneShotSoundRecipe} recipe
   */
  playRecipe(recipe) {
    if (!canActivate()) return;
    try {
      playOneShot(recipe);
    } catch (e) {}
  },

  playTick() {
    if (!canActivate()) return;
    try {
      playOneShot(soundRecipes.tick);
    } catch (e) {}
  },

  playClack() {
    if (!canActivate()) return;
    try {
      playOneShot(soundRecipes.clack);
    } catch (e) {}
  },

  startSlide() {
    if (!canActivate()) return { update() {}, stop() {} };
    try {
      const recipe = soundRecipes.slide;
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(masterGainNode);

      osc.type = recipe.waveform ?? 'sine';
      osc.frequency.setValueAtTime(recipe.startFreq, ctx.currentTime);
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(recipe.attackGain, ctx.currentTime + recipe.attackTime);

      osc.start();

      return {
        update(pitch) {
          const freq = Math.max(recipe.minFreq, Math.min(recipe.maxFreq, pitch));
          osc.frequency.setTargetAtTime(freq, ctx.currentTime, recipe.updateSmoothing);
        },
        stop() {
          try {
            gain.gain.cancelScheduledValues(ctx.currentTime);
            gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + recipe.releaseTime);
            setTimeout(() => {
              try {
                osc.stop();
                osc.disconnect();
                gain.disconnect();
              } catch (err) {}
            }, recipe.teardownDelay);
          } catch (err) {}
        }
      };
    } catch (e) {
      return { update() {}, stop() {} };
    }
  },

  startHum() {
    if (!canActivate()) return { updateVolume() {}, stop() {} };
    try {
      const recipe = soundRecipes.hum;
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(masterGainNode);

      osc.type = recipe.waveform ?? 'sine';
      osc.frequency.setValueAtTime(recipe.freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      osc.start();
      return {
        updateVolume(dist) {
          const targetVol = Math.max(recipe.minGain, Math.min(recipe.maxGain, (1 - dist / 100) * recipe.maxGain));
          gain.gain.setTargetAtTime(targetVol, ctx.currentTime, recipe.smoothing);
        },
        stop() {
          try {
            gain.gain.cancelScheduledValues(ctx.currentTime);
            gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + recipe.releaseTime);
            setTimeout(() => {
              try {
                osc.stop();
                osc.disconnect();
                gain.disconnect();
              } catch (err) {}
            }, recipe.teardownDelay);
          } catch (err) {}
        }
      };
    } catch (e) {
      return { updateVolume() {}, stop() {} };
    }
  }
};
