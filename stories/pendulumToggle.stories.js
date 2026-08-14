import { createPendulumToggle } from '../packages/winky-wonky/src/components/pendulumToggle.js';
import { mount } from './utils/mount.js';

export default {
  title: 'Components/Pendulum Toggle',
  render: mount(createPendulumToggle),
  argTypes: {
    initialState: { control: 'boolean' },
    damping: { control: { type: 'range', min: 0.1, max: 1, step: 0.05 } },
    swingTime: { control: { type: 'range', min: 0.3, max: 3, step: 0.1 } },
  },
  args: {
    initialState: false,
    damping: 0.5,
    swingTime: 1.4,
  },
};

export const Default = {};
