import { AudioSynth } from './audioSynth.js';
import { setAria, prefersReducedMotion, onReducedMotionChange } from './utils.js';

/**
 * @typedef {Object} ElasticDragListOptions
 * @property {{label: string}[]} [items] - Initial list items.
 * @property {string} [ariaLabel='Reorderable list'] - Accessible name for the list.
 * @property {(order: string[]) => void} [onChange] - Called with the new
 *   item-label order after a reorder (drag/drop or Alt+Arrow).
 */

/**
 * @typedef {Object} ElasticDragListInstance
 * @property {HTMLElement} el - Root element; append this to the DOM.
 * @property {() => void} destroy - Removes listeners.
 */

/**
 * Creates a reorderable list with drag-and-drop and Alt+Arrow keyboard
 * reordering, with elastic visual feedback on drag-over.
 * @param {ElasticDragListOptions} [options]
 * @returns {ElasticDragListInstance}
 */
export function createElasticDragList(options = {}) {
  const container = document.createElement('div');
  container.className = 'winky-elastic-list-container';

  const itemsData = options.items ?? [
    { label: 'Wind-up Bird' },
    { label: 'Taxidermy Fox' },
    { label: 'Brass Compass' },
    { label: 'Velvet Hat' },
    { label: 'Crystal Lens' }
  ];

  let reducedMotion = prefersReducedMotion();
  const onChange = options.onChange;
  const ariaLabel = options.ariaLabel ?? 'Reorderable list';
  let items = [...itemsData];
  let dragIndex = -1;
  let dragOverIndex = -1;

  const list = document.createElement('ul');
  list.className = 'winky-elastic-list';
  list.setAttribute('role', 'listbox');
  list.setAttribute('aria-label', ariaLabel);
  container.appendChild(list);

  const itemElements = [];

  function render() {
    list.replaceChildren();
    itemElements.length = 0;

    items.forEach((data, index) => {
      const li = document.createElement('li');
      li.className = 'winky-elastic-list-item winky-focus-visible';
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', 'false');
      li.tabIndex = 0;
      li.draggable = true;
      li.dataset.index = String(index);

      const handle = document.createElement('span');
      handle.className = 'winky-elastic-list-handle';
      handle.setAttribute('aria-hidden', 'true');
      handle.textContent = '≡';
      li.appendChild(handle);

      const label = document.createElement('span');
      label.className = 'winky-elastic-list-label';
      label.textContent = data.label;
      li.appendChild(label);

      if (index === dragOverIndex && !reducedMotion) {
        li.classList.add('winky-drag-over');
      }

      list.appendChild(li);
      itemElements.push(li);

      li.addEventListener('dragstart', (e) => {
        dragIndex = index;
        li.classList.add('winky-dragging');
        e.dataTransfer.effectAllowed = 'move';
        if (!reducedMotion) AudioSynth.playTick();
      });

      li.addEventListener('dragend', () => {
        li.classList.remove('winky-dragging');
        itemElements.forEach(el => el.classList.remove('winky-drag-over'));
        dragIndex = -1;
        dragOverIndex = -1;
      });

      li.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (index === dragIndex) return;
        dragOverIndex = index;
        itemElements.forEach((el, i) => {
          el.classList.toggle('winky-drag-over', i === dragOverIndex && !reducedMotion);
        });
      });

      li.addEventListener('drop', (e) => {
        e.preventDefault();
        if (dragIndex === -1 || dragIndex === index) return;

        const [moved] = items.splice(dragIndex, 1);
        items.splice(index, 0, moved);

        AudioSynth.playClack();
        render();

        if (onChange) onChange(items.map(i => i.label));
      });

      li.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp' && e.altKey) {
          e.preventDefault();
          if (index > 0) {
            [items[index], items[index - 1]] = [items[index - 1], items[index]];
            AudioSynth.playClack();
            render();
            itemElements[index - 1]?.focus();
            if (onChange) onChange(items.map(i => i.label));
          }
        } else if (e.key === 'ArrowDown' && e.altKey) {
          e.preventDefault();
          if (index < items.length - 1) {
            [items[index], items[index + 1]] = [items[index + 1], items[index]];
            AudioSynth.playClack();
            render();
            itemElements[index + 1]?.focus();
            if (onChange) onChange(items.map(i => i.label));
          }
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          const next = Math.min(items.length - 1, index + 1);
          itemElements[next]?.focus();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          const prev = Math.max(0, index - 1);
          itemElements[prev]?.focus();
        }
      });
    });
  }

  render();

  const motionListener = onReducedMotionChange(() => {
    reducedMotion = prefersReducedMotion();
  });

  function destroy() {
    motionListener();
  }

  return { el: container, destroy };
}
