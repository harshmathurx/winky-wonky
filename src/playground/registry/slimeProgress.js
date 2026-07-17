// Playground-only metadata for the Slime Meltdown Progress demo card.
export function getControls(instance) {
  return [
    { label: 'Viscosity (s)', type: 'range', min: 0.8, max: 2.5, step: 0.1, value: instance.config.meltDuration, onChange: (v) => { instance.config.meltDuration = parseFloat(v); } },
    { label: 'Current Fill %', type: 'range', min: 10, max: 100, step: 5, value: instance.getValue(), onChange: (v) => instance.setValue(parseInt(v, 10)) },
  ];
}

export function getCodeSnippet() {
  return `import { createSlimeProgress } from 'winky-wonky';

const loader = createSlimeProgress({
  initialProgress: 60,
  meltDuration: 1.2,
  onMeltComplete: (pct) => console.log('Slime melt finished on value: ', pct)
});
document.body.appendChild(loader.el);`;
}
