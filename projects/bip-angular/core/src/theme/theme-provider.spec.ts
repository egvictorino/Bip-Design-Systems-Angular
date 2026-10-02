import { Component } from '@angular/core';
import { fireEvent, render, screen } from '@testing-library/angular';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BipThemeProvider } from './theme-provider.component';
import { injectThemeControls } from './inject-theme-controls';

/**
 * Puerto de ThemeProvider.test.tsx (React) a Vitest + @testing-library/angular. `theme`/
 * `colorScheme`/`density`/`dir`/`tokens`/`radius`/`cssVars` se estampan en el propio host
 * `<bip-theme-provider>` (display: contents — ver theme-provider.component.css), así que
 * "el wrapper" de los tests React es aquí `screen.getByTestId('child').parentElement`.
 */

type MatchMediaMock = { fireChange: (matches: boolean) => void };

function mockMatchMedia(matchesDark: boolean): MatchMediaMock {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const mql = {
    matches: matchesDark,
    media: '(prefers-color-scheme: dark)',
    addEventListener: (_type: string, cb: (event: MediaQueryListEvent) => void) =>
      listeners.add(cb),
    removeEventListener: (_type: string, cb: (event: MediaQueryListEvent) => void) =>
      listeners.delete(cb),
  };
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(mql) as unknown as typeof window.matchMedia);
  return {
    fireChange: (matches: boolean) => {
      mql.matches = matches;
      listeners.forEach((cb) => cb({ matches } as MediaQueryListEvent));
    },
  };
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('BipThemeProvider', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-color-scheme');
    vi.unstubAllGlobals();
    window.localStorage.clear();
  });

  it('stamps data-theme and data-color-scheme on its host', async () => {
    await render(
      `<bip-theme-provider theme="rounded" colorScheme="dark">
         <span data-testid="child">contenido</span>
       </bip-theme-provider>`,
      { imports: [BipThemeProvider] }
    );
    const wrapper = screen.getByTestId('child').parentElement as HTMLElement;
    expect(wrapper).toHaveAttribute('data-theme', 'rounded');
    expect(wrapper).toHaveAttribute('data-color-scheme', 'dark');
  });

  it('defaults colorScheme to light when omitted', async () => {
    await render(
      `<bip-theme-provider theme="square"><span data-testid="child">contenido</span></bip-theme-provider>`,
      { imports: [BipThemeProvider] }
    );
    const wrapper = screen.getByTestId('child').parentElement as HTMLElement;
    expect(wrapper).toHaveAttribute('data-color-scheme', 'light');
  });

  describe('tokens — eje de marca', () => {
    it('applies a flat override as an inline CSS var on the host', async () => {
      await render(
        `<bip-theme-provider theme="square" [tokens]="tokens">
           <span data-testid="child">contenido</span>
         </bip-theme-provider>`,
        {
          imports: [BipThemeProvider],
          componentProperties: { tokens: { colorPrimary: '#e2007a' } },
        }
      );
      const wrapper = screen.getByTestId('child').parentElement as HTMLElement;
      expect(wrapper.style.getPropertyValue('--color-primary')).toBe('#e2007a');
    });

    it('scheme-specific override wins over the flat override for the active scheme', async () => {
      await render(
        `<bip-theme-provider theme="square" colorScheme="dark" [tokens]="tokens">
           <span data-testid="child">contenido</span>
         </bip-theme-provider>`,
        {
          imports: [BipThemeProvider],
          componentProperties: {
            tokens: { colorPrimary: '#e2007a', dark: { colorPrimary: '#00c2a8' } },
          },
        }
      );
      const wrapper = screen.getByTestId('child').parentElement as HTMLElement;
      expect(wrapper.style.getPropertyValue('--color-primary')).toBe('#00c2a8');
    });

    it('cssVars escape hatch wins over tokens', async () => {
      await render(
        `<bip-theme-provider theme="square" [tokens]="tokens" [cssVars]="cssVars">
           <span data-testid="child">contenido</span>
         </bip-theme-provider>`,
        {
          imports: [BipThemeProvider],
          componentProperties: {
            tokens: { colorPrimary: '#e2007a' },
            cssVars: { '--color-primary': '#111111' },
          },
        }
      );
      const wrapper = screen.getByTestId('child').parentElement as HTMLElement;
      expect(wrapper.style.getPropertyValue('--color-primary')).toBe('#111111');
    });

    it('nested providers merge — child only overrides what it declares', async () => {
      await render(
        `<bip-theme-provider theme="square" [tokens]="outerTokens">
           <bip-theme-provider theme="square" [tokens]="innerTokens">
             <span data-testid="child">contenido</span>
           </bip-theme-provider>
         </bip-theme-provider>`,
        {
          imports: [BipThemeProvider],
          componentProperties: {
            outerTokens: { colorPrimary: '#e2007a', colorDanger: '#ff0000' },
            innerTokens: { colorPrimary: '#00c2a8' },
          },
        }
      );
      const inner = screen.getByTestId('child').parentElement as HTMLElement;
      expect(inner.style.getPropertyValue('--color-primary')).toBe('#00c2a8');
      expect(inner.style.getPropertyValue('--color-danger')).toBe('#ff0000');
    });
  });

  describe('radius — overrides de los tokens semánticos', () => {
    it('applies each radius key to its semantic CSS var', async () => {
      await render(
        `<bip-theme-provider theme="square" [radius]="radius">
           <span data-testid="child">contenido</span>
         </bip-theme-provider>`,
        {
          imports: [BipThemeProvider],
          componentProperties: { radius: { field: '12px', container: '24px' } },
        }
      );
      const wrapper = screen.getByTestId('child').parentElement as HTMLElement;
      expect(wrapper.style.getPropertyValue('--radius-field')).toBe('12px');
      expect(wrapper.style.getPropertyValue('--radius-container')).toBe('24px');
    });

    it('cssVars wins over radius when both target the same custom property', async () => {
      await render(
        `<bip-theme-provider theme="square" [radius]="radius" [cssVars]="cssVars">
           <span data-testid="child">contenido</span>
         </bip-theme-provider>`,
        {
          imports: [BipThemeProvider],
          componentProperties: {
            radius: { field: '12px' },
            cssVars: { '--radius-field': '999px' },
          },
        }
      );
      const wrapper = screen.getByTestId('child').parentElement as HTMLElement;
      expect(wrapper.style.getPropertyValue('--radius-field')).toBe('999px');
    });
  });

  describe('density — quinto eje, misma mecánica que radius/focusRing/motion', () => {
    it('sin density, no estampa data-density (cae al default CSS)', async () => {
      await render(
        `<bip-theme-provider theme="square"><span data-testid="child">contenido</span></bip-theme-provider>`,
        { imports: [BipThemeProvider] }
      );
      expect(screen.getByTestId('child').parentElement).not.toHaveAttribute('data-density');
    });

    it('estampa data-density cuando se fija explícitamente', async () => {
      await render(
        `<bip-theme-provider theme="square" density="compact">
           <span data-testid="child">contenido</span>
         </bip-theme-provider>`,
        { imports: [BipThemeProvider] }
      );
      expect(screen.getByTestId('child').parentElement).toHaveAttribute('data-density', 'compact');
    });

    it('un provider anidado sin density propio hereda el del padre', async () => {
      await render(
        `<bip-theme-provider theme="square" density="compact">
           <bip-theme-provider theme="square">
             <span data-testid="child">contenido</span>
           </bip-theme-provider>
         </bip-theme-provider>`,
        { imports: [BipThemeProvider] }
      );
      expect(screen.getByTestId('child').parentElement).toHaveAttribute('data-density', 'compact');
    });

    it('spacing aplica cada clave a su var semántica de density.css', async () => {
      await render(
        `<bip-theme-provider theme="square" [spacing]="spacing">
           <span data-testid="child">contenido</span>
         </bip-theme-provider>`,
        {
          imports: [BipThemeProvider],
          componentProperties: { spacing: { controlXMd: '2rem', controlYMd: '1rem' } },
        }
      );
      const wrapper = screen.getByTestId('child').parentElement as HTMLElement;
      expect(wrapper.style.getPropertyValue('--space-control-x-md')).toBe('2rem');
      expect(wrapper.style.getPropertyValue('--space-control-y-md')).toBe('1rem');
    });
  });

  describe('dir — mismo tratamiento que density', () => {
    it('sin dir, no estampa el atributo dir (cae al default del navegador)', async () => {
      await render(
        `<bip-theme-provider theme="square"><span data-testid="child">contenido</span></bip-theme-provider>`,
        { imports: [BipThemeProvider] }
      );
      expect(screen.getByTestId('child').parentElement).not.toHaveAttribute('dir');
    });

    it('estampa dir cuando se fija explícitamente', async () => {
      await render(
        `<bip-theme-provider theme="square" dir="rtl">
           <span data-testid="child">contenido</span>
         </bip-theme-provider>`,
        { imports: [BipThemeProvider] }
      );
      expect(screen.getByTestId('child').parentElement).toHaveAttribute('dir', 'rtl');
    });

    it('un provider anidado sin dir propio hereda el del padre', async () => {
      await render(
        `<bip-theme-provider theme="square" dir="rtl">
           <bip-theme-provider theme="square">
             <span data-testid="child">contenido</span>
           </bip-theme-provider>
         </bip-theme-provider>`,
        { imports: [BipThemeProvider] }
      );
      expect(screen.getByTestId('child').parentElement).toHaveAttribute('dir', 'rtl');
    });
  });

  describe('modo no-controlado + system + persistencia', () => {
    beforeEach(() => {
      window.localStorage.clear();
      mockMatchMedia(false);
    });

    it('theme/colorScheme son no-controlados por defecto (defaultTheme/defaultColorScheme)', async () => {
      await render(
        `<bip-theme-provider defaultTheme="rounded" defaultColorScheme="dark">
           <span data-testid="child">contenido</span>
         </bip-theme-provider>`,
        { imports: [BipThemeProvider] }
      );
      const wrapper = screen.getByTestId('child').parentElement as HTMLElement;
      expect(wrapper).toHaveAttribute('data-theme', 'rounded');
      expect(wrapper).toHaveAttribute('data-color-scheme', 'dark');
    });

    it("colorScheme='system' resuelve a light/dark y nunca estampa 'system' en el DOM", async () => {
      mockMatchMedia(true);
      await render(
        `<bip-theme-provider theme="square" colorScheme="system">
           <span data-testid="child">contenido</span>
         </bip-theme-provider>`,
        { imports: [BipThemeProvider] }
      );
      await flush();
      expect(screen.getByTestId('child').parentElement).toHaveAttribute(
        'data-color-scheme',
        'dark'
      );
    });
  });
});

