// Playground-only metadata for the Gravity Toast demo card. None of this
// ships in the library — see src/components/gravityToast.js for the real component.
export function getControls(instance) {
  const { config } = instance;
  return [
    { label: 'Duration (ms)', type: 'range', min: 1000, max: 6000, step: 500, value: config.duration, onChange: (v) => { config.duration = parseInt(v, 10); } },
    { label: 'Max Visible', type: 'range', min: 1, max: 5, step: 1, value: config.maxVisible, onChange: (v) => { config.maxVisible = parseInt(v, 10); } },
  ];
}

export function getCodeSnippet() {
  return `import { createGravityToast } from 'winky-wonky';

const toaster = createGravityToast({
  buttonText: 'Notify',
  duration: 3000,
  messages: ['Saved!', 'Synced!', 'Done!']
});
document.body.appendChild(toaster.el);`;
}
