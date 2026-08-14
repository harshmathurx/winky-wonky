import { AudioSynth } from './audioSynth.js';
import { setAria, prefersReducedMotion, onReducedMotionChange } from './utils.js';

/**
 * @typedef {Object} TypewriterInputOptions
 * @property {string} [placeholder='Type something peculiar...'] - Input placeholder text.
 * @property {string} [ariaLabel='Typewriter input'] - Accessible name for the input.
 * @property {number} [jitterStrength=3] - Max px/deg of the input's jitter
 *   on each keystroke.
 * @property {number} [maxWobbleRotation=12] - Max degrees of rotation for
 *   each character "projected" onto the board above the input.
 * @property {(value: string) => void} [onChange] - Called with the input's
 *   current text on every keystroke.
 */

/**
 * @typedef {Object} TypewriterInputInstance
 * @property {HTMLElement} el - Root element (projection board + input); append this to the DOM.
 * @property {() => string} getValue - Current input text.
 * @property {(value: string) => void} setValue - Sets the input text and
 *   re-renders the projection board. Does NOT invoke `onChange`.
 * @property {() => void} destroy - Removes the reduced-motion listener.
 * @property {{jitterStrength: number, maxWobbleRotation: number}} config -
 *   Live-mutable knobs, read on every keystroke.
 */

/**
 * Creates a text input whose keystrokes jitter the field and "project" each
 * typed character, wobbling, onto a board above it.
 * @param {TypewriterInputOptions} [options]
 * @returns {TypewriterInputInstance}
 */
export function createTypewriterInput(options = {}) {
  const container = document.createElement('div');
  container.className = 'winky-typewriter-wrapper';

  const projectionBoard = document.createElement('div');
  projectionBoard.className = 'winky-projection-board';
  projectionBoard.setAttribute('aria-hidden', 'true');
  container.appendChild(projectionBoard);

  const inputContainer = document.createElement('div');
  inputContainer.className = 'winky-quill-input-container';

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'winky-quill-input winky-focus-visible';
  input.placeholder = options.placeholder ?? 'Type something peculiar...';
  input.setAttribute('aria-label', options.ariaLabel ?? 'Typewriter input');
  inputContainer.appendChild(input);

  container.appendChild(inputContainer);

  const config = {
    jitterStrength: options.jitterStrength ?? 3,
    maxWobbleRotation: options.maxWobbleRotation ?? 12,
  };
  const onChange = options.onChange;
  let lastValue = '';
  let reducedMotion = prefersReducedMotion();

  function renderProjections(text) {
    projectionBoard.replaceChildren();

    for (let i = 0; i < text.length; i++) {
      const char = text[i] === ' ' ? ' ' : text[i];
      const charSpan = document.createElement('span');
      charSpan.className = 'winky-projected-char';
      charSpan.textContent = char;

      if (!reducedMotion) {
        const randRot = (Math.random() - 0.5) * config.maxWobbleRotation;
        const randY = (Math.random() - 0.5) * 6;
        charSpan.style.setProperty('--rand-rot', `${randRot}deg`);
        charSpan.style.transform = `translateY(${randY}px) rotate(${randRot}deg)`;
      }

      projectionBoard.appendChild(charSpan);
    }
  }

  input.addEventListener('input', () => {
    const text = input.value;

    if (text.length > lastValue.length) {
      AudioSynth.playClack();
    } else if (text.length < lastValue.length) {
      AudioSynth.playTick();
    }

    if (!reducedMotion) {
      input.classList.remove('winky-jittering');
      void input.offsetWidth;

      const rx = (Math.random() - 0.5) * config.jitterStrength;
      const ry = (Math.random() - 0.5) * config.jitterStrength;
      const rot = (Math.random() - 0.5) * (config.jitterStrength * 0.5);
      input.style.transform = `translate(${rx}px, ${ry}px) rotate(${rot}deg)`;

      setTimeout(() => {
        input.style.transform = 'none';
      }, 100);
    }

    renderProjections(text);
    lastValue = text;

    if (onChange) {
      onChange(text);
    }
  });

  input.addEventListener('focus', () => {
    AudioSynth.playTick();
  });

  const motionListener = onReducedMotionChange(() => {
    reducedMotion = prefersReducedMotion();
    if (reducedMotion) {
      input.style.transform = 'none';
      input.classList.remove('winky-jittering');
    }
  });

  function destroy() {
    motionListener();
  }

  function getValue() {
    return input.value;
  }

  function setValue(v) {
    const text = String(v ?? '');
    input.value = text;
    lastValue = text;
    renderProjections(text);
  }

  return { el: container, getValue, setValue, destroy, config };
}
