import { AudioSynth } from './audioSynth.js';
import { setAria, prefersReducedMotion, onReducedMotionChange } from './utils.js';

/**
 * @typedef {Object} GravityToastOptions
 * @property {string} [buttonText='Show Toast'] - Trigger button label.
 * @property {string} [defaultMessage='Something happened'] - Fallback toast message.
 * @property {string[]} [messages] - Messages cycled through on each trigger click.
 * @property {number} [maxVisible=3] - Max toasts shown at once (oldest evicted).
 * @property {number} [duration=3000] - Auto-dismiss delay in ms.
 * @property {string} [dismissAriaLabel='Dismiss notification'] - Accessible name for each toast's close button.
 */

/**
 * @typedef {Object} GravityToastInstance
 * @property {HTMLElement} el - Root element; append this to the DOM.
 * @property {() => void} destroy - Clears pending dismiss timers and listeners.
 * @property {{duration: number, maxVisible: number}} config - Live-mutable
 *   secondary knobs (used by the playground's tuning panel).
 */

/**
 * Creates a toast-notification trigger. Toasts drop in with a gravity
 * settle, auto-dismiss after `duration`, and can be closed manually.
 * @param {GravityToastOptions} [options]
 * @returns {GravityToastInstance}
 */
export function createGravityToast(options = {}) {
  const container = document.createElement('div');
  container.className = 'winky-gravity-toast-container';

  const triggerBtn = document.createElement('button');
  triggerBtn.className = 'winky-gravity-toast-trigger winky-focus-visible';
  triggerBtn.textContent = options.buttonText ?? 'Show Toast';
  container.appendChild(triggerBtn);

  // Fixed-position so the toast stack's growing/shrinking height never
  // reflows the trigger button (or anything else in normal document flow).
  const toastStack = document.createElement('div');
  toastStack.className = 'winky-gravity-toast-stack';
  container.appendChild(toastStack);

  let toastCounter = 0;
  const config = {
    maxVisible: options.maxVisible ?? 3,
    duration: options.duration ?? 3000,
  };
  let reducedMotion = prefersReducedMotion();
  const dismissAriaLabel = options.dismissAriaLabel ?? 'Dismiss notification';

  const activeToasts = [];
  // DOM nodes shouldn't carry private state as expando properties — track
  // each toast's pending auto-dismiss timer here instead of `toast._timer`.
  const toastTimers = new WeakMap();

  function showToast(message) {
    while (activeToasts.length >= config.maxVisible) {
      const oldest = activeToasts.shift();
      if (oldest) removeToast(oldest);
    }

    const toast = document.createElement('div');
    toast.className = 'winky-gravity-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');

    const msg = document.createElement('span');
    msg.className = 'winky-gravity-toast-message';
    msg.textContent = message ?? options.defaultMessage ?? 'Something happened';
    toast.appendChild(msg);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'winky-gravity-toast-close winky-focus-visible';
    closeBtn.setAttribute('aria-label', dismissAriaLabel);
    closeBtn.textContent = '×';
    toast.appendChild(closeBtn);

    activeToasts.push(toast);

    if (reducedMotion) {
      toast.classList.add('winky-settled');
    } else {
      toast.classList.add('winky-dropping');
      setTimeout(() => {
        toast.classList.remove('winky-dropping');
        toast.classList.add('winky-settled');
        AudioSynth.playTick();
      }, 50);
    }

    closeBtn.addEventListener('click', () => removeToast(toast));

    toastStack.appendChild(toast);

    const timer = setTimeout(() => removeToast(toast), config.duration);
    toastTimers.set(toast, timer);
  }

  function removeToast(toast) {
    if (!toast.parentNode) return;
    const timer = toastTimers.get(toast);
    if (timer) clearTimeout(timer);
    toastTimers.delete(toast);

    const idx = activeToasts.indexOf(toast);
    if (idx !== -1) activeToasts.splice(idx, 1);

    if (reducedMotion) {
      toast.remove();
    } else {
      toast.classList.add('winky-leaving');
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

  function destroy() {
    activeToasts.forEach((t) => {
      const timer = toastTimers.get(t);
      if (timer) clearTimeout(timer);
      toastTimers.delete(t);
    });
    motionListener();
  }

  return { el: container, destroy, config };
}
