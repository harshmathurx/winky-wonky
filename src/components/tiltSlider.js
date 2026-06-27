import { AudioSynth } from './audioSynth.js';
import { setAria, makeFocusable, addPointerDrag, prefersReducedMotion, onReducedMotionChange } from './utils.js';

export function createTiltSlider(options = {}) {
  const wrapper = document.createElement('div');
  wrapper.style.display = 'flex';
  wrapper.style.flexDirection = 'column';
  wrapper.style.alignItems = 'center';
  wrapper.style.width = '100%';

  const track = document.createElement('div');
  track.className = 'seesaw-slider-track';
  track.setAttribute('role', 'slider');
  makeFocusable(track);
  track.classList.add('winky-focus-visible');

  const pivot = document.createElement('div');
  pivot.className = 'seesaw-pivot';
  track.appendChild(pivot);

  const knob = document.createElement('div');
  knob.className = 'seesaw-slider-knob';
  knob.setAttribute('aria-hidden', 'true');
  track.appendChild(knob);

  const valueDisplay = document.createElement('div');
  valueDisplay.className = 'seesaw-value';
  valueDisplay.textContent = '50%';
  knob.appendChild(valueDisplay);

  wrapper.appendChild(track);

  let value = options.initialValue ?? 50;
  let angle = 0;
  let isDragging = false;
  let gravity = options.gravity ?? 0.4;
  let maxTilt = options.maxTilt ?? 15;
  let springLag = options.springLag ?? 0.2;
  const onChange = options.onChange;

  let targetValue = value;
  let activeSlideSound = null;
  let reducedMotion = prefersReducedMotion();

  setAria(track, {
    'valuemin': '0',
    'valuemax': '100',
    'valuenow': String(Math.round(value)),
    'valuetext': `${Math.round(value)}%`,
    'label': 'Seesaw volume slider',
  });

  function updateAria() {
    const v = Math.round(value);
    track.setAttribute('aria-valuenow', String(v));
    track.setAttribute('aria-valuetext', `${v}%`);
  }

  function updateRender() {
    if (!isDragging && Math.abs(angle) > 0.5 && !reducedMotion) {
      const gravityForce = Math.sin(angle * Math.PI / 180) * gravity * 15;
      value += gravityForce;
      value = Math.max(0, Math.min(100, value));
      targetValue = value;
    } else if (isDragging) {
      value += (targetValue - value) * springLag;
    }

    knob.style.left = `${value}%`;
    const displayVal = Math.round(value);
    valueDisplay.textContent = `${displayVal}%`;
    valueDisplay.style.transform = `translateX(-50%) rotate(${-angle}deg)`;

    if (!reducedMotion) {
      track.style.transform = `rotate(${angle}deg)`;
    }

    if (onChange && !isDragging) {
      onChange(displayVal);
    }
    updateAria();

    if (activeSlideSound && Math.abs(targetValue - value) > 0.05) {
      const pitch = 200 + (value / 100) * 400 + Math.abs(angle) * 8;
      activeSlideSound.update(pitch);
    }
  }

  let needsRender = true;
  function loop() {
    if (needsRender || isDragging || (!reducedMotion && Math.abs(angle) > 0.5)) {
      updateRender();
    }
    animId = requestAnimationFrame(loop);
  }
  let animId = requestAnimationFrame(loop);

  function handleTiltMove(e) {
    if (isDragging || reducedMotion) return;
    const rect = track.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const centerX = rect.width / 2;
    const percent = (mouseX - centerX) / centerX;
    angle = percent * maxTilt;
    needsRender = true;

    if (!activeSlideSound) {
      activeSlideSound = AudioSynth.startSlide();
    }
  }

  function resetTilt() {
    if (isDragging) return;
    angle = 0;
    needsRender = true;
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
      needsRender = true;
      if (!activeSlideSound) {
        activeSlideSound = AudioSynth.startSlide();
      }
    },
    onMove(e) {
      const rect = track.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const pct = Math.max(0, Math.min(100, (mouseX / rect.width) * 100));
      targetValue = pct;
      needsRender = true;
      if (onChange) onChange(Math.round(targetValue));
    },
    onUp() {
      isDragging = false;
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
      needsRender = true;
      AudioSynth.playTick();
      if (onChange) onChange(Math.round(value));
    }
  });

  const motionListener = onReducedMotionChange(() => {
    reducedMotion = prefersReducedMotion();
    if (reducedMotion) {
      angle = 0;
      track.style.transform = 'none';
    }
  });

  wrapper.destroy = () => {
    cancelAnimationFrame(animId);
    if (activeSlideSound) activeSlideSound.stop();
    track.removeEventListener('pointermove', handleTiltMove);
    track.removeEventListener('pointerleave', resetTilt);
    motionListener();
  };

  wrapper.getControls = () => {
    return [
      { label: 'Gravity Power', type: 'range', min: 0.1, max: 1.5, step: 0.1, value: gravity, onChange: (v) => { gravity = parseFloat(v); } },
      { label: 'Max Seesaw Tilt', type: 'range', min: 5, max: 30, step: 1, value: maxTilt, onChange: (v) => { maxTilt = parseInt(v); } },
      { label: 'Spring Lag', type: 'range', min: 0.05, max: 1.0, step: 0.05, value: springLag, onChange: (v) => { springLag = parseFloat(v); } }
    ];
  };

  wrapper.getCodeSnippet = () => {
    return `import { createTiltSlider } from 'winky-wonky';

const slider = createTiltSlider({
  initialValue: 50,
  gravity: 0.4,
  maxTilt: 15,
  springLag: 0.2,
  onChange: (value) => console.log('Volume is: ', value)
});
document.body.appendChild(slider);`;
  };

  return wrapper;
}
