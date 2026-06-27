import { AudioSynth } from './audioSynth.js';
import { setAria, makeFocusable } from './utils.js';

export function createHingeDropdown(options = {}) {
  const container = document.createElement('div');
  container.className = 'hinge-dropdown-container';

  const trigger = document.createElement('button');
  trigger.className = 'dropdown-trigger winky-focus-visible';

  const labelSpan = document.createElement('span');
  labelSpan.textContent = options.label ?? 'Select Curiosity';
  trigger.appendChild(labelSpan);

  const caret = document.createElement('span');
  caret.setAttribute('aria-hidden', 'true');
  caret.textContent = '\u25BC';
  trigger.appendChild(caret);

  container.appendChild(trigger);

  const menu = document.createElement('ul');
  menu.className = 'dropdown-menu';
  menu.setAttribute('role', 'listbox');

  const menuOptions = options.options ?? ['Clockwork Key', 'Stitched Hat', 'Taxidermy Crow', 'Muted Pastel Brush'];
  const onSelect = options.onSelect;

  const optionItems = [];

  menuOptions.forEach((optText, idx) => {
    const item = document.createElement('li');
    item.className = 'dropdown-item winky-focus-visible';
    item.setAttribute('role', 'option');
    item.textContent = optText;
    item.tabIndex = -1;
    item.dataset.index = idx;
    menu.appendChild(item);
    optionItems.push(item);

    item.addEventListener('pointerenter', () => {
      AudioSynth.playTick();
      highlightOption(idx);
    });

    item.addEventListener('click', (e) => {
      e.stopPropagation();
      selectOption(optText);
    });
  });

  container.appendChild(menu);

  setAria(trigger, {
    'haspopup': 'listbox',
    'expanded': 'false',
    'label': labelSpan.textContent,
  });

  let isOpen = false;
  let hingeOrigin = options.hingeOrigin ?? 'top left';
  let swingSpeed = options.swingSpeed ?? 1.8;
  let highlightedIndex = -1;

  function highlightOption(idx) {
    highlightedIndex = idx;
    optionItems.forEach((item, i) => {
      item.setAttribute('aria-selected', i === idx ? 'true' : 'false');
      if (i === idx) {
        item.focus();
      }
    });
  }

  function openMenu() {
    isOpen = true;
    AudioSynth.playTick();

    menu.style.transformOrigin = hingeOrigin;
    menu.style.animation = `hinge-swing ${swingSpeed}s ease-in-out forwards`;
    menu.classList.add('open');
    caret.textContent = '\u25B2';
    trigger.setAttribute('aria-expanded', 'true');

    if (optionItems.length > 0) {
      highlightOption(0);
    }
  }

  function closeMenu() {
    isOpen = false;
    menu.classList.remove('open');
    menu.style.animation = 'none';
    caret.textContent = '\u25BC';
    trigger.setAttribute('aria-expanded', 'false');
    highlightedIndex = -1;
  }

  function selectOption(optText) {
    labelSpan.textContent = optText;
    closeMenu();
    AudioSynth.playClack();
    if (onSelect) onSelect(optText);
  }

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    if (isOpen) closeMenu();
    else openMenu();
  });

  trigger.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) openMenu();
      else if (optionItems.length > 0) highlightOption(0);
    } else if (e.key === 'Escape' && isOpen) {
      e.preventDefault();
      closeMenu();
      trigger.focus();
    }
  });

  menu.addEventListener('keydown', (e) => {
    if (!isOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      highlightOption(Math.min(optionItems.length - 1, highlightedIndex + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      highlightOption(Math.max(0, highlightedIndex - 1));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (highlightedIndex >= 0) {
        selectOption(menuOptions[highlightedIndex]);
        trigger.focus();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeMenu();
      trigger.focus();
    }
  });

  const onDocClick = (e) => {
    if (isOpen && !container.contains(e.target)) {
      closeMenu();
    }
  };
  document.addEventListener('click', onDocClick);

  container.destroy = () => {
    document.removeEventListener('click', onDocClick);
  };

  container.getControls = () => {
    return [
      { label: 'Hinge Corner', type: 'select', options: ['top left', 'top right'], value: hingeOrigin, onChange: (v) => {
        hingeOrigin = v;
        if (isOpen) { closeMenu(); setTimeout(openMenu, 100); }
      }},
      { label: 'Swing Time (s)', type: 'range', min: 1.0, max: 3.5, step: 0.2, value: swingSpeed, onChange: (v) => { swingSpeed = parseFloat(v); } }
    ];
  };

  container.getCodeSnippet = () => {
    return `import { createHingeDropdown } from 'winky-wonky';

const menu = createHingeDropdown({
  label: 'Choose Weapon',
  options: ['Wooden Mallet', 'Rusty Hanger', 'Clockwork Bomb'],
  hingeOrigin: 'top left',
  swingSpeed: 2.0,
  onSelect: (value) => console.log('Selected option: ', value)
});
document.body.appendChild(menu);`;
  };

  return container;
}
