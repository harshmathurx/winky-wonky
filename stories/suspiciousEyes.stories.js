import { createSuspiciousEyes } from '../src/components/suspiciousEyes.js';
import { mount } from './utils/mount.js';

export default {
  title: 'Components/Suspicious Eyes',
  render: mount(createSuspiciousEyes),
  argTypes: {
    trackingSensitivity: { control: { type: 'range', min: 1, max: 20, step: 1 } },
    shockDuration: { control: { type: 'range', min: 200, max: 4000, step: 100 } },
  },
  args: {
    trackingSensitivity: 7,
    shockDuration: 1500,
  },
};

export const Default = {};
