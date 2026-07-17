// Playground-only metadata for the Slingshot Catapult demo card.
// None of this ships in the library — see src/components/slingshotUpload.js.
export function getControls(instance) {
  const { config } = instance;
  return [
    { label: 'Elastic Width', type: 'range', min: 2, max: 6, step: 1, value: config.bandWidth, onChange: (v) => instance.setOptions({ bandWidth: parseInt(v, 10) }) },
    { label: 'Launch Speed', type: 'range', min: 0.3, max: 1.5, step: 0.1, value: config.launchSpeed, onChange: (v) => instance.setOptions({ launchSpeed: parseFloat(v) }) },
  ];
}

export function getCodeSnippet() {
  return `import { createSlingshotUpload } from 'winky-wonky';

const uploader = createSlingshotUpload({
  bandWidth: 4,
  launchSpeed: 0.6
});
document.body.appendChild(uploader.el);`;
}
