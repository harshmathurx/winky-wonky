import { createGravityToast } from '../packages/winky-wonky/src/components/gravityToast.js';
import { mount } from './utils/mount.js';

export default {
  title: 'Components/Gravity Toast',
  render: mount(createGravityToast),
  argTypes: {
    buttonText: { control: 'text' },
    maxVisible: { control: { type: 'range', min: 1, max: 6, step: 1 } },
    duration: { control: { type: 'range', min: 500, max: 8000, step: 250 } },
  },
  args: {
    buttonText: 'Show Toast',
    maxVisible: 3,
    duration: 3000,
  },
};

export const Default = {};
