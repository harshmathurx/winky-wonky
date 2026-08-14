import { createRotaryColorPicker } from '../src/components/rotaryColorPicker.js';
import { mount } from './utils/mount.js';

export default {
  title: 'Components/Rotary Color Picker',
  render: mount(createRotaryColorPicker),
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story:
          'Dialing a hole applies its palette to `document.documentElement` — it changes this whole page, not just the widget. That is by design (it is a theme switcher), so expect the canvas background to shift.',
      },
    },
  },
  argTypes: {
    ariaLabel: { control: 'text' },
  },
  args: {
    ariaLabel: 'Color palette selector',
  },
};

export const Default = {};
