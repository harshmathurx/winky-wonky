// Playground-only metadata for the Wobbly Radio Group demo card. None of
// this ships in the library — see src/components/wobblyRadioGroup.js.
export function getControls(instance) {
  return [
    { label: 'Items (comma-sep)', type: 'text', value: instance.getItems().join(', '), onChange: (v) => {
      const newItems = v.split(',').map(s => s.trim()).filter(Boolean);
      if (newItems.length > 0) instance.setOptions({ items: newItems });
    } },
  ];
}

export function getCodeSnippet() {
  return `import { createWobblyRadioGroup } from 'winky-wonky';

const radio = createWobblyRadioGroup({
  items: ['Option A', 'Option B', 'Option C'],
  initialIndex: 0,
  onChange: (selected) => console.log('Selected:', selected)
});
document.body.appendChild(radio.el);`;
}
