import { AudioSynth } from './audioSynth.js';
import { setAria, prefersReducedMotion, onReducedMotionChange } from './utils.js';

/**
 * @typedef {Object} SpringyTabsOptions
 * @property {{label: string, content: string}[]} [tabs] - Tab definitions.
 * @property {number} [activeIndex=0] - Initially-active tab index.
 * @property {number} [springBounciness=1.2] - Reserved for future spring tuning.
 * @property {(tab: {label: string, content: string}) => void} [onChange] -
 *   Called with the newly-active tab object on user interaction.
 */

/**
 * @typedef {Object} SpringyTabsInstance
 * @property {HTMLElement} el - Root element; append this to the DOM.
 * @property {() => number} getValue - Current active tab index.
 * @property {(index: number) => void} setValue - Switches the active tab.
 *   Updates DOM/ARIA; does NOT invoke `onChange`.
 * @property {() => void} destroy
 * @property {{springBounciness: number}} config - Live-mutable passive knob.
 */

/**
 * Creates a tab interface with a spring-animated underline indicator.
 * @param {SpringyTabsOptions} [options]
 * @returns {SpringyTabsInstance}
 */
export function createSpringyTabs(options = {}) {
  const container = document.createElement('div');
  container.className = 'winky-springy-tabs-container';

  const tabsData = options.tabs ?? [
    { label: 'Overview', content: 'A panoramic view of the peculiar collection, arranged with symmetrical precision.' },
    { label: 'Details', content: 'The finer points: stitching, patina, and the provenance of each object.' },
    { label: 'Reviews', content: 'Critics called it "charmingly eccentric" and "uncomfortably alive."' }
  ];

  let activeIndex = options.activeIndex ?? 0;
  const config = {
    springBounciness: options.springBounciness ?? 1.2,
  };
  let reducedMotion = prefersReducedMotion();

  const tabList = document.createElement('div');
  tabList.className = 'winky-springy-tabs-list';
  tabList.setAttribute('role', 'tablist');

  const indicator = document.createElement('div');
  indicator.className = 'winky-springy-tabs-indicator';
  indicator.setAttribute('aria-hidden', 'true');
  tabList.appendChild(indicator);

  const tabs = [];
  const panels = [];

  tabsData.forEach((data, index) => {
    const tab = document.createElement('button');
    tab.className = 'winky-springy-tab winky-focus-visible';
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-selected', index === activeIndex ? 'true' : 'false');
    tab.setAttribute('aria-controls', `winky-tabpanel-${index}`);
    tab.id = `winky-tab-${index}`;
    tab.textContent = data.label;
    tab.tabIndex = index === activeIndex ? 0 : -1;
    tabList.appendChild(tab);
    tabs.push(tab);

    tab.addEventListener('click', () => selectTab(index));

    tab.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const next = (index + 1) % tabs.length;
        selectTab(next);
        tabs[next].focus();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = (index - 1 + tabs.length) % tabs.length;
        selectTab(prev);
        tabs[prev].focus();
      } else if (e.key === 'Home') {
        e.preventDefault();
        selectTab(0);
        tabs[0].focus();
      } else if (e.key === 'End') {
        e.preventDefault();
        selectTab(tabs.length - 1);
        tabs[tabs.length - 1].focus();
      }
    });

    const panel = document.createElement('div');
    panel.className = 'winky-springy-tab-panel';
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', `winky-tab-${index}`);
    panel.id = `winky-tabpanel-${index}`;
    panel.textContent = data.content;
    if (index !== activeIndex) panel.style.display = 'none';
    container.appendChild(panel);
    panels.push(panel);
  });

  container.insertBefore(tabList, container.firstChild);

  function moveIndicator() {
    if (!tabs[activeIndex]) return;
    const rect = tabs[activeIndex].getBoundingClientRect();
    const listRect = tabList.getBoundingClientRect();
    const left = rect.left - listRect.left;
    indicator.style.transform = `translateX(${left}px)`;
    indicator.style.width = `${rect.width}px`;
  }

  // silent=true suppresses the tick sound and onChange, used by setValue()
  // so programmatic tab switches never fire the callback.
  function selectTab(index, silent = false) {
    if (index === activeIndex) return;
    activeIndex = index;
    if (!silent) AudioSynth.playTick();

    tabs.forEach((t, i) => {
      t.setAttribute('aria-selected', i === activeIndex ? 'true' : 'false');
      t.tabIndex = i === activeIndex ? 0 : -1;
    });

    panels.forEach((p, i) => {
      p.style.display = i === activeIndex ? 'block' : 'none';
      if (i === activeIndex && !reducedMotion) {
        p.classList.remove('winky-springy-enter');
        void p.offsetWidth;
        p.classList.add('winky-springy-enter');
      }
    });

    moveIndicator();
    if (!silent && options.onChange) options.onChange(tabsData[activeIndex]);
  }

  requestAnimationFrame(() => {
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
    return activeIndex;
  }

  function setValue(index) {
    if (index < 0 || index >= tabs.length) return;
    selectTab(index, true);
  }

  return { el: container, getValue, setValue, destroy, config };
}
