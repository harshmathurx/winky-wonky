import { AudioSynth } from './audioSynth.js';
import { prefersReducedMotion, onReducedMotionChange } from './utils.js';

export function createSlinkyAccordion(options = {}) {
  const container = document.createElement('div');
  container.className = 'slinky-accordion';

  const itemsData = options.items ?? [
    {
      title: 'Peculiar Mechanism',
      content: 'Inside this wooden drawer, a series of rusty brass gears rotates in reverse. If wound clockwise, it slows down time by three seconds per hour.'
    },
    {
      title: 'Pastel Curiosities',
      content: 'A curated set of symmetrical paint brushes that only paint in shades of Grand Budapest mustard yellow, faded rose, and vintage turquoise.'
    }
  ];

  let openIndex = 0;
  let springBounciness = options.springBounciness ?? 1.35;
  let transitionDuration = options.transitionDuration ?? 0.45;
  let reducedMotion = prefersReducedMotion();

  const items = [];

  itemsData.forEach((data, index) => {
    const item = document.createElement('div');
    item.className = 'accordion-item';

    const tab = document.createElement('button');
    tab.className = 'accordion-tab winky-focus-visible';
    tab.setAttribute('aria-expanded', index === openIndex ? 'true' : 'false');
    tab.setAttribute('aria-controls', `winky-panel-${index}`);
    tab.id = `winky-tab-${index}`;

    const titleSpan = document.createElement('span');
    titleSpan.textContent = data.title;
    tab.appendChild(titleSpan);

    const icon = document.createElement('span');
    icon.className = 'accordion-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = '\u25B6';
    tab.appendChild(icon);

    item.appendChild(tab);

    const panel = document.createElement('div');
    panel.className = 'accordion-panel';
    panel.id = `winky-panel-${index}`;
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-labelledby', `winky-tab-${index}`);

    const content = document.createElement('div');
    content.className = 'accordion-panel-content';
    content.textContent = data.content;
    panel.appendChild(content);

    item.appendChild(panel);
    container.appendChild(item);

    items.push({ tab, panel, icon });

    tab.addEventListener('click', () => {
      if (openIndex === index) {
        AudioSynth.playClack();
        openIndex = -1;
      } else {
        AudioSynth.playTick();
        openIndex = index;
      }

      if (!reducedMotion) {
        tab.style.animation = 'squash-press 0.15s ease-out';
        setTimeout(() => { tab.style.animation = 'none'; }, 160);
      }

      renderState();
    });

    tab.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIdx = (index + 1) % items.length;
        items[nextIdx].tab.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIdx = (index - 1 + items.length) % items.length;
        items[prevIdx].tab.focus();
      } else if (e.key === 'Home') {
        e.preventDefault();
        items[0].tab.focus();
      } else if (e.key === 'End') {
        e.preventDefault();
        items[items.length - 1].tab.focus();
      }
    });
  });

  function renderState() {
    items.forEach((item, index) => {
      const isOpen = index === openIndex;
      const bezier = reducedMotion ? 'ease-out' : `cubic-bezier(0.175, 0.885, 0.32, ${springBounciness})`;
      item.panel.style.transition = `max-height ${transitionDuration}s ${bezier}`;

      if (isOpen) {
        item.panel.style.maxHeight = '140px';
        item.icon.classList.add('open');
        item.tab.setAttribute('aria-expanded', 'true');
      } else {
        item.panel.style.maxHeight = '0px';
        item.icon.classList.remove('open');
        item.tab.setAttribute('aria-expanded', 'false');
      }
    });
  }

  renderState();

  const motionListener = onReducedMotionChange(() => {
    reducedMotion = prefersReducedMotion();
    renderState();
  });

  container.destroy = () => {
    motionListener();
  };

  container.getControls = () => {
    return [
      { label: 'Accordion Spring', type: 'range', min: 1.0, max: 1.6, step: 0.1, value: springBounciness, onChange: (v) => { springBounciness = parseFloat(v); renderState(); } },
      { label: 'Open Speed (s)', type: 'range', min: 0.2, max: 0.8, step: 0.05, value: transitionDuration, onChange: (v) => { transitionDuration = parseFloat(v); renderState(); } }
    ];
  };

  container.getCodeSnippet = () => {
    return `import { createSlinkyAccordion } from 'winky-wonky';

const accordion = createSlinkyAccordion({
  springBounciness: 1.4,
  transitionDuration: 0.5,
  items: [
    { title: 'Card 1', content: 'Some description...' },
    { title: 'Card 2', content: 'Another description...' }
  ]
});
document.body.appendChild(accordion);`;
  };

  return container;
}
