import { createHingeDropdown } from '../src/components/hingeDropdown.js';
import { mount } from './utils/mount.js';

export default {
  title: 'Components/Hinge Dropdown',
  render: mount(createHingeDropdown),
  argTypes: {
    label: { control: 'text' },
    hingeOrigin: { control: 'select', options: ['top left', 'top right', 'top center'] },
    swingSpeed: { control: { type: 'range', min: 0.5, max: 3, step: 0.1 } },
  },
  args: {
    label: 'Select Curiosity',
    hingeOrigin: 'top left',
    swingSpeed: 1.8,
  },
};

export const Default = {};
