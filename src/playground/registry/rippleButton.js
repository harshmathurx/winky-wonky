// Playground-only metadata for the Ripple Button demo card. None of this
// ships in the library — see src/components/rippleButton.js for the real component.
export function getControls(instance) {
  const { config } = instance;
  return [
    { label: 'Button Label', type: 'text', value: 'Press Me', onChange: (v) => { instance.setOptions({ label: v }); } },
    { label: 'Max Ripples', type: 'range', min: 1, max: 5, step: 1, value: config.maxRipples, onChange: (v) => { config.maxRipples = parseInt(v, 10); } },
  ];
}

export function getCodeSnippet() {
  return `import { createRippleButton } from 'winky-wonky';

const btn = createRippleButton({
  label: 'Submit',
  onClick: () => console.log('Clicked!')
});
document.body.appendChild(btn.el);`;
}
