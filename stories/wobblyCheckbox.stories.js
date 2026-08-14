import { createWobblyCheckbox } from '../packages/winky-wonky/src/components/wobblyCheckbox.js';
import { mount } from './utils/mount.js';

export default {
  title: 'Components/Wobbly Checkbox',
  render: mount(createWobblyCheckbox),
  argTypes: {
    labelText: { control: 'text' },
    isJitterEnabled: { control: 'boolean' },
  },
  args: {
    labelText: 'Indie Cinema Mode',
    isJitterEnabled: true,
  },
};

export const Default = {};
