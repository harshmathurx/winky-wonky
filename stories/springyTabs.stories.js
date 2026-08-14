import { createSpringyTabs } from '../packages/winky-wonky/src/components/springyTabs.js';
import { mount } from './utils/mount.js';

export default {
  title: 'Components/Springy Tabs',
  render: mount(createSpringyTabs),
  parameters: { layout: 'padded' },
  argTypes: {
    activeIndex: { control: { type: 'range', min: 0, max: 2, step: 1 } },
  },
  args: {
    activeIndex: 0,
  },
};

export const Default = {};
