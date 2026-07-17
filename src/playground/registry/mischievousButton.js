// Playground-only metadata for the Mischievous Buttons demo card.
export function getControls(instance) {
  return [
    { label: 'Enable Dodge', type: 'checkbox', value: instance.config.dodgeEnabled, onChange: (v) => instance.setOptions({ dodgeEnabled: v }) },
    { label: 'Dodge Evasion', type: 'range', min: 0.2, max: 1.0, step: 0.1, value: instance.config.dodgePower, onChange: (v) => instance.setOptions({ dodgePower: parseFloat(v) }) },
    { label: 'Dodge Range (px)', type: 'range', min: 40, max: 120, step: 5, value: instance.config.maxDodgeRange, onChange: (v) => instance.setOptions({ maxDodgeRange: parseInt(v, 10) }) },
  ];
}

export function getCodeSnippet() {
  return `import { createMischievousButtons } from 'winky-wonky';

const buttons = createMischievousButtons({
  isDodgeEnabled: true,
  dodgePower: 0.8,
  maxDodgeRange: 75,
  onClick: (type) => console.log('Clicked button of type: ', type)
});
document.body.appendChild(buttons.el);`;
}
