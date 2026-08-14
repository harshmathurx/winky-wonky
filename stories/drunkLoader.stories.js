import { createDrunkLoader } from '../packages/winky-wonky/src/components/drunkLoader.js';
import { mount } from './utils/mount.js';

export default {
  title: 'Components/Drunk Loader',
  render: mount(createDrunkLoader),
  argTypes: {
    baseSpeed: { control: { type: 'range', min: 0.5, max: 10, step: 0.1 } },
    wobbleSeverity: { control: { type: 'range', min: 0, max: 15, step: 0.5 } },
    drunkenness: { control: { type: 'range', min: 0, max: 8, step: 0.1 } },
  },
  args: {
    baseSpeed: 3.5,
    wobbleSeverity: 4,
    drunkenness: 2.8,
  },
};

export const Default = {};
