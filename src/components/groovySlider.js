import { AudioSynth } from './audioSynth.js';
import { setAria, makeFocusable, addPointerDrag, prefersReducedMotion, onReducedMotionChange } from './utils.js';

/**
 * @typedef {Object} GroovySliderOptions
 * @property {number} [initialValue=20] - Starting value, 0-100.
 * @property {number} [notchCount=8] - Number of magnetic snap notches.
 * @property {number} [waveAmplitude=18] - Sine-wave track height in px.
 * @property {number} [snapThreshold=3.5] - Distance (in value units) within
 *   which the knob snaps to the nearest notch.
 * @property {string} [ariaLabel='Groovy wave slider'] - Accessible name.
 * @property {(value: number) => void} [onChange] - Called with the rounded
 *   value whenever it changes from user interaction (never from `setValue`).
 */

/**
 * @typedef {Object} GroovySliderInstance
 * @property {HTMLElement} el - Root element; append this to the DOM.
 * @property {() => number} getValue - Current rounded value (0-100).
 * @property {(value: number) => void} setValue - Programmatically set the
 *   value. Updates the DOM and ARIA state; does NOT invoke `onChange`.
 * @property {(partial: {notchCount?: number, waveAmplitude?: number}) => void} setOptions -
 *   Rebuilds the track/notches for structural knob changes.
 * @property {() => void} destroy
 * @property {{snapThreshold: number}} config - Live-mutable passive knob.
 */

/**
 * Creates a slider that moves along a wavy sine track and snaps magnetically
 * into notches.
 * @param {GroovySliderOptions} [options]
 * @returns {GroovySliderInstance}
 */
export function createGroovySlider(options = {}) {
  const container = document.createElement('div');
  container.className = 'winky-wave-slider-container';

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'winky-wave-slider-svg');
  svg.setAttribute('aria-hidden', 'true');

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('class', 'winky-wave-slider-path');
  svg.appendChild(path);
  container.appendChild(svg);

  const knob = document.createElement('div');
  knob.className = 'winky-wave-slider-knob';
  knob.setAttribute('aria-hidden', 'true');
  container.appendChild(knob);

  container.setAttribute('role', 'slider');
  makeFocusable(container);
  container.classList.add('winky-focus-visible');

  let value = options.initialValue ?? 20;
  let isDragging = false;
  let notchCount = options.notchCount ?? 8;
  let waveAmplitude = options.waveAmplitude ?? 18;
  const config = {
    snapThreshold: options.snapThreshold ?? 3.5,
  };
  const onChange = options.onChange;
  const ariaLabel = options.ariaLabel ?? 'Groovy wave slider';
  let reducedMotion = prefersReducedMotion();

  let lastSnappedNotch = -1;
  const trackWidth = 260;
  const centerY = 40;

  setAria(container, {
    'valuemin': '0',
    'valuemax': '100',
    'valuenow': String(Math.round(value)),
    'valuetext': `${Math.round(value)}%`,
    'label': ariaLabel,
  });

  function getPosition(val) {
    const x = (val / 100) * trackWidth;
    const y = centerY + (reducedMotion ? 0 : Math.sin((val / 100) * Math.PI * 6) * waveAmplitude);
    return { x, y };
  }

  function drawPath() {
    if (reducedMotion) {
      path.setAttribute('d', `M 0 ${centerY} L ${trackWidth} ${centerY}`);
      return;
    }
    let d = '';
    for (let i = 0; i <= 100; i++) {
      const pos = getPosition(i);
      d += `${i === 0 ? 'M' : 'L'} ${pos.x} ${pos.y}`;
    }
    path.setAttribute('d', d);
  }

  let notchesEl = [];
  function renderNotches() {
    notchesEl.forEach(el => el.remove());
    notchesEl = [];

    for (let i = 0; i < notchCount; i++) {
      const val = i * (100 / (notchCount - 1));
      const pos = getPosition(val);

      const notch = document.createElement('div');
      notch.className = 'winky-wave-notch';
      notch.style.left = `${pos.x}px`;
      notch.style.top = `${pos.y}px`;
      container.appendChild(notch);
      notchesEl.push(notch);
    }
  }

  // silent=true suppresses onChange + the snap tick/jiggle/vibrate effects,
  // used by setValue() so programmatic updates never fire the callback.
  function update(val, force = false, silent = false) {
    let targetVal = val;
    let currentSnapped = -1;

    for (let i = 0; i < notchCount; i++) {
      const notchVal = i * (100 / (notchCount - 1));
      if (Math.abs(val - notchVal) < config.snapThreshold) {
        targetVal = notchVal;
        currentSnapped = i;
        break;
      }
    }

    value = targetVal;
    const pos = getPosition(value);

    knob.style.left = `${pos.x}px`;
    knob.style.top = `${pos.y}px`;

    container.setAttribute('aria-valuenow', String(Math.round(value)));
    container.setAttribute('aria-valuetext', `${Math.round(value)}%`);

    if (!silent && onChange && (currentSnapped !== lastSnappedNotch || force)) {
      onChange(Math.round(value));
    }

    if (!silent && currentSnapped !== -1 && currentSnapped !== lastSnappedNotch && !force) {
      AudioSynth.playTick();

      if (!reducedMotion) {
        knob.classList.remove('winky-jiggling');
        void knob.offsetWidth;
        knob.classList.add('winky-jiggling');
      }

      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    }

    lastSnappedNotch = currentSnapped;
  }

  function handleDrag(clientX) {
    const rect = container.getBoundingClientRect();
    const mouseX = clientX - rect.left;
    let pct = (mouseX / rect.width) * 100;
    pct = Math.max(0, Math.min(100, pct));
    update(pct);
  }

  addPointerDrag(knob, {
    onDown(e) {
      isDragging = true;
      e.stopPropagation();
    },
    onMove(e) {
      if (!isDragging) return;
      handleDrag(e.clientX);
    },
    onUp() {
      isDragging = false;
    },
  });

  container.addEventListener('pointerdown', (e) => {
    if (e.target === knob) return;
    handleDrag(e.clientX);
  });

  container.addEventListener('keydown', (e) => {
    let stepped = false;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      update(Math.max(0, value - (e.shiftKey ? 10 : 5)));
      stepped = true;
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      update(Math.min(100, value + (e.shiftKey ? 10 : 5)));
      stepped = true;
    } else if (e.key === 'Home') {
      update(0);
      stepped = true;
    } else if (e.key === 'End') {
      update(100);
      stepped = true;
    }
    if (stepped) e.preventDefault();
  });

  const motionListener = onReducedMotionChange(() => {
    reducedMotion = prefersReducedMotion();
    drawPath();
    renderNotches();
    update(value, true);
  });

  drawPath();
  renderNotches();
  update(value, true);

  function destroy() {
    motionListener();
  }

  function getValue() {
    return Math.round(value);
  }

  function setValue(v) {
    update(v, true, true);
  }

  function setOptions(partial = {}) {
    if (partial.notchCount !== undefined) notchCount = partial.notchCount;
    if (partial.waveAmplitude !== undefined) waveAmplitude = partial.waveAmplitude;
    drawPath();
    renderNotches();
    update(value, true);
  }

  return { el: container, getValue, setValue, setOptions, destroy, config };
}
