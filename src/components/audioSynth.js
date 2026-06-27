import { shouldPlaySound } from './utils.js';

let audioCtx = null;
let masterGainNode = null;
let masterVolume = 0.15;
let isMuted = false;
let userInteracted = false;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
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
  return userInteracted && !isMuted && shouldPlaySound();
}

function primeAudio() {
  if (!userInteracted) {
    userInteracted = true;
    try { getAudioContext(); } catch (e) {}
  }
}

document.addEventListener('pointerdown', primeAudio, { once: true });
document.addEventListener('keydown', primeAudio, { once: true });

export const AudioSynth = {
  setVolume(level) {
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
    try {
      const ctx = getAudioContext();
      isMuted = true;
      masterGainNode.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
    } catch (e) {}
  },

  unmute() {
    try {
      const ctx = getAudioContext();
      isMuted = false;
      masterGainNode.gain.setTargetAtTime(masterVolume, ctx.currentTime, 0.05);
    } catch (e) {}
  },

  isMuted() {
    return isMuted;
  },

  playTick() {
    if (!canActivate()) return;
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(masterGainNode);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.008);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);

      osc.start();
      osc.stop(ctx.currentTime + 0.025);
    } catch (e) {}
  },

  playClack() {
    if (!canActivate()) return;
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(masterGainNode);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.015);

      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

      osc.start();
      osc.stop(ctx.currentTime + 0.035);
    } catch (e) {}
  },

  startSlide() {
    if (!canActivate()) return { update() {}, stop() {} };
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(masterGainNode);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 0.04);

      osc.start();

      return {
        update(pitch) {
          const freq = Math.max(200, Math.min(600, pitch));
          osc.frequency.setTargetAtTime(freq, ctx.currentTime, 0.04);
        },
        stop() {
          try {
            gain.gain.cancelScheduledValues(ctx.currentTime);
            gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
            setTimeout(() => {
              try {
                osc.stop();
                osc.disconnect();
                gain.disconnect();
              } catch (err) {}
            }, 60);
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
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(masterGainNode);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(60, ctx.currentTime);
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      osc.start();
      return {
        updateVolume(dist) {
          const targetVol = Math.max(0.001, Math.min(0.06, (1 - dist / 100) * 0.06));
          gain.gain.setTargetAtTime(targetVol, ctx.currentTime, 0.05);
        },
        stop() {
          try {
            gain.gain.cancelScheduledValues(ctx.currentTime);
            gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
            setTimeout(() => {
              try {
                osc.stop();
                osc.disconnect();
                gain.disconnect();
              } catch (err) {}
            }, 100);
          } catch (err) {}
        }
      };
    } catch (e) {
      return { updateVolume() {}, stop() {} };
    }
  }
};
