// Playground-only metadata for the Tilt Seesaw Slider demo card: the tweakable
// "Parameters" panel and the "Show HTML/CSS" code snippet. None of this ships
// in the library — see src/components/tiltSlider.js for the real component.
export function getControls(instance) {
  const { config } = instance;
  return [
    { label: 'Gravity Power', type: 'range', min: 0.1, max: 1.5, step: 0.1, value: config.gravity, onChange: (v) => { config.gravity = parseFloat(v); } },
    { label: 'Max Seesaw Tilt', type: 'range', min: 5, max: 30, step: 1, value: config.maxTilt, onChange: (v) => { config.maxTilt = parseInt(v, 10); } },
    { label: 'Spring Lag', type: 'range', min: 0.05, max: 1.0, step: 0.05, value: config.springLag, onChange: (v) => { config.springLag = parseFloat(v); } },
  ];
}

export function getCodeSnippet() {
  return `import { createTiltSlider } from 'winky-wonky';

const slider = createTiltSlider({
  initialValue: 50,
  gravity: 0.4,
  maxTilt: 15,
  springLag: 0.2,
  onChange: (value) => console.log('Volume is: ', value)
});
document.body.appendChild(slider.el);`;
}
