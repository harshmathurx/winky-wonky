// Playground-only metadata for the Groove-o-Matic Slider demo card. None of
// this ships in the library — see src/components/groovySlider.js.
export function getControls(instance) {
  const { config } = instance;
  return [
    { label: 'Notch Count', type: 'range', min: 3, max: 15, step: 1, value: 8, onChange: (v) => { instance.setOptions({ notchCount: parseInt(v, 10) }); } },
    { label: 'Wave Height', type: 'range', min: 0, max: 30, step: 1, value: 18, onChange: (v) => { instance.setOptions({ waveAmplitude: parseInt(v, 10) }); } },
    { label: 'Snap Range %', type: 'range', min: 1.0, max: 8.0, step: 0.5, value: config.snapThreshold, onChange: (v) => { config.snapThreshold = parseFloat(v); } },
  ];
}

export function getCodeSnippet() {
  return `import { createGroovySlider } from 'winky-wonky';

const slider = createGroovySlider({
  initialValue: 20,
  notchCount: 8,
  waveAmplitude: 18,
  snapThreshold: 3.5,
  onChange: (value) => console.log('Snapped to value: ', value)
});
document.body.appendChild(slider.el);`;
}
