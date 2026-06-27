import { AudioSynth } from './audioSynth.js';
import { prefersReducedMotion, onReducedMotionChange } from './utils.js';

export function createSuspiciousEyes(options = {}) {
  const container = document.createElement('div');
  container.className = 'suspicious-input-wrapper';

  const eyesBox = document.createElement('div');
  eyesBox.className = 'eyes-container';
  eyesBox.setAttribute('role', 'presentation');
  eyesBox.setAttribute('aria-hidden', 'true');

  const leftEye = document.createElement('div');
  leftEye.className = 'wonky-eye';
  const leftPupil = document.createElement('div');
  leftPupil.className = 'wonky-pupil';
  leftEye.appendChild(leftPupil);
  eyesBox.appendChild(leftEye);

  const rightEye = document.createElement('div');
  rightEye.className = 'wonky-eye';
  const rightPupil = document.createElement('div');
  rightPupil.className = 'wonky-pupil';
  rightEye.appendChild(rightPupil);
  eyesBox.appendChild(rightEye);

  container.appendChild(eyesBox);

  const inputRow = document.createElement('div');
  inputRow.className = 'password-input-row';

  const input = document.createElement('input');
  input.type = 'password';
  input.className = 'quill-input winky-focus-visible';
  input.placeholder = 'Enter secret passcode...';
  input.setAttribute('aria-label', 'Secret passcode');
  inputRow.appendChild(input);

  const revealBtn = document.createElement('button');
  revealBtn.className = 'reveal-btn winky-focus-visible';
  revealBtn.textContent = '\u{1F441}';
  revealBtn.setAttribute('aria-label', 'Reveal passcode');
  revealBtn.setAttribute('aria-pressed', 'false');
  inputRow.appendChild(revealBtn);

  container.appendChild(inputRow);

  let trackingSensitivity = options.trackingSensitivity ?? 7;
  let shockDuration = options.shockDuration ?? 1500;
  let isFocused = false;
  let caretX = 0;
  let caretY = 0;
  let reducedMotion = prefersReducedMotion();

  function lookAt(targetX, targetY) {
    [
      { eye: leftEye, pupil: leftPupil },
      { eye: rightEye, pupil: rightPupil }
    ].forEach(({ eye, pupil }) => {
      const rect = eye.getBoundingClientRect();
      const eyeCenterX = rect.left + rect.width / 2;
      const eyeCenterY = rect.top + rect.height / 2;

      const dx = targetX - eyeCenterX;
      const dy = targetY - eyeCenterY;
      const dist = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);

      const travel = Math.min(trackingSensitivity, dist * 0.05);
      const px = Math.cos(angle) * travel;
      const py = Math.sin(angle) * travel;

      pupil.style.transform = `translate(${px}px, ${py}px)`;
    });
  }

  const onMouseMove = (e) => {
    if (isFocused || reducedMotion) return;
    lookAt(e.clientX, e.clientY);
  };
  window.addEventListener('pointermove', onMouseMove);

  function updateCaretCoordinates() {
    const inputRect = input.getBoundingClientRect();
    const textLength = input.value.length;
    const maxChars = 20;
    const progress = Math.min(1, textLength / maxChars);

    const textOffset = inputRect.width * 0.15 + (inputRect.width * 0.7 * progress);

    caretX = inputRect.left + textOffset;
    caretY = inputRect.top + inputRect.height / 2;

    lookAt(caretX, caretY);
  }

  input.addEventListener('focus', () => {
    isFocused = true;
    updateCaretCoordinates();
  });

  input.addEventListener('blur', () => {
    isFocused = false;
  });

  input.addEventListener('input', () => {
    if (isFocused) updateCaretCoordinates();
  });

  revealBtn.addEventListener('click', () => {
    AudioSynth.playTick();

    const isShowing = input.type === 'text';
    input.type = isShowing ? 'password' : 'text';
    revealBtn.textContent = isShowing ? '\u{1F441}' : '\u{1F648}';
    revealBtn.setAttribute('aria-pressed', String(isShowing));

    if (!reducedMotion) {
      leftEye.classList.add('shocked');
      rightEye.classList.add('shocked');

      setTimeout(() => {
        leftEye.classList.remove('shocked');
        rightEye.classList.remove('shocked');
      }, shockDuration);
    }
  });

  const motionListener = onReducedMotionChange(() => {
    reducedMotion = prefersReducedMotion();
    if (reducedMotion) {
      leftPupil.style.transform = 'none';
      rightPupil.style.transform = 'none';
    }
  });

  container.destroy = () => {
    window.removeEventListener('pointermove', onMouseMove);
    motionListener();
  };

  container.getControls = () => {
    return [
      { label: 'Eye Sensitivity', type: 'range', min: 4, max: 12, step: 1, value: trackingSensitivity, onChange: (v) => { trackingSensitivity = parseInt(v); } },
      { label: 'Shock Time (ms)', type: 'range', min: 500, max: 3000, step: 250, value: shockDuration, onChange: (v) => { shockDuration = parseInt(v); } }
    ];
  };

  container.getCodeSnippet = () => {
    return `import { createSuspiciousEyes } from 'winky-wonky';

const passwordInput = createSuspiciousEyes({
  trackingSensitivity: 8,
  shockDuration: 2000
});
document.body.appendChild(passwordInput);`;
  };

  return container;
}
