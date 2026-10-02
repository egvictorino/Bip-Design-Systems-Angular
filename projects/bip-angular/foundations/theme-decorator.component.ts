import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { BipThemeProvider } from '../core/src/theme';
import type { BipColorScheme, BipDensity, BipDir, BipThemeName } from '../core/src/types';
import { BRAND_PRESETS } from './brand-presets';

/**
 * Decorator global de Storybook (ver .storybook/preview.ts) — envuelve cada story en
 * `<bip-theme-provider>` leyendo los globals del toolbar (theme/colorScheme/density/
 * dir/brand). No se publica con la librería (vive en foundations/, ver CLAUDE.md §
 * Estructura). `componentWrapperDecorator` (Storybook Angular) asigna estos
 * `input()` vía `ComponentRef.setInput()` en cada cambio de story/globals.
 *
 * `<bip-theme-provider>` es `display: contents` (no pinta caja propia, ver
 * theme-provider.component.css) — sin un elemento real debajo que pinte un fondo, el body
 * del iframe de Storybook se queda en blanco/transparente incluso con colorScheme='dark',
 * así que cualquier story en dark terminaría con texto claro sobre fondo blanco (falso
 * positivo de contraste en `visual/a11y-browser.spec.ts`, y una captura engañosa en
 * `visual/theme-matrix.spec.ts`). El `<div>` interior pinta `--color-surface-2` — hereda el
 * valor ya resuelto del provider porque vive dentro de él, no por fuera.
 */
@Component({
  selector: 'bip-storybook-theme-decorator',
  template: `
    <bip-theme-provider
      [theme]="theme()"
      [colorScheme]="colorScheme()"
      [density]="density()"
      [dir]="dir()"
      [tokens]="brandTokens()"
    >
      <div style="min-height: 100vh; padding: var(--space-4); background: var(--color-surface-2);">
        <ng-content />
      </div>
    </bip-theme-provider>
  `,
  imports: [BipThemeProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BipStorybookThemeDecorator {
  readonly theme = input<BipThemeName>('square');
  readonly colorScheme = input<BipColorScheme>('light');
  readonly density = input<BipDensity>('comfortable');
  readonly dir = input<BipDir>('ltr');
  readonly brand = input<string>('default');

  protected readonly brandTokens = computed(() => BRAND_PRESETS[this.brand()]?.tokens ?? {});
}
