// Playground-only metadata for the Elastic Drag List demo card. None of
// this ships in the library — see src/components/elasticDragList.js for the real component.
export function getCodeSnippet() {
  return `import { createElasticDragList } from 'winky-wonky';

const list = createElasticDragList({
  items: [
    { label: 'Item 1' },
    { label: 'Item 2' },
    { label: 'Item 3' },
  ],
  onChange: (order) => console.log('New order:', order)
});
document.body.appendChild(list.el);`;
}
