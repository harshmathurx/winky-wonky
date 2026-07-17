import { AudioSynth } from './audioSynth.js';
import { prefersReducedMotion, onReducedMotionChange } from './utils.js';

/**
 * @typedef {Object} RotaryPalette
 * @property {string} name - Display name, also used as each dial hole's aria-label.
 * @property {'dark'|string} theme - Applied to `<html data-theme>`; `'dark'`
 *   removes the attribute (dark is the default theme).
 * @property {Object<string, string>} colors - CSS custom property name →
 *   value pairs applied to `document.documentElement.style`.
 */

/**
 * @typedef {Object} RotaryColorPickerOptions
 * @property {string} [ariaLabel='Color palette selector'] - Accessible name
 *   for the dial's radiogroup.
 * @property {RotaryPalette[]} [palettes] - Palettes to dial through; defaults
 *   to 5 built-in theme palettes.
 * @property {(palette: RotaryPalette) => void} [onDialComplete] - Called once
 *   the dial animation finishes and the palette has been applied.
 */

/**
 * @typedef {Object} RotaryColorPickerInstance
 * @property {HTMLElement} el - Root element (dial + holes); append this to the DOM.
 * @property {() => number} getValue - Index of the currently selected
 *   palette in the `palettes` array, or -1 if none selected yet.
 * @property {(index: number) => void} setValue - Dials to and applies the
 *   palette at `index`. Note: unlike other components' `setValue`, this
 *   drives the same visual dial animation and DOES invoke `onDialComplete`
 *   (the palette application is the whole point of the call).
 * @property {() => void} destroy - Removes the reduced-motion listener.
 */

/**
 * Creates a rotary-dial color/theme palette picker; dialing a hole applies
 * its palette's CSS custom properties to `document.documentElement`.
 * @param {RotaryColorPickerOptions} [options]
 * @returns {RotaryColorPickerInstance}
 */
