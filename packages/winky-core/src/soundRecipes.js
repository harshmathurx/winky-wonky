/**
 * Composable sound "recipes" — plain data describing an oscillator +
 * envelope. `AudioSynth.playTick()`/`playClack()` are implemented on top of
 * `soundRecipes.tick`/`soundRecipes.clack` via `AudioSynth.playRecipe()`, so
 * you can reuse the exact same values, or override any field to compose
 * your own one-shot sound: `AudioSynth.playRecipe({ ...soundRecipes.tick,
 * freqStart: 1200 })`.
 *
 * `slide` and `hum` describe the two continuous tones (`startSlide`/
 * `startHum`) — they aren't one-shot-playable via `playRecipe`, but are
 * exposed so the constants driving those two builtin continuous sounds are
 * documented and reusable rather than magic numbers buried in `audio.js`.
 */

/**
 * @typedef {Object} OneShotSoundRecipe
 * @property {OscillatorType} [waveform='sine'] - Oscillator waveform.
 * @property {number} freqStart - Starting frequency, Hz.
 * @property {number} freqEnd - Frequency the oscillator ramps to, Hz.
 * @property {number} freqRampTime - Seconds for the frequency ramp.
 * @property {number} gainStart - Starting gain (0-1).
 * @property {number} gainEnd - Gain the envelope ramps to (0-1, must be > 0
 *   since the ramp is exponential).
 * @property {number} gainRampTime - Seconds for the gain ramp.
 * @property {number} stopTime - Seconds after which the oscillator stops.
 */

/**
 * @typedef {Object} SlideSoundRecipe
 * @property {OscillatorType} [waveform='sine']
 * @property {number} startFreq - Frequency at the moment the slide starts, Hz.
 * @property {number} minFreq - Lower clamp for `update(pitch)`, Hz.
 * @property {number} maxFreq - Upper clamp for `update(pitch)`, Hz.
 * @property {number} attackGain - Peak gain reached during the attack (0-1).
 * @property {number} attackTime - Seconds for the attack ramp.
 * @property {number} updateSmoothing - Time constant (seconds) for
 *   `setTargetAtTime` smoothing on each `update()` call.
 * @property {number} releaseTime - Seconds for the release ramp on `stop()`.
 * @property {number} teardownDelay - Milliseconds after `stop()` before the
 *   oscillator is actually stopped/disconnected (must be >= releaseTime*1000).
 */

/**
 * @typedef {Object} HumSoundRecipe
 * @property {OscillatorType} [waveform='sine']
 * @property {number} freq - Fixed drone frequency, Hz.
 * @property {number} maxGain - Gain at `dist = 0` in `updateVolume(dist)` (0-1).
 * @property {number} minGain - Gain floor (0-1, must be > 0).
 * @property {number} smoothing - Time constant (seconds) for `setTargetAtTime` smoothing.
 * @property {number} releaseTime - Seconds for the release ramp on `stop()`.
 * @property {number} teardownDelay - Milliseconds after `stop()` before the
 *   oscillator is actually stopped/disconnected.
 */

/**
 * @type {{tick: OneShotSoundRecipe, clack: OneShotSoundRecipe, slide: SlideSoundRecipe, hum: HumSoundRecipe}}
 */
export const soundRecipes = {
  tick: {
    waveform: 'sine',
    freqStart: 800,
    freqEnd: 400,
    freqRampTime: 0.008,
    gainStart: 0.08,
    gainEnd: 0.001,
    gainRampTime: 0.02,
    stopTime: 0.025,
  },
  clack: {
    waveform: 'sine',
    freqStart: 200,
    freqEnd: 100,
    freqRampTime: 0.015,
    gainStart: 0.1,
    gainEnd: 0.001,
    gainRampTime: 0.03,
    stopTime: 0.035,
  },
  slide: {
    waveform: 'sine',
    startFreq: 320,
    minFreq: 200,
    maxFreq: 600,
    attackGain: 0.03,
    attackTime: 0.04,
    updateSmoothing: 0.04,
    releaseTime: 0.05,
    teardownDelay: 60,
  },
  hum: {
    waveform: 'sine',
    freq: 60,
    maxGain: 0.06,
    minGain: 0.001,
    smoothing: 0.05,
    releaseTime: 0.08,
    teardownDelay: 100,
  },
};
