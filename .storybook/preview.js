import '../src/winky-wonky.css';
import './preview.css';
import { withThemeByDataAttribute } from '@storybook/addon-themes';

// Rotary Color Picker (by design) applies its palette straight to
// document.documentElement.style as inline `--winky-*` custom properties —
// real apps want that to persist, but inline styles always beat the
// data-theme attribute selectors the toolbar switcher below relies on, so
// without this a dialed palette would leak into every other story until a
// hard refresh. Clear any such overrides before each story renders.
function withCleanTheme(Story) {
  const root = document.documentElement;
  for (const prop of Array.from(root.style)) {
    if (prop.startsWith('--winky-')) root.style.removeProperty(prop);
  }
  return Story();
}

/** @type {import('@storybook/html-vite').Preview} */
const preview = {
  parameters: {
    layout: 'centered',
    backgrounds: { disable: true },
    docs: {
      toc: true,
    },
    options: {
      storySort: {
        method: 'alphabetical',
      },
    },
  },
  decorators: [
    withCleanTheme,
    withThemeByDataAttribute({
      themes: {
        Dark: 'dark',
        'Wes Anderson': 'anderson',
        'Tim Burton': 'burton',
      },
      defaultTheme: 'Dark',
      attributeName: 'data-theme',
    }),
  ],
};

export default preview;
