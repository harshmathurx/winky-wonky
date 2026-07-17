// Playground-only metadata for the Springy Tabs demo card. None of this
// ships in the library — see src/components/springyTabs.js.
export function getControls(instance) {
  const { config } = instance;
  return [
    { label: 'Spring Bounce', type: 'range', min: 1.0, max: 1.6, step: 0.05, value: config.springBounciness, onChange: (v) => { config.springBounciness = parseFloat(v); } },
  ];
}

export function getCodeSnippet() {
  return `import { createSpringyTabs } from 'winky-wonky';

const tabs = createSpringyTabs({
  tabs: [
    { label: 'Tab 1', content: 'Content 1' },
    { label: 'Tab 2', content: 'Content 2' },
  ],
  activeIndex: 0,
  onChange: (tab) => console.log('Selected tab:', tab.label)
});
document.body.appendChild(tabs.el);`;
}
