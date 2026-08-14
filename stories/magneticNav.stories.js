import { createMagneticNav } from '../packages/winky-wonky/src/components/magneticNav.js';
import { mount } from './utils/mount.js';

export default {
  title: 'Components/Magnetic Nav',
  render: mount(createMagneticNav),
  parameters: { layout: 'padded' },
  argTypes: {
    label: { control: 'text' },
    activeIndex: { control: { type: 'range', min: 0, max: 3, step: 1 } },
    magneticRange: { control: { type: 'range', min: 10, max: 150, step: 5 } },
    pullStrength: { control: { type: 'range', min: 0, max: 1, step: 0.05 } },
  },
  args: {
    label: 'Main navigation',
    activeIndex: 0,
    magneticRange: 50,
    pullStrength: 0.2,
  },
};

export const Default = {};
