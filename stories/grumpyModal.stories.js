import { createGrumpyModalTrigger } from '../packages/winky-wonky/src/components/grumpyModal.js';
import { mount } from './utils/mount.js';

export default {
  title: 'Components/Grumpy Modal',
  render: mount(createGrumpyModalTrigger),
  argTypes: {
    headerText: { control: 'text' },
    bodyText: { control: 'text' },
    buttonText: { control: 'text' },
  },
  args: {
    headerText: 'Peculiar Notice!',
    buttonText: 'Dismiss Me',
  },
};

export const Default = {};
