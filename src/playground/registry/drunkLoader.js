// Playground-only metadata for the Drunk Loader Spinner demo card.
// None of this ships in the library — see src/components/drunkLoader.js.
export function getControls(instance) {
  const { config } = instance;
  return [
    { label: 'Base Speed', type: 'range', min: 1.0, max: 8.0, step: 0.5, value: config.baseSpeed, onChange: (v) => { config.baseSpeed = parseFloat(v); } },
    { label: 'Drunkenness', type: 'range', min: 0.5, max: 5.0, step: 0.5, value: config.drunkenness, onChange: (v) => { config.drunkenness = parseFloat(v); } },
    { label: 'Wobble Severity', type: 'range', min: 0, max: 10, step: 1, value: config.wobbleSeverity, onChange: (v) => { config.wobbleSeverity = parseInt(v, 10); } },
  ];
}

export function getCodeSnippet() {
  return `import { createDrunkLoader } from 'winky-wonky';

const loader = createDrunkLoader({
  baseSpeed: 4.0,
  drunkenness: 3.0,
  wobbleSeverity: 5
});
document.body.appendChild(loader.el);`;
}
