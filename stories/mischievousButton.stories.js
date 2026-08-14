import { createMischievousButtons } from '../src/components/mischievousButton.js';
import { mount } from './utils/mount.js';

export default {
  title: 'Components/Mischievous Buttons',
  render: mount(createMischievousButtons),
  parameters: { layout: 'padded' },
  argTypes: {
    dodgePower: { control: { type: 'range', min: 0, max: 1.5, step: 0.05 } },
    maxDodgeRange: { control: { type: 'range', min: 0, max: 150, step: 5 } },
    isDodgeEnabled: { control: 'boolean' },
  },
  args: {
    dodgePower: 0.8,
    maxDodgeRange: 75,
    isDodgeEnabled: true,
  },
};

export const Default = {};
