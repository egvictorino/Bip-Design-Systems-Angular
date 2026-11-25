import type { Preview } from '@storybook/angular-vite';
import { componentWrapperDecorator, moduleMetadata } from '@storybook/angular-vite';
import { BipThemeProvider } from '../projects/bip-angular/core/src/theme';
import {
  BRAND_PRESETS,
  BRAND_PRESET_KEYS,
} from '../projects/bip-angular/foundations/brand-presets';
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
      // El addon inyecta su propia instancia de axe-core en CADA iframe de preview y la
      // corre automáticamente al renderizar cada story (confirmado: `window.axe` existe ya
      // al cargar `/iframe.html?...` directo, sin manager) — eso choca con
      // `visual/a11y-browser.spec.ts`, que inyecta y corre axe-core por su cuenta vía
      // `@axe-core/playwright`: axe-core solo permite un `run()` en vuelo por página
      // ("Axe is already running"). `manual: true` apaga esa corrida automática; el panel
      // de accesibilidad de Storybook sigue disponible bajo demanda (botón "Run tests").
      manual: true,
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
    // Envuelve cada story en <bip-theme-provider> leyendo los globals del toolbar. Va como
    // template (no como componente con <ng-content>) para que la story quede DENTRO del
    // provider también en la cadena de DI: así `BipOverlay` encuentra `BipThemeContext` y los
    // paneles heredan theme/colorScheme/density/dir. El <div> pinta `--color-surface-2` porque
    // el provider es `display: contents` y el body del iframe se quedaría blanco en dark.
    moduleMetadata({ imports: [BipThemeProvider] }),
    componentWrapperDecorator(
      (story) => `
        <bip-theme-provider
          [theme]="bipSbTheme"
          [colorScheme]="bipSbColorScheme"
          [density]="bipSbDensity"
          [dir]="bipSbDir"
          [tokens]="bipSbTokens"
        >
          <div style="min-height: 100vh; padding: var(--space-4); background: var(--color-surface-2);">${story}</div>
        </bip-theme-provider>
      `,
      ({ globals }) => ({
        bipSbTheme: globals['theme'],
        bipSbColorScheme: globals['colorScheme'],
        bipSbDensity: globals['density'],
        bipSbDir: globals['dir'],
        bipSbTokens: BRAND_PRESETS[globals['brand']]?.tokens ?? {},
      })
    ),
  ],
};

export default preview;
