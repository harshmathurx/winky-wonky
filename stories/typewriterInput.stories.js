import { createTypewriterInput } from '../packages/winky-wonky/src/components/typewriterInput.js';
import { mount } from './utils/mount.js';

export default {
  title: 'Components/Typewriter Input',
  render: mount(createTypewriterInput),
  argTypes: {
    placeholder: { control: 'text' },
    jitterStrength: { control: { type: 'range', min: 0, max: 10, step: 0.5 } },
    maxWobbleRotation: { control: { type: 'range', min: 0, max: 30, step: 1 } },
  },
  args: {
    placeholder: 'Type something peculiar...',
    jitterStrength: 3,
    maxWobbleRotation: 12,
  },
};

export const Default = {};
