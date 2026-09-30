import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { BipThemeProvider } from '../core/src/theme';
import type { BipColorScheme, BipDensity, BipDir, BipThemeName } from '../core/src/types';
import { BRAND_PRESETS } from './brand-presets';

/**
 * Decorator global de Storybook (ver .storybook/preview.ts) — envuelve cada story en
 * `<bip-theme-provider>` leyendo los globals del toolbar (theme/colorScheme/density/
 * dir/brand). No se publica con la librería (vive en foundations/, ver CLAUDE.md §
 * Estructura objetivo). `componentWrapperDecorator` (Storybook Angular) asigna estos
 * `input()` vía `ComponentRef.setInput()` en cada cambio de story/globals.
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
      <ng-content />
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