/**
 * `injectThemeControls()` resuelve el `BipThemeContext` más cercano subiendo por el
 * NodeInjector del elemento que lo llama — igual que cualquier `inject()`. Eso exige que el
 * componente que lo use sea un DESCENDIENTE real de `<bip-theme-provider>` en el árbol
 * renderizado, no solo un componente cuyo *template* contenga uno en alguna parte (el
 * `<bip-theme-provider>` todavía no existe cuando el padre se construye). Por eso el botón
 * vive en su propio componente hijo, proyectado dentro de `<bip-theme-provider>` — paridad
 * con `useThemeControls()` probado con un botón dentro de `<ThemeProvider>` en React.
 */
@Component({
  selector: 'bip-theme-toggle-button',
  template: `<button type="button" (click)="toggle()">toggle</button>`,
})
class ThemeToggleButton {
  // injectThemeControls() llama inject() por debajo — como cualquier inject(), solo es
  // válido en un contexto de inyección (constructor/field initializer), nunca dentro de un
  // manejador de eventos. Se captura una vez aquí y se usa desde el template.
  private readonly themeControls = injectThemeControls();

  toggle(): void {
    this.themeControls.toggleColorScheme();
  }
}

@Component({
  selector: 'bip-theme-controls-test-host',
  template: `
    <bip-theme-provider theme="square" defaultColorScheme="light">
      <bip-theme-toggle-button />
      <span data-testid="child">contenido</span>
    </bip-theme-provider>
  `,
  imports: [BipThemeProvider, ThemeToggleButton],
})
class ThemeControlsTestHost {}

describe('injectThemeControls()', () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it('toggles resolvedColorScheme and updates the DOM on click', async () => {
    await render(ThemeControlsTestHost);
    const wrapper = screen.getByTestId('child').parentElement as HTMLElement;
    expect(wrapper).toHaveAttribute('data-color-scheme', 'light');

    fireEvent.click(screen.getByRole('button', { name: 'toggle' }));
    await flush();

    expect(wrapper).toHaveAttribute('data-color-scheme', 'dark');
  });
});
