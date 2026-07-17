import { AudioSynth } from './audioSynth.js';
import { setAria, makeFocusable, addPointerDrag, prefersReducedMotion, onReducedMotionChange } from './utils.js';

/**
 * @typedef {Object} TiltSliderOptions
 * @property {number} [initialValue=50] - Starting value, 0-100.
 * @property {number} [gravity=0.4] - How strongly the knob slides down the
 *   tilted track once released (0.1-1.5 is a sane range).
 * @property {number} [maxTilt=15] - Maximum seesaw tilt angle in degrees.
 * @property {number} [springLag=0.2] - Drag-follow lag (0-1, higher = snappier).
 * @property {string} [ariaLabel='Seesaw volume slider'] - Accessible name for the slider.
 * @property {(value: number) => void} [onChange] - Called with the rounded
 *   value whenever it changes from user interaction (never from `setValue`).
 */

/**
 * @typedef {Object} TiltSliderInstance
 * @property {HTMLElement} el - Root element; append this to the DOM.
 * @property {() => number} getValue - Current rounded value (0-100).
 * @property {(value: number) => void} setValue - Programmatically set the
 *   value. Updates the DOM and ARIA state; does NOT invoke `onChange`.
 * @property {() => void} destroy - Cancels the render loop, stops any
 *   in-flight sound, and removes listeners.
 * @property {{gravity: number, maxTilt: number, springLag: number}} config -
 *   Live-mutable secondary physics knobs (used by the playground's tuning
 *   panel; most consumers just pass options at creation time instead).
 */

/**
 * Creates a "seesaw" slider: hovering tilts the track and gravity slides the
 * knob down-slope; dragging moves it directly.
 * @param {TiltSliderOptions} [options]
 * @returns {TiltSliderInstance}
 */
