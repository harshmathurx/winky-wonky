// Playground-only metadata for the Magnetic Putty Button demo card.
// None of this ships in the library — see src/components/magneticButton.js.
export function getControls(instance) {
  const { config } = instance;
  return [
    { label: 'Magnetic Range', type: 'range', min: 50, max: 130, step: 5, value: config.magneticRange, onChange: (v) => { config.magneticRange = parseInt(v, 10); } },
    { label: 'Pull Strength', type: 'range', min: 0.1, max: 0.8, step: 0.05, value: config.pullStrength, onChange: (v) => { config.pullStrength = parseFloat(v); } },
  ];
}

export function getCodeSnippet() {
  return `import { createMagneticButton } from 'winky-wonky';

const btn = createMagneticButton({
  magneticRange: 100,
  pullStrength: 0.5
});
document.body.appendChild(btn.el);`;
}
