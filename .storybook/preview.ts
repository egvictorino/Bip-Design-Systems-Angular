import type { Preview } from '@storybook/angular-vite';
import { componentWrapperDecorator } from '@storybook/angular-vite';
import { BRAND_PRESET_KEYS } from '../projects/bip-angular/foundations/brand-presets';
import { BipStorybookThemeDecorator } from '../projects/bip-angular/foundations/theme-decorator.component';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo',
    },
  },
  // Globals de theming (Bloque 2) — el decorator de abajo envuelve cada story en
  // <bip-theme-provider> leyendo estos valores del toolbar.
  globalTypes: {
    theme: {
      description: 'Tema',
      toolbar: {
        title: 'Theme',
        icon: 'component',
        items: ['square', 'rounded'],
        dynamicTitle: true,
      },
    },
    colorScheme: {
      description: 'Esquema de color',
      toolbar: {
        title: 'Color scheme',
        icon: 'circlehollow',
        items: ['light', 'dark', 'system'],
        dynamicTitle: true,
      },
    },
    density: {
      description: 'Densidad',
      toolbar: {
        title: 'Density',
        icon: 'grow',
        items: ['comfortable', 'compact'],
        dynamicTitle: true,
      },
    },
    dir: {
      description: 'Dirección',
      toolbar: {
        title: 'Dir',
        icon: 'transfer',
        items: ['ltr', 'rtl'],
        dynamicTitle: true,
      },
    },
    brand: {
      description: 'Marca',
      toolbar: {
        title: 'Brand',
        icon: 'paintbrush',
        items: BRAND_PRESET_KEYS,
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'square',
    colorScheme: 'light',
    density: 'comfortable',
    dir: 'ltr',
    brand: 'default',
  },
  decorators: [
    componentWrapperDecorator(BipStorybookThemeDecorator, (storyContext) => ({
      theme: storyContext.globals['theme'],
      colorScheme: storyContext.globals['colorScheme'],
      density: storyContext.globals['density'],
      dir: storyContext.globals['dir'],
      brand: storyContext.globals['brand'],
    })),
  ],
};

export default preview;
