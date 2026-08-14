import { AudioSynth, addPointerDrag, createSpring, prefersReducedMotion, onReducedMotionChange } from '@winky/core';
import { setAria, makeFocusable } from './utils.js';

/**
 * @typedef {Object} TiltSliderOptions
 * @property {number} [initialValue=50] - Starting value, 0-100.
 * @property {number} [gravity=0.4] - How strongly the knob slides down the
 *   tilted track once released (0.1-1.5 is a sane range).
 * @property {number} [maxTilt=15] - Maximum seesaw tilt angle in degrees.
 * @property {number} [springLag=0.2] - Drag-follow responsiveness (0-1,
 *   higher = snappier); mapped onto the underlying `@winky/core` spring's
 *   stiffness at the start of each drag.
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
 *
 * Built on `@winky/core`: pointer tracking is `addPointerDrag`, the
 * drag-follow/release-settle motion is a `createSpring` instance (replacing
 * the old ad-hoc `value += (target - value) * springLag` lerp), and the
 * tick/slide sounds and reduced-motion check come from the same core
 * package. The gravity-down-the-slope behavior stays bespoke — it's a
 * continuous per-frame force whose direction/magnitude tracks the *current*
 * hover angle in real time (not a fixed destination), which doesn't fit the
 * "spring toward a target" shape, so it keeps its own small idle-when-flat
 * render loop rather than being forced through `createSpring`.
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

  // Paint DOM + ARIA from current `value`/`angle` state. Pure — no physics,
  // no onChange. Shared by every source of value/angle change.
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

  let lastEmittedValue = Math.round(value);
  function emitChange() {
    const rounded = Math.round(value);
    if (rounded === lastEmittedValue) return;
    lastEmittedValue = rounded;
    if (onChange) onChange(rounded);
  }

  // --- One-shot paint scheduler: creation + keyboard steps are instant
  // value changes (no animation), but still need the DOM update deferred to
  // a frame so onChange fires from a frame boundary like every other
  // interaction (keeps the audit's "onChange only from a real change,
  // exactly once" contract regardless of which path produced the change).
  let oneShotFrameId = null;
  function scheduleOneShotPaint() {
    if (oneShotFrameId != null) return;
    oneShotFrameId = requestAnimationFrame(() => {
      oneShotFrameId = null;
      paint();
      emitChange();
    });
  }

  scheduleOneShotPaint(); // initial paint

  // --- Drag: a fresh spring per drag session, sized from the current
  // `config.springLag` (so tuning it live takes effect on the next drag).
  // Rides on `createSpring`'s own idle-when-settled rAF loop — nothing here
  // schedules frames manually.
  let dragSpring = null;

  function startDragSpring() {
    // A previous drag's settle-into-place spring might still be running if
    // the knob is grabbed again before it finished resting — stop it so it
    // doesn't keep animating in the background after being orphaned below.
    if (dragSpring) dragSpring.stop();
    const stiffness = Math.max(20, config.springLag * 900);
    const damping = 2 * Math.sqrt(stiffness); // critical: no oscillation while dragging
    dragSpring = createSpring({ value, stiffness, damping });
    dragSpring.onUpdate((v) => {
      value = Math.max(0, Math.min(100, v));
      paint();
      emitChange();
      if (activeSlideSound) {
        const pitch = 200 + (value / 100) * 400 + Math.abs(angle) * 8;
        activeSlideSound.update(pitch);
      }
    });
  }

  function stopDragSpring() {
    if (dragSpring) {
      dragSpring.stop();
      dragSpring = null;
    }
  }

  // --- Gravity: a continuous per-frame pull whose direction/strength track
  // the *current* hover angle in real time, independent of new pointer
  // events. Kept as its own tiny idle-when-flat loop (see file-level doc
  // comment for why this isn't a `createSpring` target).
  let gravityFrameId = null;

  function gravityActive() {
    return !isDragging && !reducedMotion && Math.abs(angle) > 0.5;
  }

  function gravityTick() {
    gravityFrameId = null;
    if (!gravityActive()) return;

    const gravityForce = Math.sin(angle * Math.PI / 180) * config.gravity * 15;
    value = Math.max(0, Math.min(100, value + gravityForce));
    paint();
    emitChange();

    if (activeSlideSound && Math.abs(value) >= 0) {
      const pitch = 200 + (value / 100) * 400 + Math.abs(angle) * 8;
      activeSlideSound.update(pitch);
    }

    scheduleGravityFrame();
  }

  function scheduleGravityFrame() {
    if (gravityFrameId != null || !gravityActive()) return;
    gravityFrameId = requestAnimationFrame(gravityTick);
  }

  function stopGravityFrame() {
    if (gravityFrameId != null) {
      cancelAnimationFrame(gravityFrameId);
      gravityFrameId = null;
    }
  }

  function handleTiltMove(e) {
    if (isDragging || reducedMotion) return;
    const rect = track.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const centerX = rect.width / 2;
    const percent = (mouseX - centerX) / centerX;
    angle = percent * config.maxTilt;
    scheduleGravityFrame();

    if (!activeSlideSound) {
      activeSlideSound = AudioSynth.startSlide();
    }
  }

  function resetTilt() {
    if (isDragging) return;
    angle = 0;
    stopGravityFrame();
    paint();
    if (activeSlideSound) {
      activeSlideSound.stop();
      activeSlideSound = null;
    }
  }

  track.addEventListener('pointermove', handleTiltMove);
  track.addEventListener('pointerleave', resetTilt);

  const teardownDrag = addPointerDrag(knob, {
    onDown(e) {
      isDragging = true;
      e.stopPropagation();
      angle = 0;
      stopGravityFrame();
      startDragSpring();
      paint();
      if (!activeSlideSound) {
        activeSlideSound = AudioSynth.startSlide();
      }
    },
    onMove(e) {
      const rect = track.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const pct = Math.max(0, Math.min(100, (mouseX / rect.width) * 100));
      if (dragSpring) dragSpring.target(pct);
    },
    onUp() {
      isDragging = false;
      // Let the spring finish settling into place on its own idle-when-rest
      // loop; only tear it down once it actually gets there.
      if (dragSpring) {
        const spring = dragSpring;
        spring.onRest(() => { if (dragSpring === spring) stopDragSpring(); });
      }
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
      stepped = true;
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      value = Math.min(100, value + step);
      stepped = true;
    } else if (e.key === 'Home') {
      value = 0;
      stepped = true;
    } else if (e.key === 'End') {
      value = 100;
      stepped = true;
    }

    if (stepped) {
      e.preventDefault();
      if (dragSpring) dragSpring.set(value);
      AudioSynth.playTick();
      scheduleOneShotPaint();
    }
  });

  const motionListener = onReducedMotionChange(() => {
    reducedMotion = prefersReducedMotion();
    if (reducedMotion) {
      angle = 0;
      stopGravityFrame();
      track.style.transform = 'none';
    }
    scheduleOneShotPaint();
  });

  function destroy() {
    if (oneShotFrameId != null) cancelAnimationFrame(oneShotFrameId);
    stopGravityFrame();
    stopDragSpring();
    if (activeSlideSound) activeSlideSound.stop();
    track.removeEventListener('pointermove', handleTiltMove);
    track.removeEventListener('pointerleave', resetTilt);
    teardownDrag();
    motionListener();
  }

  function getValue() {
    return Math.round(value);
  }

  function setValue(v) {
    value = Math.max(0, Math.min(100, v));
    angle = 0;
    if (dragSpring) dragSpring.set(value);
    lastEmittedValue = Math.round(value);
    paint();
  }

  return { el: wrapper, getValue, setValue, destroy, config };
}
