import { AudioSynth } from './audioSynth.js';
import { setAria, prefersReducedMotion, onReducedMotionChange } from './utils.js';

export function createGravityToast(options = {}) {
  const container = document.createElement('div');
  container.className = 'gravity-toast-container';

  const triggerBtn = document.createElement('button');
  triggerBtn.className = 'gravity-toast-trigger winky-focus-visible';
  triggerBtn.textContent = options.buttonText ?? 'Show Toast';
  container.appendChild(triggerBtn);

  let toastCounter = 0;
  let maxVisible = options.maxVisible ?? 3;
  let duration = options.duration ?? 3000;
  let reducedMotion = prefersReducedMotion();

  const activeToasts = [];

  function showToast(message) {
    while (activeToasts.length >= maxVisible) {
      const oldest = activeToasts.shift();
      if (oldest)       removeToast(oldest);
    }

    const toast = document.createElement('div');
    toast.className = 'gravity-toast';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');

    const msg = document.createElement('span');
    msg.className = 'gravity-toast-message';
    msg.textContent = message ?? options.defaultMessage ?? 'Something happened';
    toast.appendChild(msg);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'gravity-toast-close winky-focus-visible';
    closeBtn.setAttribute('aria-label', 'Dismiss notification');
    closeBtn.textContent = '\u00D7';
    toast.appendChild(closeBtn);

    activeToasts.push(toast);

    if (reducedMotion) {
      toast.classList.add('settled');
    } else {
      toast.classList.add('dropping');
      setTimeout(() => {
        toast.classList.remove('dropping');
        toast.classList.add('settled');
        AudioSynth.playTick();
      }, 50);
    }

    closeBtn.addEventListener('click', () => removeToast(toast));

    container.appendChild(toast);

    const timer = setTimeout(() => removeToast(toast), duration);
    toast._timer = timer;
  }

  function removeToast(toast) {
    if (!toast.parentNode) return;
    if (toast._timer) clearTimeout(toast._timer);

    const idx = activeToasts.indexOf(toast);
    if (idx !== -1) activeToasts.splice(idx, 1);

    if (reducedMotion) {
      toast.remove();
    } else {
      toast.classList.add('leaving');
      setTimeout(() => toast.remove(), 300);
    }
  }

  triggerBtn.addEventListener('click', () => {
    AudioSynth.playClack();
    const messages = options.messages ?? [
      'File uploaded successfully',
      'Settings saved',
      'Connection established',
      'Sync complete',
    ];
    showToast(messages[toastCounter % messages.length]);
    toastCounter++;
  });

  const motionListener = onReducedMotionChange(() => {
    reducedMotion = prefersReducedMotion();
  });

  container.destroy = () => {
    activeToasts.forEach(t => { if (t._timer) clearTimeout(t._timer); });
    motionListener();
  };

  container.getControls = () => {
    return [
      { label: 'Duration (ms)', type: 'range', min: 1000, max: 6000, step: 500, value: duration, onChange: (v) => { duration = parseInt(v); } },
      { label: 'Max Visible', type: 'range', min: 1, max: 5, step: 1, value: maxVisible, onChange: (v) => { maxVisible = parseInt(v); } }
    ];
  };

  container.getCodeSnippet = () => {
    return `import { createGravityToast } from 'winky-wonky';

const toaster = createGravityToast({
  buttonText: 'Notify',
  duration: 3000,
  messages: ['Saved!', 'Synced!', 'Done!']
});
document.body.appendChild(toaster);`;
  };

  return container;
}
