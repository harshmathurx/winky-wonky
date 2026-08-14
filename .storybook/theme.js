import { create } from 'storybook/theming';

export default create({
  base: 'dark',

  brandTitle: 'Winky Wonky',
  brandUrl: 'https://github.com/harshmathurx/winky-wonky',
  brandImage: '/favicon.svg',
  brandTarget: '_self',

  colorPrimary: '#8B5CF6',
  colorSecondary: '#6366F1',

  appBg: '#0A0A0F',
  appContentBg: '#0A0A0F',
  appPreviewBg: '#0A0A0F',
  appBorderColor: 'rgba(255, 255, 255, 0.08)',
  appBorderRadius: 12,

  fontBase: '"Inter", system-ui, sans-serif',
  fontCode: '"JetBrains Mono", monospace',

  textColor: '#F4F4F8',
  textInverseColor: '#0A0A0F',
  textMutedColor: '#9494A8',

  barTextColor: '#9494A8',
  barSelectedColor: '#8B5CF6',
  barHoverColor: '#8B5CF6',
  barBg: '#0A0A0F',

  buttonBg: '#1A1A24',
  buttonBorder: 'rgba(255, 255, 255, 0.08)',
  booleanBg: '#1A1A24',
  booleanSelectedBg: '#8B5CF6',

  inputBg: '#14141C',
  inputBorder: 'rgba(255, 255, 255, 0.08)',
  inputTextColor: '#F4F4F8',
  inputBorderRadius: 8,

  gridCellSize: 12,
});
