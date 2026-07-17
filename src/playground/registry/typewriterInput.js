// Playground-only metadata for the Typewriter Jitter Input demo card.
export function getControls(instance) {
  return [
    { label: 'Type Shake (px)', type: 'range', min: 0, max: 8, step: 1, value: instance.config.jitterStrength, onChange: (v) => { instance.config.jitterStrength = parseInt(v, 10); } },
    { label: 'Letter Wobble (°)', type: 'range', min: 2, max: 25, step: 1, value: instance.config.maxWobbleRotation, onChange: (v) => { instance.config.maxWobbleRotation = parseInt(v, 10); } },
  ];
}

export function getCodeSnippet() {
  return `import { createTypewriterInput } from 'winky-wonky';

const input = createTypewriterInput({
  placeholder: 'Speak to the spirits...',
  jitterStrength: 4,
  maxWobbleRotation: 15,
  onChange: (value) => console.log('Current input: ', value)
});
document.body.appendChild(input.el);`;
}
