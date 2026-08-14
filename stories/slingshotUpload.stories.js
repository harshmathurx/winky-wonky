import { createSlingshotUpload } from '../packages/winky-wonky/src/components/slingshotUpload.js';
import { mount } from './utils/mount.js';

export default {
  title: 'Components/Slingshot Upload',
  render: mount(createSlingshotUpload),
  parameters: { layout: 'padded' },
  argTypes: {
    bandWidth: { control: { type: 'range', min: 1, max: 10, step: 0.5 } },
    launchSpeed: { control: { type: 'range', min: 0.1, max: 2, step: 0.05 } },
  },
  args: {
    bandWidth: 4,
    launchSpeed: 0.65,
  },
};

export const Default = {};
