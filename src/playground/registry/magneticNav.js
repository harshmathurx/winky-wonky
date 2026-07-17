// Playground-only metadata for the Magnetic Navigation demo card. None of
// this ships in the library — see src/components/magneticNav.js for the real component.
export function getControls(instance) {
  const { config } = instance;
  return [
    { label: 'Magnetic Range', type: 'range', min: 20, max: 100, step: 5, value: config.magneticRange, onChange: (v) => { config.magneticRange = parseInt(v, 10); } },
    { label: 'Pull Strength', type: 'range', min: 0.05, max: 0.5, step: 0.05, value: config.pullStrength, onChange: (v) => { config.pullStrength = parseFloat(v); } },
  ];
}

export function getCodeSnippet() {
  return `import { createMagneticNav } from 'winky-wonky';

const nav = createMagneticNav({
  items: ['Home', 'Products', 'About'],
  activeIndex: 0,
  magneticRange: 60,
  onChange: (item) => console.log('Navigated to:', item)
});
document.body.appendChild(nav.el);`;
}
