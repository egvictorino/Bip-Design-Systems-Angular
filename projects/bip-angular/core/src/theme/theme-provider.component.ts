import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BIP_THEME_HOST_BINDINGS, BIP_THEME_PROVIDERS, BipThemeHost } from './theme-base';

/**
 * `<bip-theme-provider>` — paridad con `<ThemeProvider>` de React. `display: contents`
 * (ver theme-provider.component.css) evita que el wrapper agregue una caja al layout; los
 * atributos data-theme/data-color-scheme/data-density/dir y las CSS vars resueltas se
 * estampan directamente en el propio host (`<bip-theme-provider>`), no en un div interno
 * — ver BIP_THEME_HOST_BINDINGS en theme-base.ts.
 *
 * Misma lógica que `[bipTheme]` (theme.directive.ts): ambos extienden BipThemeHost. Usa el
 * componente cuando quieras envolver contenido nuevo (`<bip-theme-provider dir="rtl">…`);
 * usa la directiva para aplicar theming a un elemento que ya existe en tu template.
 */
@Component({
  selector: 'bip-theme-provider',
  template: `<ng-content />`,
  styleUrl: './theme-provider.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: BIP_THEME_PROVIDERS,
  host: BIP_THEME_HOST_BINDINGS,
})
export class BipThemeProvider extends BipThemeHost {}
