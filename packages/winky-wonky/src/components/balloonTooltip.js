import { AudioSynth } from './audioSynth.js';
import { setAria, prefersReducedMotion, onReducedMotionChange } from './utils.js';

/**
 * @typedef {Object} BalloonTooltipOptions
 * @property {HTMLElement} [triggerNode] - Existing element to use as the
 *   hover/focus trigger. When omitted, a default button is created.
 * @property {string} [text='Curiosity Box!'] - Tooltip body text.
 * @property {number} [stringLength=25] - Length in px of the balloon's
 *   string, which also controls the tooltip's vertical offset.
 */

/**
 * @typedef {Object} BalloonTooltipInstance
 * @property {HTMLElement} el - Root element (trigger + tooltip); append this to the DOM.
 * @property {() => void} destroy - Removes the reduced-motion listener.
 * @property {{stringLength: number, text: string}} config - Live-mutable
 *   secondary knobs; prefer `setOptions` for changes that need re-rendering.
 * @property {(partial: {stringLength?: number, text?: string}) => void} setOptions -
 *   Updates the string length and/or text, re-rendering as needed.
 */

/**
 * Creates a hover/focus tooltip styled as a balloon on a string.
 * @param {BalloonTooltipOptions} [options]
 * @returns {BalloonTooltipInstance}
 */
export function createBalloonTooltip(options = {}) {
  const container = document.createElement('div');
  container.className = 'winky-tooltip-target-wrapper';

  const trigger = options.triggerNode ?? document.createElement('button');
  if (!options.triggerNode) {
    trigger.className = 'winky-mischievous-btn winky-focus-visible';
    trigger.style.boxShadow = 'none';
    trigger.textContent = 'Hover Over Me';
  }
  trigger.classList.add('winky-focus-visible');
  container.appendChild(trigger);

  const tooltip = document.createElement('div');
  tooltip.className = 'winky-balloon-tooltip';
  tooltip.setAttribute('role', 'tooltip');

  const body = document.createElement('div');
  body.className = 'winky-balloon-body';
  body.textContent = options.text ?? 'Curiosity Box!';
  tooltip.appendChild(body);

  const stringSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  stringSvg.setAttribute('class', 'winky-balloon-string-svg');
  stringSvg.setAttribute('aria-hidden', 'true');

  const stringPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  stringPath.setAttribute('class', 'winky-balloon-string-path');
  stringSvg.appendChild(stringPath);
  tooltip.appendChild(stringSvg);

  container.appendChild(tooltip);

  setAria(trigger, {
    'describedby': undefined,
  });
  tooltip.id = `winky-tooltip-${Math.random().toString(36).slice(2, 9)}`;
  trigger.setAttribute('aria-describedby', tooltip.id);

  const config = {
    stringLength: options.stringLength ?? 25,
    text: options.text ?? 'Curiosity Box!',
  };
  let reducedMotion = prefersReducedMotion();

  function updateString() {
    stringSvg.setAttribute('height', `${config.stringLength}`);
    const half = config.stringLength / 2;
    stringPath.setAttribute('d', `M 10 0 Q 3 ${half / 2} 10 ${half} T 10 ${config.stringLength}`);
    tooltip.style.bottom = `calc(100% + ${config.stringLength - 5}px)`;
  }

  function showTooltip() {
    tooltip.style.transform = 'translate(-50%, 0) scale(1)';
    tooltip.style.opacity = '1';
    AudioSynth.playClack();
  }

  function hideTooltip() {
    tooltip.style.transform = 'translate(-50%, 15px) scale(0)';
    tooltip.style.opacity = '0';
  }

  trigger.addEventListener('pointerenter', showTooltip);
  trigger.addEventListener('pointerleave', hideTooltip);
  trigger.addEventListener('focus', showTooltip);
  trigger.addEventListener('blur', hideTooltip);

  const motionListener = onReducedMotionChange(() => {
    reducedMotion = prefersReducedMotion();
  });

  updateString();

  function destroy() {
    motionListener();
  }

  function setOptions(partial = {}) {
    if (partial.stringLength != null) {
      config.stringLength = partial.stringLength;
      updateString();
    }
    if (partial.text != null) {
      config.text = partial.text;
      body.textContent = partial.text;
    }
  }

  return { el: container, destroy, config, setOptions };
}
