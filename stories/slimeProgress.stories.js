import { createSlimeProgress } from '../packages/winky-wonky/src/components/slimeProgress.js';
import { mount } from './utils/mount.js';

export default {
  title: 'Components/Slime Progress',
  render: mount(createSlimeProgress),
  parameters: { layout: 'padded' },
  argTypes: {
    initialProgress: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    meltDuration: { control: { type: 'range', min: 0.3, max: 3, step: 0.1 } },
  },
  args: {
    initialProgress: 35,
    meltDuration: 1.5,
  },
};

export const Default = {};
