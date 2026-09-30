import type { Preview } from '@storybook/angular-vite';

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
  // Globals de theming: se activan (decorator real) a partir del Bloque 2.
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
        items: ['default'],
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
};

export default preview;
