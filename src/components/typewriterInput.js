import { AudioSynth } from './audioSynth.js';
import { setAria, prefersReducedMotion, onReducedMotionChange } from './utils.js';

export function createTypewriterInput(options = {}) {
  const container = document.createElement('div');
  container.className = 'typewriter-wrapper';

  const projectionBoard = document.createElement('div');
  projectionBoard.className = 'projection-board';
  projectionBoard.setAttribute('aria-hidden', 'true');
  container.appendChild(projectionBoard);

  const inputContainer = document.createElement('div');
  inputContainer.className = 'quill-input-container';

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'quill-input winky-focus-visible';
  input.placeholder = options.placeholder ?? 'Type something peculiar...';
  input.setAttribute('aria-label', options.ariaLabel ?? 'Typewriter input');
  inputContainer.appendChild(input);

  container.appendChild(inputContainer);

  let jitterStrength = options.jitterStrength ?? 3;
  let maxWobbleRotation = options.maxWobbleRotation ?? 12;
  const onChange = options.onChange;
  let lastValue = '';
  let reducedMotion = prefersReducedMotion();

  function renderProjections(text) {
    projectionBoard.replaceChildren();

    for (let i = 0; i < text.length; i++) {
      const char = text[i] === ' ' ? '\u00A0' : text[i];
      const charSpan = document.createElement('span');
      charSpan.className = 'projected-char';
      charSpan.textContent = char;

      if (!reducedMotion) {
        const randRot = (Math.random() - 0.5) * maxWobbleRotation;
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
      input.classList.remove('jittering');
      void input.offsetWidth;

      const rx = (Math.random() - 0.5) * jitterStrength;
      const ry = (Math.random() - 0.5) * jitterStrength;
      const rot = (Math.random() - 0.5) * (jitterStrength * 0.5);
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
      input.classList.remove('jittering');
    }
  });

  container.destroy = () => {
    motionListener();
  };

  container.getControls = () => {
    return [
      { label: 'Type Shake (px)', type: 'range', min: 0, max: 8, step: 1, value: jitterStrength, onChange: (v) => { jitterStrength = parseInt(v); } },
      { label: 'Letter Wobble (\u00B0)', type: 'range', min: 2, max: 25, step: 1, value: maxWobbleRotation, onChange: (v) => { maxWobbleRotation = parseInt(v); } }
    ];
  };

  container.getCodeSnippet = () => {
    return `import { createTypewriterInput } from 'winky-wonky';

const input = createTypewriterInput({
  placeholder: 'Speak to the spirits...',
  jitterStrength: 4,
  maxWobbleRotation: 15,
  onChange: (value) => console.log('Current input: ', value)
});
document.body.appendChild(input);`;
  };

  return container;
}
