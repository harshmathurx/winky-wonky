import { createWobblyRadioGroup } from '../packages/winky-wonky/src/components/wobblyRadioGroup.js';
import { mount } from './utils/mount.js';

export default {
  title: 'Components/Wobbly Radio Group',
  render: mount(createWobblyRadioGroup),
  argTypes: {
    ariaLabel: { control: 'text' },
    initialIndex: { control: { type: 'range', min: 0, max: 3, step: 1 } },
  },
  args: {
    ariaLabel: 'Selection',
    initialIndex: 0,
  },
};

export const Default = {};
