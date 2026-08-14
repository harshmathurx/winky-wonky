import { createMagneticButton } from '../packages/winky-wonky/src/components/magneticButton.js';
import { mount } from './utils/mount.js';

export default {
  title: 'Components/Magnetic Button',
  render: mount(createMagneticButton),
  parameters: { layout: 'padded' },
  argTypes: {
    magneticRange: { control: { type: 'range', min: 10, max: 200, step: 5 } },
    pullStrength: { control: { type: 'range', min: 0, max: 1, step: 0.05 } },
  },
  args: {
    magneticRange: 90,
    pullStrength: 0.45,
  },
};

export const Default = {};
