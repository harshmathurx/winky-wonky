import { AudioSynth } from './audioSynth.js';
import { setAria, prefersReducedMotion, onReducedMotionChange } from './utils.js';

/**
 * @typedef {Object} MagneticNavOptions
 * @property {string} [label='Main navigation'] - Accessible name for the nav landmark.
 * @property {string[]} [items] - Nav item labels.
 * @property {number} [activeIndex=0] - Initially active item index.
 * @property {number} [magneticRange=50] - Pointer distance (px) at which items start pulling toward the cursor.
 * @property {number} [pullStrength=0.2] - How strongly items translate toward the cursor (0-1).
 * @property {(item: string) => void} [onChange] - Called with the newly active item's label.
 */

/**
 * @typedef {Object} MagneticNavInstance
 * @property {HTMLElement} el - Root element; append this to the DOM.
 * @property {() => void} destroy - Removes listeners.
 * @property {{magneticRange: number, pullStrength: number}} config -
 *   Live-mutable secondary knobs (used by the playground's tuning panel).
 */

/**
 * Creates a navigation bar with magnetic cursor attraction on each item and
 * a sliding active-item indicator. Keyboard navigable (arrows/Home/End).
 * @param {MagneticNavOptions} [options]
 * @returns {MagneticNavInstance}
 */
export function createMagneticNav(options = {}) {
  const container = document.createElement('nav');
  container.className = 'winky-magnetic-nav-container';
  container.setAttribute('role', 'navigation');
  container.setAttribute('aria-label', options.label ?? 'Main navigation');

  const items = options.items ?? ['Home', 'Discover', 'Collection', 'About'];
  let activeIndex = options.activeIndex ?? 0;
  const config = {
    magneticRange: options.magneticRange ?? 50,
    pullStrength: options.pullStrength ?? 0.2,
  };
  const onChange = options.onChange;
  let reducedMotion = prefersReducedMotion();

  const indicator = document.createElement('div');
  indicator.className = 'winky-magnetic-nav-indicator';
  indicator.setAttribute('aria-hidden', 'true');
  container.appendChild(indicator);

  const navList = document.createElement('ul');
  navList.className = 'winky-magnetic-nav-list';
  navList.setAttribute('role', 'list');

  const navItems = [];

  items.forEach((label, index) => {
    const li = document.createElement('li');
    li.className = 'winky-magnetic-nav-item';

    const link = document.createElement('button');
    link.className = 'winky-magnetic-nav-link winky-focus-visible';
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

        if (dist < config.magneticRange) {
          const force = (1 - dist / config.magneticRange) * config.pullStrength;
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

  function destroy() {
    motionListener();
  }

  return { el: container, destroy, config };
}
