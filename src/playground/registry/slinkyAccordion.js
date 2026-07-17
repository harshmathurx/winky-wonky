// Playground-only metadata for the Slinky Springs Accordion demo card. None
// of this ships in the library — see src/components/slinkyAccordion.js for the real component.
export function getControls(instance) {
  return [
    { label: 'Accordion Spring', type: 'range', min: 1.0, max: 1.6, step: 0.1, value: 1.35, onChange: (v) => { instance.setOptions({ springBounciness: parseFloat(v) }); } },
    { label: 'Open Speed (s)', type: 'range', min: 0.2, max: 0.8, step: 0.05, value: 0.45, onChange: (v) => { instance.setOptions({ transitionDuration: parseFloat(v) }); } },
  ];
}

export function getCodeSnippet() {
  return `import { createSlinkyAccordion } from 'winky-wonky';

const accordion = createSlinkyAccordion({
  springBounciness: 1.4,
  transitionDuration: 0.5,
  items: [
    { title: 'Card 1', content: 'Some description...' },
    { title: 'Card 2', content: 'Another description...' }
  ]
});
document.body.appendChild(accordion.el);`;
}
