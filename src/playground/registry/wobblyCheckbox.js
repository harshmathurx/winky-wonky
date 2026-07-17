// Playground-only metadata for the Wobbly Checkbox demo card. None of this
// ships in the library — see src/components/wobblyCheckbox.js.
export function getControls(instance) {
  const { config } = instance;
  return [
    { label: 'Enable Jitter', type: 'checkbox', value: config.isJitterEnabled, onChange: (v) => { config.isJitterEnabled = v; } },
    { label: 'Checkbox Label', type: 'text', value: 'Indie Cinema Mode', onChange: (v) => { instance.setOptions({ labelText: v }); } },
  ];
}

export function getCodeSnippet() {
  return `import { createWobblyCheckbox } from 'winky-wonky';

const checkbox = createWobblyCheckbox({
  labelText: 'Agree to Peculiarity',
  isJitterEnabled: true,
  onChange: (isChecked) => console.log('Checkbox status: ', isChecked)
});
document.body.appendChild(checkbox.el);`;
}