export function createRotaryColorPicker(options = {}) {
  const container = document.createElement('div');
  container.className = 'winky-rotary-selector-container';

  const outer = document.createElement('div');
  outer.className = 'winky-rotary-dial-outer';
  outer.setAttribute('role', 'radiogroup');
  outer.setAttribute('aria-label', options.ariaLabel ?? 'Color palette selector');

  const center = document.createElement('div');
  center.className = 'winky-rotary-center';
  center.textContent = 'Rotary Palette';
  outer.appendChild(center);

  const wheel = document.createElement('div');
  wheel.className = 'winky-rotary-wheel';
  wheel.setAttribute('aria-hidden', 'true');
  outer.appendChild(wheel);
  container.appendChild(outer);

  const palettes = options.palettes ?? [
    {
      name: 'Indigo Dark',
      theme: 'dark',
      colors: {
        '--winky-bg-primary': '#0A0A0F',
        '--winky-bg-secondary': '#14141C',
        '--winky-accent-color': '#6366F1',
        '--winky-accent-alt': '#8B5CF6',
        '--winky-accent-teal': '#2DD4BF',
        '--winky-text-primary': '#F4F4F8',
        '--winky-border-color': 'rgba(255,255,255,0.08)'
      }
    },
    {
      name: 'Budapest Rose',
      theme: 'anderson',
      colors: {
        '--winky-bg-primary': '#FAF6F0',
        '--winky-bg-secondary': '#F1E4C3',
        '--winky-accent-color': '#D8A035',
        '--winky-accent-alt': '#E5A9A9',
        '--winky-accent-teal': '#7DB3B3',
        '--winky-text-primary': '#2B2520',
        '--winky-border-color': 'rgba(43,37,32,0.12)'
      }
    },
    {
      name: 'Darjeeling Teal',
      theme: 'anderson',
      colors: {
        '--winky-bg-primary': '#E2F1F1',
        '--winky-bg-secondary': '#CBE4E4',
        '--winky-accent-color': '#BC7056',
        '--winky-accent-alt': '#DDAA77',
        '--winky-accent-teal': '#588D8E',
        '--winky-text-primary': '#1A3333',
        '--winky-border-color': 'rgba(26,51,51,0.12)'
      }
    },
    {
      name: 'Beetlejuice Orange',
      theme: 'burton',
      colors: {
        '--winky-bg-primary': '#0F0F14',
        '--winky-bg-secondary': '#1A1A24',
        '--winky-accent-color': '#F37F30',
        '--winky-accent-alt': '#8D5B4C',
        '--winky-accent-teal': '#496F5E',
        '--winky-text-primary': '#E8E5EE',
        '--winky-border-color': 'rgba(255,255,255,0.06)'
      }
    },
    {
      name: 'Gothic Violet',
      theme: 'burton',
      colors: {
        '--winky-bg-primary': '#08050C',
        '--winky-bg-secondary': '#120C1C',
        '--winky-accent-color': '#B57EDC',
        '--winky-accent-alt': '#6E2D85',
        '--winky-accent-teal': '#285850',
        '--winky-text-primary': '#DDD7E5',
        '--winky-border-color': '#DDD7E5'
      }
    }
  ];
  const onDialComplete = options.onDialComplete;
  let reducedMotion = prefersReducedMotion();

  const startAngle = 35;
  const gapAngle = 45;

  const holes = [];

  palettes.forEach((p, index) => {
    const angle = startAngle + index * gapAngle;
    const rad = angle * Math.PI / 180;

    const distance = 54;
    const x = 80 + Math.cos(rad) * distance;
    const y = 80 + Math.sin(rad) * distance;

    const hole = document.createElement('div');
    hole.className = 'winky-rotary-hole winky-focus-visible';
    hole.style.left = `${x}px`;
    hole.style.top = `${y}px`;
    hole.textContent = `${index + 1}`;
    hole.setAttribute('role', 'radio');
    hole.setAttribute('aria-checked', 'false');
    hole.setAttribute('aria-label', p.name);
    hole.tabIndex = 0;
    hole.dataset.index = String(index);

    wheel.appendChild(hole);
    holes.push(hole);

    hole.addEventListener('click', (e) => {
      e.stopPropagation();
      dialPalette(index);
    });

    hole.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        dialPalette(index);
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIdx = (index + 1) % palettes.length;
        holes[nextIdx].focus();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIdx = (index - 1 + palettes.length) % palettes.length;
        holes[prevIdx].focus();
      }
    });
  });

  let isDialing = false;
  let currentIndex = -1;

  function applyPalette(palette) {
    const root = document.documentElement;
    if (palette.theme === 'dark') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', palette.theme);
    }

    Object.entries(palette.colors).forEach(([variable, value]) => {
      root.style.setProperty(variable, value);
    });

    const accentHex = palette.colors['--winky-accent-color'];
    if (accentHex) {
      const rgb = hexToRgb(accentHex);
      if (rgb) {
        root.style.setProperty('--winky-accent-glow', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`);
      }
    }

    const event = new CustomEvent('theme-changed', { detail: palette.theme });
    window.dispatchEvent(event);
  }

  function selectPalette(index) {
    if (index < 0 || index >= palettes.length) return;
    holes.forEach((h, i) => h.setAttribute('aria-checked', i === index ? 'true' : 'false'));
    currentIndex = index;
    applyPalette(palettes[index]);
    center.textContent = palettes[index].name;
  }

  function dialPalette(index) {
    if (isDialing) return;
    isDialing = true;

    holes.forEach((h, i) => h.setAttribute('aria-checked', i === index ? 'true' : 'false'));
    currentIndex = index;

    if (reducedMotion) {
      applyPalette(palettes[index]);
      center.textContent = palettes[index].name;
      if (onDialComplete) onDialComplete(palettes[index]);
      isDialing = false;
      return;
    }

    const targetAngle = startAngle + index * gapAngle;
    const stopperAngle = 230;
    const travelAngle = stopperAngle - targetAngle;

    const tickSteps = Math.floor(travelAngle / 15);
    for (let step = 0; step < tickSteps; step++) {
      setTimeout(() => { AudioSynth.playTick(); }, step * 25);
    }

    wheel.style.transition = 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)';
    wheel.style.transform = `rotate(${travelAngle}deg)`;

    setTimeout(() => {
      AudioSynth.playClack();

      applyPalette(palettes[index]);
      center.textContent = palettes[index].name;

      if (onDialComplete) onDialComplete(palettes[index]);

      wheel.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.25)';
      wheel.style.transform = 'rotate(0deg)';

      setTimeout(() => { AudioSynth.playTick(); }, 50);
      setTimeout(() => { isDialing = false; }, 550);
    }, 450);
  }

  function hexToRgb(hex) {
    const match = hex.match(/^#?([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})$/i);
    if (!match) return null;
    return { r: parseInt(match[1], 16), g: parseInt(match[2], 16), b: parseInt(match[3], 16) };
  }

  const motionListener = onReducedMotionChange(() => {
    reducedMotion = prefersReducedMotion();
  });

  function destroy() {
    motionListener();
  }

  function getValue() {
    return currentIndex;
  }

  function setValue(index) {
    selectPalette(index);
  }

  return { el: container, getValue, setValue, destroy };
}
