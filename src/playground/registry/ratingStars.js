// Playground-only metadata for the Self-Conscious Stars demo card. None of
// this ships in the library — see src/components/ratingStars.js.
export function getControls(instance) {
  const { config } = instance;
  return [
    { label: 'Confetti Density', type: 'range', min: 10, max: 50, step: 5, value: config.confettiCount, onChange: (v) => { config.confettiCount = parseInt(v, 10); } },
  ];
}

export function getCodeSnippet() {
  return `import { createRatingStars } from 'winky-wonky';

const stars = createRatingStars({
  initialRating: 3,
  confettiCount: 30,
  onChange: (rating) => console.log('Current stars count: ', rating)
});
document.body.appendChild(stars.el);`;
}
