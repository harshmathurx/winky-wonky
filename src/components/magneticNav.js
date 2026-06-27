import { AudioSynth } from './audioSynth.js';
import { setAria, prefersReducedMotion, onReducedMotionChange } from './utils.js';

export function createMagneticNav(options = {}) {
  const container = document.createElement('nav');
  container.className = 'magnetic-nav-container';
  container.setAttribute('role', 'navigation');
  container.setAttribute('aria-label', options.label ?? 'Main navigation');

  const items = options.items ?? ['Home', 'Discover', 'Collection', 'About'];
  let activeIndex = options.activeIndex ?? 0;
  let magneticRange = options.magneticRange ?? 50;
  let pullStrength = options.pullStrength ?? 0.2;
  const onChange = options.onChange;
  let reducedMotion = prefersReducedMotion();

  const indicator = document.createElement('div');
  indicator.className = 'magnetic-nav-indicator';
  indicator.setAttribute('aria-hidden', 'true');
  container.appendChild(indicator);

  const navList = document.createElement('ul');
  navList.className = 'magnetic-nav-list';
  navList.setAttribute('role', 'list');

  const navItems = [];

  items.forEach((label, index) => {
    const li = document.createElement('li');
    li.className = 'magnetic-nav-item';

    const link = document.createElement('button');
    link.className = 'magnetic-nav-link winky-focus-visible';
    link.setAttribute('role', 'menuitem');
    link.setAttribute('aria-current', index === activeIndex ? 'page' : 'false');
    link.textContent = label;
    link.tabIndex = 0;
    li.appendChild(link);
    navList.appendChild(li);
    navItems.push({ li, link });

    link.addEventListener('click', () => selectIndex(index));

    link.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const next = (index + 1) % navItems.length;
        navItems[next].link.focus();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = (index - 1 + navItems.length) % navItems.length;
        navItems[prev].link.focus();
      } else if (e.key === 'Home') {
        e.preventDefault();
        navItems[0].link.focus();
      } else if (e.key === 'End') {
        e.preventDefault();
        navItems[navItems.length - 1].link.focus();
      }
    });

    if (!reducedMotion) {
      link.addEventListener('pointermove', (e) => {
        const rect = link.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.hypot(dx, dy);

        if (dist < magneticRange) {
          const force = (1 - dist / magneticRange) * pullStrength;
          link.style.transform = `translate(${dx * force}px, ${dy * force}px)`;
        } else {
          link.style.transform = 'none';
        }
      });

      link.addEventListener('pointerleave', () => {
        link.style.transform = 'none';
      });
    }
  });

  container.appendChild(navList);

  function moveIndicator() {
    if (!navItems[activeIndex]) return;
    const rect = navItems[activeIndex].link.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const left = rect.left - containerRect.left;
    indicator.style.transform = `translateX(${left}px)`;
    indicator.style.width = `${rect.width}px`;
  }

  function selectIndex(index) {
    if (index === activeIndex) return;
    activeIndex = index;
    AudioSynth.playTick();

    navItems.forEach((item, i) => {
      item.link.setAttribute('aria-current', i === activeIndex ? 'page' : 'false');
    });

    moveIndicator();
    if (onChange) onChange(items[activeIndex]);
  }

  requestAnimationFrame(() => moveIndicator());

  const motionListener = onReducedMotionChange(() => {
    reducedMotion = prefersReducedMotion();
    if (reducedMotion) {
      navItems.forEach(item => { item.link.style.transform = 'none'; });
    }
    moveIndicator();
  });

  container.destroy = () => {
    motionListener();
  };

  container.getControls = () => {
    return [
      { label: 'Magnetic Range', type: 'range', min: 20, max: 100, step: 5, value: magneticRange, onChange: (v) => { magneticRange = parseInt(v); } },
      { label: 'Pull Strength', type: 'range', min: 0.05, max: 0.5, step: 0.05, value: pullStrength, onChange: (v) => { pullStrength = parseFloat(v); } }
    ];
  };

  container.getCodeSnippet = () => {
    return `import { createMagneticNav } from 'winky-wonky';

const nav = createMagneticNav({
  items: ['Home', 'Products', 'About'],
  activeIndex: 0,
  magneticRange: 60,
  onChange: (item) => console.log('Navigated to:', item)
});
document.body.appendChild(nav);`;
  };

  return container;
}
