import { AudioSynth } from './audioSynth.js';
import { setAria, prefersReducedMotion, onReducedMotionChange } from './utils.js';

export function createSlimeProgress(options = {}) {
  const container = document.createElement('div');
  container.className = 'slime-progress-container';

  const track = document.createElement('div');
  track.className = 'slime-track';
  track.setAttribute('role', 'progressbar');

  const fill = document.createElement('div');
  fill.className = 'slime-fill';
  fill.setAttribute('aria-hidden', 'true');
  track.appendChild(fill);

  const dripsContainer = document.createElement('div');
  dripsContainer.className = 'slime-drips-container';
  dripsContainer.setAttribute('aria-hidden', 'true');
  track.appendChild(dripsContainer);

  container.appendChild(track);

  const btnRow = document.createElement('div');
  btnRow.style.display = 'flex';
  btnRow.style.gap = '0.5rem';

  const fillBtn = document.createElement('button');
  fillBtn.className = 'slime-btn winky-focus-visible';
  fillBtn.textContent = 'Refill';
  btnRow.appendChild(fillBtn);

  const meltBtn = document.createElement('button');
  meltBtn.className = 'slime-btn winky-focus-visible';
  meltBtn.textContent = 'Melt Progress';
  meltBtn.style.backgroundColor = 'var(--winky-accent-teal)';
  meltBtn.style.color = '#fff';
  btnRow.appendChild(meltBtn);

  container.appendChild(btnRow);

  let progress = options.initialProgress ?? 35;
  let meltDuration = options.meltDuration ?? 1.5;
  const onMeltComplete = options.onMeltComplete;
  let reducedMotion = prefersReducedMotion();

  setAria(track, {
    'valuemin': '0',
    'valuemax': '100',
    'valuenow': String(Math.round(progress)),
    'valuetext': `${Math.round(progress)}%`,
    'label': 'Slime progress bar',
  });

  function setProgress(pct) {
    progress = Math.max(0, Math.min(100, pct));
    fill.style.width = `${progress}%`;
    track.setAttribute('aria-valuenow', String(Math.round(progress)));
    track.setAttribute('aria-valuetext', `${Math.round(progress)}%`);
  }

  function triggerMelt() {
    if (progress <= 5) return;
    if (reducedMotion) {
      setProgress(0);
      if (onMeltComplete) onMeltComplete(0);
      return;
    }

    dripsContainer.replaceChildren();

    const dripCount = Math.floor(Math.random() * 3) + 3;
    const filledWidthPx = (progress / 100) * 260;

    let completedDrips = 0;

    for (let i = 0; i < dripCount; i++) {
      const leftOffset = Math.random() * (filledWidthPx - 15) + 5;

      const drip = document.createElement('div');
      drip.className = 'slime-drip';
      drip.style.left = `${leftOffset}px`;
      drip.style.animationDuration = `${meltDuration}s`;

      const w = Math.random() * 6 + 6;
      drip.style.width = `${w}px`;

      dripsContainer.appendChild(drip);

      setTimeout(() => {
        drip.classList.add('dripping');
        AudioSynth.playTick();
      }, i * 220);

      drip.addEventListener('animationend', () => {
        completedDrips++;
        if (completedDrips === dripCount && onMeltComplete) {
          onMeltComplete(progress);
        }
      });
    }
  }

  fillBtn.addEventListener('click', () => {
    AudioSynth.playClack();
    setProgress(0);
    setTimeout(() => {
      setProgress(Math.floor(Math.random() * 50) + 40);
    }, 150);
  });

  meltBtn.addEventListener('click', () => {
    AudioSynth.playClack();
    triggerMelt();
  });

  const motionListener = onReducedMotionChange(() => {
    reducedMotion = prefersReducedMotion();
  });

  setProgress(progress);

  container.destroy = () => {
    motionListener();
  };

  container.getControls = () => {
    return [
      { label: 'Viscosity (s)', type: 'range', min: 0.8, max: 2.5, step: 0.1, value: meltDuration, onChange: (v) => { meltDuration = parseFloat(v); } },
      { label: 'Current Fill %', type: 'range', min: 10, max: 100, step: 5, value: progress, onChange: (v) => { setProgress(parseInt(v)); } }
    ];
  };

  container.getCodeSnippet = () => {
    return `import { createSlimeProgress } from 'winky-wonky';

const loader = createSlimeProgress({
  initialProgress: 60,
  meltDuration: 1.2,
  onMeltComplete: (pct) => console.log('Slime melt finished on value: ', pct)
});
document.body.appendChild(loader);`;
  };

  return container;
}
