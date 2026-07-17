// Playground-only metadata for the Pendulum Switch demo card. None of this
// ships in the library — see src/components/pendulumToggle.js.
export function getControls(instance) {
  const { config } = instance;
  return [
    { label: 'Swing Weight (s)', type: 'range', min: 0.8, max: 2.5, step: 0.1, value: config.swingTime, onChange: (v) => { config.swingTime = parseFloat(v); } },
    { label: 'Physics Damping', type: 'range', min: 0.1, max: 0.8, step: 0.05, value: config.damping, onChange: (v) => { config.damping = parseFloat(v); } },
  ];
}

export function getCodeSnippet() {
  return `import { createPendulumToggle } from 'winky-wonky';

const toggle = createPendulumToggle({
  initialState: false,
  damping: 0.5,
  swingTime: 1.4,
  onChange: (state) => console.log('Toggle state shifted to: ', state)
});
document.body.appendChild(toggle.el);`;
}
