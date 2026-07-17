// Playground-only metadata for the Wobbly Switch demo card.
export function getControls(instance) {
  return [
    { label: 'Spring Power', type: 'range', min: 1.0, max: 1.8, step: 0.05, value: instance.config.springPower, onChange: (v) => instance.setOptions({ springPower: parseFloat(v) }) },
    { label: 'Switch Label', type: 'text', value: instance.el.querySelector('.winky-wobbly-switch-label').textContent, onChange: (v) => instance.setOptions({ labelText: v }) },
  ];
}

export function getCodeSnippet() {
  return `import { createWobblySwitch } from 'winky-wonky';

const sw = createWobblySwitch({
  labelText: 'Enable Physics',
  initialState: false,
  onChange: (isOn) => console.log('Switch:', isOn)
});
document.body.appendChild(sw.el);`;
}
