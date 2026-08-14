/** @type {import('@storybook/html-vite').StorybookConfig} */
const config = {
  stories: ['../stories/**/*.mdx', '../stories/**/*.stories.js'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-themes'],
  framework: {
    name: '@storybook/html-vite',
    options: {},
  },
  staticDirs: ['./public'],
  core: {
    disableTelemetry: true,
  },
  docs: {
    defaultName: 'Docs',
  },
};

export default config;
