import { createRatingStars } from '../packages/winky-wonky/src/components/ratingStars.js';
import { mount } from './utils/mount.js';

export default {
  title: 'Components/Rating Stars',
  render: mount(createRatingStars),
  argTypes: {
    initialRating: { control: { type: 'range', min: 0, max: 5, step: 1 } },
    confettiCount: { control: { type: 'range', min: 0, max: 60, step: 5 } },
  },
  args: {
    initialRating: 0,
    confettiCount: 25,
  },
};

export const Default = {};
