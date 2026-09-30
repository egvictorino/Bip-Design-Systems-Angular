import { Directive } from '@angular/core';
import { BIP_THEME_HOST_BINDINGS, BIP_THEME_PROVIDERS, BipThemeHost } from './theme-base';

/**
 * `[bipTheme]` — misma lógica que `<bip-theme-provider>` (theme-provider.component.ts,
 * ambos extienden BipThemeHost), pero como directiva de atributo para aplicar theming a un
 * elemento del template del consumidor en vez de envolverlo en un elemento nuevo:
 *
 * ```html
 * <section bipTheme dir="rtl" [tokens]="{ colorPrimary: '#e2007a' }">…</section>
 * ```
 */
@Directive({
  selector: '[bipTheme]',
  providers: BIP_THEME_PROVIDERS,
  host: BIP_THEME_HOST_BINDINGS,
})
export class BipThemeDirective extends BipThemeHost {}
