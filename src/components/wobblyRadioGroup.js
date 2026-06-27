import { AudioSynth } from './audioSynth.js';
import { setAria, prefersReducedMotion, onReducedMotionChange } from './utils.js';

export function createWobblyRadioGroup(options = {}) {
  const container = document.createElement('div');
  container.className = 'wobbly-radio-group';

  const items = options.items ?? ['Marginalia', 'Specimen', 'Curiosity', 'Peculiarity'];
  let selectedIndex = options.initialIndex ?? 0;
  const onChange = options.onChange;
  let reducedMotion = prefersReducedMotion();

  container.setAttribute('role', 'radiogroup');
  container.setAttribute('aria-label', options.label ?? 'Selection');

  const radios = [];
  const indicator = document.createElement('div');
  indicator.className = 'wobbly-radio-indicator';
  indicator.setAttribute('aria-hidden', 'true');
  container.appendChild(indicator);

  items.forEach((label, index) => {
    const radio = document.createElement('div');
    radio.className = 'wobbly-radio-item winky-focus-visible';
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
  });

  function moveIndicator() {
    if (selectedIndex < 0 || !radios[selectedIndex]) return;
    const rect = radios[selectedIndex].getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const left = rect.left - containerRect.left;
    const width = rect.width;
    indicator.style.transform = `translateX(${left}px)`;
    indicator.style.width = `${width}px`;
  }

  function selectIndex(index) {
    if (index === selectedIndex) return;
    selectedIndex = index;
    AudioSynth.playTick();

    radios.forEach((r, i) => {
      r.setAttribute('aria-checked', i === selectedIndex ? 'true' : 'false');
      r.setAttribute('tabindex', i === selectedIndex ? '0' : '-1');
      r.classList.toggle('selected', i === selectedIndex);
    });

    moveIndicator();
    if (onChange) onChange(items[selectedIndex]);
  }

  requestAnimationFrame(() => {
    radios[selectedIndex]?.classList.add('selected');
    moveIndicator();
  });

  const motionListener = onReducedMotionChange(() => {
    reducedMotion = prefersReducedMotion();
    moveIndicator();
  });

  container.destroy = () => {
    motionListener();
  };

  container.getControls = () => {
    return [
      { label: 'Items (comma-sep)', type: 'text', value: items.join(', '), onChange: (v) => {
        const newItems = v.split(',').map(s => s.trim()).filter(Boolean);
        if (newItems.length > 0) {
          items.splice(0, items.length, ...newItems);
          radios.forEach(r => r.remove());
          radios.length = 0;
          items.forEach((label, index) => {
            const radio = document.createElement('div');
            radio.className = 'wobbly-radio-item winky-focus-visible';
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
              }
            });
          });
          selectedIndex = Math.min(selectedIndex, items.length - 1);
          radios[selectedIndex]?.classList.add('selected');
          moveIndicator();
        }
      }}
    ];
  };

  container.getCodeSnippet = () => {
    return `import { createWobblyRadioGroup } from 'winky-wonky';

const radio = createWobblyRadioGroup({
  items: ['Option A', 'Option B', 'Option C'],
  initialIndex: 0,
  onChange: (selected) => console.log('Selected:', selected)
});
document.body.appendChild(radio);`;
  };

  return container;
}
