import { createWobblySwitch } from '../packages/winky-wonky/src/components/wobblySwitch.js';
import { mount } from './utils/mount.js';

export default {
  title: 'Components/Wobbly Switch',
  render: mount(createWobblySwitch),
  argTypes: {
    labelText: { control: 'text' },
    initialState: { control: 'boolean' },
    springPower: { control: { type: 'range', min: 1.0, max: 1.8, step: 0.05 } },
  },
  args: {
    labelText: 'Enable Physics',
    initialState: false,
    springPower: 1.3,
  },
};

export const Default = {};
