import type { Preview } from '@storybook/angular-vite';
import { componentWrapperDecorator } from '@storybook/angular-vite';
import { BRAND_PRESET_KEYS } from '../projects/bip-angular/foundations/brand-presets';
import { BipStorybookThemeDecorator } from '../projects/bip-angular/foundations/theme-decorator.component';
// Hoja de estilos global de la librería (tokens/primitives/themes/density/rtl/base, en ese
// orden fijo — ver bip.css) — sin este import, ninguna `var(--color-*)`/`var(--space-*)`/
// `var(--radius-*)` que usan los componentes y las demos de Foundations resuelve a nada:
// cada story se renderiza sin estilos, sin romper ni avisar (una custom property no
// resuelta no es un error de CSS, el navegador simplemente no aplica esa declaración).
import '../projects/bip-angular/styles/bip.css';

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
