import { AudioSynth } from './audioSynth.js';
import { setAria, prefersReducedMotion, onReducedMotionChange } from './utils.js';

export function createElasticDragList(options = {}) {
  const container = document.createElement('div');
  container.className = 'elastic-list-container';

  const itemsData = options.items ?? [
    { label: 'Wind-up Bird' },
    { label: 'Taxidermy Fox' },
    { label: 'Brass Compass' },
    { label: 'Velvet Hat' },
    { label: 'Crystal Lens' }
  ];

  let reducedMotion = prefersReducedMotion();
  const onChange = options.onChange;
  let items = [...itemsData];
  let dragIndex = -1;
  let dragOverIndex = -1;

  const list = document.createElement('ul');
  list.className = 'elastic-list';
  list.setAttribute('role', 'listbox');
  list.setAttribute('aria-label', 'Reorderable list');
  container.appendChild(list);

  const itemElements = [];

  function render() {
    list.replaceChildren();
    itemElements.length = 0;

    items.forEach((data, index) => {
      const li = document.createElement('li');
      li.className = 'elastic-list-item winky-focus-visible';
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', 'false');
      li.tabIndex = 0;
      li.draggable = true;
      li.dataset.index = index;

      const handle = document.createElement('span');
      handle.className = 'elastic-list-handle';
      handle.setAttribute('aria-hidden', 'true');
      handle.textContent = '\u2261';
      li.appendChild(handle);

      const label = document.createElement('span');
      label.className = 'elastic-list-label';
      label.textContent = data.label;
      li.appendChild(label);

      if (index === dragOverIndex && !reducedMotion) {
        li.classList.add('drag-over');
      }

      list.appendChild(li);
      itemElements.push(li);

      li.addEventListener('dragstart', (e) => {
        dragIndex = index;
        li.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        if (!reducedMotion) AudioSynth.playTick();
      });

      li.addEventListener('dragend', () => {
        li.classList.remove('dragging');
        itemElements.forEach(el => el.classList.remove('drag-over'));
        dragIndex = -1;
        dragOverIndex = -1;
      });

      li.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (index === dragIndex) return;
        dragOverIndex = index;
        itemElements.forEach((el, i) => {
          el.classList.toggle('drag-over', i === dragOverIndex && !reducedMotion);
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

  container.destroy = () => {
    motionListener();
  };

  container.getControls = () => {
    return [];
  };

  container.getCodeSnippet = () => {
    return `import { createElasticDragList } from 'winky-wonky';

const list = createElasticDragList({
  items: [
    { label: 'Item 1' },
    { label: 'Item 2' },
    { label: 'Item 3' },
  ],
  onChange: (order) => console.log('New order:', order)
});
document.body.appendChild(list);`;
  };

  return container;
}
