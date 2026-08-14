import { createElasticDragList } from '../packages/winky-wonky/src/components/elasticDragList.js';
import { mount } from './utils/mount.js';

export default {
  title: 'Components/Elastic Drag List',
  render: mount(createElasticDragList),
  parameters: { layout: 'padded' },
  argTypes: {
    ariaLabel: { control: 'text' },
  },
  args: {
    ariaLabel: 'Reorderable list',
  },
};

export const Default = {};
