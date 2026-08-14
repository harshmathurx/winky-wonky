import { createTiltSlider } from '../packages/winky-wonky/src/components/tiltSlider.js';
import { mount } from './utils/mount.js';

export default {
  title: 'Components/Tilt Slider',
  render: mount(createTiltSlider),
  parameters: { layout: 'padded' },
  argTypes: {
    initialValue: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    gravity: { control: { type: 'range', min: 0, max: 1, step: 0.05 } },
    maxTilt: { control: { type: 'range', min: 0, max: 45, step: 1 } },
    springLag: { control: { type: 'range', min: 0, max: 1, step: 0.05 } },
  },
  args: {
    initialValue: 50,
    gravity: 0.4,
    maxTilt: 15,
    springLag: 0.2,
  },
};

export const Default = {};