export function createTiltSlider(options = {}) {
  const wrapper = document.createElement('div');
  wrapper.style.display = 'flex';
  wrapper.style.flexDirection = 'column';
  wrapper.style.alignItems = 'center';
  wrapper.style.width = '100%';

  const track = document.createElement('div');
  track.className = 'winky-seesaw-slider-track';
  track.setAttribute('role', 'slider');
  makeFocusable(track);
  track.classList.add('winky-focus-visible');

  const pivot = document.createElement('div');
  pivot.className = 'winky-seesaw-pivot';
  track.appendChild(pivot);

  const knob = document.createElement('div');
  knob.className = 'winky-seesaw-slider-knob';
  knob.setAttribute('aria-hidden', 'true');
  track.appendChild(knob);

  const valueDisplay = document.createElement('div');
  valueDisplay.className = 'winky-seesaw-value';
  valueDisplay.textContent = '50%';
  knob.appendChild(valueDisplay);

  wrapper.appendChild(track);

  let value = options.initialValue ?? 50;
  let angle = 0;
  let isDragging = false;
  const config = {
    gravity: options.gravity ?? 0.4,
    maxTilt: options.maxTilt ?? 15,
    springLag: options.springLag ?? 0.2,
  };
  const onChange = options.onChange;
  const ariaLabel = options.ariaLabel ?? 'Seesaw volume slider';

  let targetValue = value;
  let activeSlideSound = null;
  let reducedMotion = prefersReducedMotion();

  setAria(track, {
    'valuemin': '0',
    'valuemax': '100',
    'valuenow': String(Math.round(value)),
    'valuetext': `${Math.round(value)}%`,
    'label': ariaLabel,
  });

  function updateAria() {
    const v = Math.round(value);
    track.setAttribute('aria-valuenow', String(v));
    track.setAttribute('aria-valuetext', `${v}%`);
  }

  let lastEmittedValue = Math.round(value);
  function emitChange(v) {
    const rounded = Math.round(v);
    if (rounded === lastEmittedValue) return;
    lastEmittedValue = rounded;
    if (onChange) onChange(rounded);
  }

  // Paint DOM + ARIA from current `value`/`angle` state. Pure — no physics,
  // no onChange. Shared by the render loop and by setValue().
  function paint() {
    knob.style.left = `${value}%`;
    const displayVal = Math.round(value);
    valueDisplay.textContent = `${displayVal}%`;
    valueDisplay.style.transform = `translateX(-50%) rotate(${-angle}deg)`;

    if (!reducedMotion) {
      track.style.transform = `rotate(${angle}deg)`;
    }

    updateAria();
  }

  // True while the physics still needs to move on its own (gravity pulling
  // the value back, or the drag spring lagging toward its target) — i.e.
  // frames the loop must keep producing even without new interaction events.
  function isPhysicsActive() {
    if (isDragging) return true;
    if (!reducedMotion && Math.abs(angle) > 0.5) return true;
    return false;
  }

  function updateRender() {
    if (!isDragging && Math.abs(angle) > 0.5 && !reducedMotion) {
      const gravityForce = Math.sin(angle * Math.PI / 180) * config.gravity * 15;
      value += gravityForce;
      value = Math.max(0, Math.min(100, value));
      targetValue = value;
    } else if (isDragging) {
      value += (targetValue - value) * config.springLag;
    }

    paint();
    emitChange(value);

    if (activeSlideSound && Math.abs(targetValue - value) > 0.05) {
      const pitch = 200 + (value / 100) * 400 + Math.abs(angle) * 8;
      activeSlideSound.update(pitch);
    }
  }

  let animId = null;
  let needsRender = false;

  function frame() {
    animId = null;
    updateRender();
    needsRender = false;
    if (isPhysicsActive() || needsRender) {
      scheduleFrame();
    }
  }

  function scheduleFrame() {
    if (animId != null) return;
    animId = requestAnimationFrame(frame);
  }

  function requestRender() {
    needsRender = true;
    scheduleFrame();
  }

  // Paint the initial state once, then idle until interaction.
  requestRender();

  function handleTiltMove(e) {
    if (isDragging || reducedMotion) return;
    const rect = track.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const centerX = rect.width / 2;
    const percent = (mouseX - centerX) / centerX;
    angle = percent * config.maxTilt;
    requestRender();

    if (!activeSlideSound) {
      activeSlideSound = AudioSynth.startSlide();
    }
  }

  function resetTilt() {
    if (isDragging) return;
    angle = 0;
    requestRender();
    if (activeSlideSound) {
      activeSlideSound.stop();
      activeSlideSound = null;
    }
  }

  track.addEventListener('pointermove', handleTiltMove);
  track.addEventListener('pointerleave', resetTilt);

  addPointerDrag(knob, {
    onDown(e) {
      isDragging = true;
      e.stopPropagation();
      angle = 0;
      requestRender();
      if (!activeSlideSound) {
        activeSlideSound = AudioSynth.startSlide();
      }
    },
    onMove(e) {
      const rect = track.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const pct = Math.max(0, Math.min(100, (mouseX / rect.width) * 100));
      targetValue = pct;
      requestRender();
    },
    onUp() {
      isDragging = false;
      requestRender();
      if (activeSlideSound) {
        activeSlideSound.stop();
        activeSlideSound = null;
      }
    },
  });

  track.addEventListener('keydown', (e) => {
    let stepped = false;
    const step = e.shiftKey ? 10 : 1;

    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      value = Math.max(0, value - step);
      targetValue = value;
      stepped = true;
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      value = Math.min(100, value + step);
      targetValue = value;
      stepped = true;
    } else if (e.key === 'Home') {
      value = 0;
      targetValue = value;
      stepped = true;
    } else if (e.key === 'End') {
      value = 100;
      targetValue = value;
      stepped = true;
    }

    if (stepped) {
      e.preventDefault();
      AudioSynth.playTick();
      requestRender();
    }
  });

  const motionListener = onReducedMotionChange(() => {
    reducedMotion = prefersReducedMotion();
    if (reducedMotion) {
      angle = 0;
      track.style.transform = 'none';
    }
    requestRender();
  });

  function destroy() {
    if (animId != null) cancelAnimationFrame(animId);
    if (activeSlideSound) activeSlideSound.stop();
    track.removeEventListener('pointermove', handleTiltMove);
    track.removeEventListener('pointerleave', resetTilt);
    motionListener();
  }

  function getValue() {
    return Math.round(value);
  }

  function setValue(v) {
    value = Math.max(0, Math.min(100, v));
    targetValue = value;
    angle = 0;
    lastEmittedValue = Math.round(value);
    paint();
  }

  return { el: wrapper, getValue, setValue, destroy, config };
}
