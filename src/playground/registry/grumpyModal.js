import { AudioSynth } from '../../components/audioSynth.js';

// Playground-only metadata for the Grumpy Modal demo card.
// None of this ships in the library — see src/components/grumpyModal.js.
export function getControls() {
  return [
    { label: 'Grumpy Volume', type: 'button', value: 'Test Buzzer', onChange: () => { AudioSynth.playClack(); } },
  ];
}

export function getCodeSnippet() {
  return `import { createGrumpyModalTrigger } from 'winky-wonky';

const trigger = createGrumpyModalTrigger({
  headerText: 'System Error!',
  bodyText: 'Do not ignore this warning message...',
  buttonText: 'I Accept My Fate',
  onClose: () => console.log('Grumpy modal closed successfully')
});
document.body.appendChild(trigger.el);`;
}
