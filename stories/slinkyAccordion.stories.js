import { createSlinkyAccordion } from '../packages/winky-wonky/src/components/slinkyAccordion.js';
import { mount } from './utils/mount.js';

export default {
  title: 'Components/Slinky Accordion',
  render: mount(createSlinkyAccordion),
  parameters: { layout: 'padded' },
  argTypes: {
    springBounciness: { control: { type: 'range', min: 1, max: 2, step: 0.05 } },
    transitionDuration: { control: { type: 'range', min: 0.1, max: 1.5, step: 0.05 } },
  },
  args: {
    springBounciness: 1.35,
    transitionDuration: 0.45,
  },
};

export const Default = {};
