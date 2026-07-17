// Playground-only metadata for the Suspicious Password Eye demo card.
// None of this ships in the library — see src/components/suspiciousEyes.js.
export function getControls(instance) {
  const { config } = instance;
  return [
    { label: 'Eye Sensitivity', type: 'range', min: 4, max: 12, step: 1, value: config.trackingSensitivity, onChange: (v) => { config.trackingSensitivity = parseInt(v, 10); } },
    { label: 'Shock Time (ms)', type: 'range', min: 500, max: 3000, step: 250, value: config.shockDuration, onChange: (v) => { config.shockDuration = parseInt(v, 10); } },
  ];
}

export function getCodeSnippet() {
  return `import { createSuspiciousEyes } from 'winky-wonky';

const passwordInput = createSuspiciousEyes({
  trackingSensitivity: 8,
  shockDuration: 2000
});
document.body.appendChild(passwordInput.el);`;
}
