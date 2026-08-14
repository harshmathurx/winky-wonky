import { createGroovySlider } from '../src/components/groovySlider.js';
import { mount } from './utils/mount.js';

export default {
  title: 'Components/Groovy Slider',
  render: mount(createGroovySlider),
  parameters: { layout: 'padded' },
  argTypes: {
    initialValue: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    notchCount: { control: { type: 'range', min: 2, max: 20, step: 1 } },
    waveAmplitude: { control: { type: 'range', min: 0, max: 40, step: 1 } },
    snapThreshold: { control: { type: 'range', min: 0, max: 10, step: 0.5 } },
  },
  args: {
    initialValue: 20,
    notchCount: 8,
    waveAmplitude: 18,
    snapThreshold: 3.5,
  },
};

export const Default = {};
