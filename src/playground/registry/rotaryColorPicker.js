// Playground-only metadata for the Rotary Theme Dial demo card.
export function getControls(instance) {
  return [
    { label: 'Selected Dial', type: 'button', value: 'Reset to Indigo', onChange: () => { instance.setValue(0); } },
  ];
}

export function getCodeSnippet() {
  return `import { createRotaryColorPicker } from 'winky-wonky';

const dial = createRotaryColorPicker({
  palettes: [
    {
      name: 'Brand Theme',
      theme: 'anderson',
      colors: {
        '--winky-bg-primary': '#FFFFFF',
        '--winky-bg-secondary': '#F0F0F0',
        '--winky-accent-color': '#007FFF'
      }
    }
  ],
  onDialComplete: (palette) => console.log('Dialed to: ', palette.name)
});
document.body.appendChild(dial.el);`;
}
