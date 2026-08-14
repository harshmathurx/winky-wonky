import { createRippleButton } from '../src/components/rippleButton.js';
import { mount } from './utils/mount.js';

export default {
  title: 'Components/Ripple Button',
  render: mount(createRippleButton),
  argTypes: {
    label: { control: 'text' },
    maxRipples: { control: { type: 'range', min: 1, max: 5, step: 1 } },
  },
  args: {
    label: 'Press Me',
    maxRipples: 1,
  },
};

export const Default = {};
