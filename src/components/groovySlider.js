import { AudioSynth } from './audioSynth.js';
import { setAria, makeFocusable, addPointerDrag, prefersReducedMotion, onReducedMotionChange } from './utils.js';

export function createGroovySlider(options = {}) {
  const container = document.createElement('div');
  container.className = 'wave-slider-container';

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'wave-slider-svg');
  svg.setAttribute('aria-hidden', 'true');

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('class', 'wave-slider-path');
  svg.appendChild(path);
  container.appendChild(svg);

  const knob = document.createElement('div');
  knob.className = 'wave-slider-knob';
  knob.setAttribute('aria-hidden', 'true');
  container.appendChild(knob);

  container.setAttribute('role', 'slider');
  makeFocusable(container);
  container.classList.add('winky-focus-visible');

  let value = options.initialValue ?? 20;
  let isDragging = false;
  let notchCount = options.notchCount ?? 8;
  let waveAmplitude = options.waveAmplitude ?? 18;
  let snapThreshold = options.snapThreshold ?? 3.5;
  const onChange = options.onChange;
  let reducedMotion = prefersReducedMotion();

  let lastSnappedNotch = -1;
  const trackWidth = 260;
  const centerY = 40;

  setAria(container, {
    'valuemin': '0',
    'valuemax': '100',
    'valuenow': String(Math.round(value)),
    'valuetext': `${Math.round(value)}%`,
    'label': 'Groovy wave slider',
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
      notch.className = 'wave-notch';
      notch.style.left = `${pos.x}px`;
      notch.style.top = `${pos.y}px`;
      container.appendChild(notch);
      notchesEl.push(notch);
    }
  }

  function update(val, force = false) {
    let targetVal = val;
    let currentSnapped = -1;

    for (let i = 0; i < notchCount; i++) {
      const notchVal = i * (100 / (notchCount - 1));
      if (Math.abs(val - notchVal) < snapThreshold) {
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

    if (onChange && (currentSnapped !== lastSnappedNotch || force)) {
      onChange(Math.round(value));
    }

    if (currentSnapped !== -1 && currentSnapped !== lastSnappedNotch && !force) {
      AudioSynth.playTick();

      if (!reducedMotion) {
        knob.classList.remove('jiggling');
        void knob.offsetWidth;
        knob.classList.add('jiggling');
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

  container.destroy = () => {
    motionListener();
  };

  container.getControls = () => {
    return [
      { label: 'Notch Count', type: 'range', min: 3, max: 15, step: 1, value: notchCount, onChange: (v) => { notchCount = parseInt(v); renderNotches(); update(value, true); } },
      { label: 'Wave Height', type: 'range', min: 0, max: 30, step: 1, value: waveAmplitude, onChange: (v) => { waveAmplitude = parseInt(v); drawPath(); renderNotches(); update(value, true); } },
      { label: 'Snap Range %', type: 'range', min: 1.0, max: 8.0, step: 0.5, value: snapThreshold, onChange: (v) => { snapThreshold = parseFloat(v); } }
    ];
  };

  container.getCodeSnippet = () => {
    return `import { createGroovySlider } from 'winky-wonky';

const slider = createGroovySlider({
  initialValue: 20,
  notchCount: 8,
  waveAmplitude: 18,
  snapThreshold: 3.5,
  onChange: (value) => console.log('Snapped to value: ', value)
});
document.body.appendChild(slider);`;
  };

  return container;
}
