import { AudioSynth } from './audioSynth.js';
import { setAria, prefersReducedMotion, onReducedMotionChange } from './utils.js';

/**
 * @typedef {Object} WobblyRadioGroupOptions
 * @property {string[]} [items] - Radio option labels.
 * @property {number} [initialIndex=0] - Initially-selected item index.
 * @property {string} [ariaLabel='Selection'] - Accessible name for the group.
 * @property {(selected: string) => void} [onChange] - Called with the
 *   selected item's label whenever it changes from user interaction.
 */

/**
 * @typedef {Object} WobblyRadioGroupInstance
 * @property {HTMLElement} el - Root element; append this to the DOM.
 * @property {() => string} getValue - Currently-selected item label.
 * @property {(value: string|number) => void} setValue - Selects by label or
 *   index. Updates DOM/ARIA; does NOT invoke `onChange`.
 * @property {(partial: {items?: string[]}) => void} setOptions - Rebuilds
 *   the radio list for a new set of items.
 * @property {() => string[]} getItems - Returns a copy of the current item labels.
 * @property {() => void} destroy
 */

/**
 * Creates a segmented radio group with a spring-animated selection indicator.
 * @param {WobblyRadioGroupOptions} [options]
 * @returns {WobblyRadioGroupInstance}
 */
export function createWobblyRadioGroup(options = {}) {
  const container = document.createElement('div');
  container.className = 'winky-wobbly-radio-group';

  const items = options.items ?? ['Marginalia', 'Specimen', 'Curiosity', 'Peculiarity'];
  let selectedIndex = options.initialIndex ?? 0;
  const onChange = options.onChange;
  const ariaLabel = options.ariaLabel ?? 'Selection';
  let reducedMotion = prefersReducedMotion();

  container.setAttribute('role', 'radiogroup');
  container.setAttribute('aria-label', ariaLabel);

  const radios = [];
  const indicator = document.createElement('div');
  indicator.className = 'winky-wobbly-radio-indicator';
  indicator.setAttribute('aria-hidden', 'true');
  container.appendChild(indicator);

  function addRadio(label, index) {
    const radio = document.createElement('div');
    radio.className = 'winky-wobbly-radio-item winky-focus-visible';
    radio.setAttribute('role', 'radio');
    radio.setAttribute('aria-checked', index === selectedIndex ? 'true' : 'false');
    radio.setAttribute('tabindex', index === selectedIndex ? '0' : '-1');
    radio.textContent = label;
    container.appendChild(radio);
    radios.push(radio);

    radio.addEventListener('click', () => selectIndex(index));

    radio.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const next = (index + 1) % radios.length;
        selectIndex(next);
        radios[next].focus();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = (index - 1 + radios.length) % radios.length;
        selectIndex(prev);
        radios[prev].focus();
      } else if (e.key === 'Home') {
        e.preventDefault();
        selectIndex(0);
        radios[0].focus();
      } else if (e.key === 'End') {
        e.preventDefault();
        selectIndex(radios.length - 1);
        radios[radios.length - 1].focus();
      }
    });
  }

  items.forEach(addRadio);

  function moveIndicator() {
    if (selectedIndex < 0 || !radios[selectedIndex]) return;
    const rect = radios[selectedIndex].getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const left = rect.left - containerRect.left;
    const width = rect.width;
    indicator.style.transform = `translateX(${left}px)`;
    indicator.style.width = `${width}px`;
  }

  // silent=true suppresses the tick sound and onChange, used by setValue()
  // so programmatic selection never fires the callback.
  function selectIndex(index, silent = false) {
    if (index === selectedIndex) return;
    selectedIndex = index;
    if (!silent) AudioSynth.playTick();

    radios.forEach((r, i) => {
      r.setAttribute('aria-checked', i === selectedIndex ? 'true' : 'false');
      r.setAttribute('tabindex', i === selectedIndex ? '0' : '-1');
      r.classList.toggle('winky-selected', i === selectedIndex);
    });

    moveIndicator();
    if (!silent && onChange) onChange(items[selectedIndex]);
  }

  requestAnimationFrame(() => {
    radios[selectedIndex]?.classList.add('winky-selected');
    moveIndicator();
  });

  const motionListener = onReducedMotionChange(() => {
    reducedMotion = prefersReducedMotion();
    moveIndicator();
  });

  function destroy() {
    motionListener();
  }

  function getValue() {
    return items[selectedIndex];
  }

  function getItems() {
    return items.slice();
  }

  function setValue(v) {
    let index = items.indexOf(v);
    if (index === -1 && typeof v === 'number' && v >= 0 && v < items.length) index = v;
    if (index === -1) return;
    selectIndex(index, true);
  }

  function setOptions(partial = {}) {
    if (!partial.items || partial.items.length === 0) return;
    items.splice(0, items.length, ...partial.items);
    radios.forEach(r => r.remove());
    radios.length = 0;
    items.forEach(addRadio);
    selectedIndex = Math.min(selectedIndex, items.length - 1);
    radios[selectedIndex]?.classList.add('winky-selected');
    moveIndicator();
  }

  return { el: container, getValue, setValue, setOptions, getItems, destroy };
}
