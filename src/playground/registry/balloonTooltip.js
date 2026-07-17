// Playground-only metadata for the Helium Balloon Tooltip demo card.
// None of this ships in the library — see src/components/balloonTooltip.js.
export function getControls(instance) {
  const { config } = instance;
  return [
    { label: 'String Length', type: 'range', min: 15, max: 45, step: 5, value: config.stringLength, onChange: (v) => instance.setOptions({ stringLength: parseInt(v, 10) }) },
    { label: 'Tooltip Text', type: 'text', value: config.text, onChange: (v) => instance.setOptions({ text: v }) },
  ];
}

export function getCodeSnippet() {
  return `import { createBalloonTooltip } from 'winky-wonky';

const targetBtn = document.createElement('button');
targetBtn.textContent = 'Hover me';

const tooltip = createBalloonTooltip({
  text: 'Behold the secret!',
  stringLength: 20,
  triggerNode: targetBtn
});
document.body.appendChild(tooltip.el);`;
}
