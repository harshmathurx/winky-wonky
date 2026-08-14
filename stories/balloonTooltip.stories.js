import { createBalloonTooltip } from '../packages/winky-wonky/src/components/balloonTooltip.js';
import { mount } from './utils/mount.js';

export default {
  title: 'Components/Balloon Tooltip',
  render: mount(createBalloonTooltip),
  argTypes: {
    text: { control: 'text' },
    stringLength: { control: { type: 'range', min: 10, max: 80, step: 1 } },
  },
  args: {
    text: 'Curiosity Box!',
    stringLength: 25,
  },
};

export const Default = {};
