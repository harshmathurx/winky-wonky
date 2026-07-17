// Playground-only metadata for the Swinging Hinge Dropdown demo card.
export function getControls(instance) {
  return [
    { label: 'Hinge Corner', type: 'select', options: ['top left', 'top right'], value: instance.config.hingeOrigin, onChange: (v) => instance.setOptions({ hingeOrigin: v }) },
    { label: 'Swing Time (s)', type: 'range', min: 1.0, max: 3.5, step: 0.2, value: instance.config.swingSpeed, onChange: (v) => instance.setOptions({ swingSpeed: parseFloat(v) }) },
  ];
}

export function getCodeSnippet() {
  return `import { createHingeDropdown } from 'winky-wonky';

const menu = createHingeDropdown({
  label: 'Choose Weapon',
  options: ['Wooden Mallet', 'Rusty Hanger', 'Clockwork Bomb'],
  hingeOrigin: 'top left',
  swingSpeed: 2.0,
  onSelect: (value) => console.log('Selected option: ', value)
});
document.body.appendChild(menu.el);`;
}
