import { InjectionToken } from '@angular/core';
import type { BipThemeConfig } from './theme.types';

/**
 * Defaults a nivel app para `<bip-theme-provider>`/`[bipTheme]` — cada input de ambos
 * hosts cae a `appDefaults.<campo>` cuando el consumidor no lo declara explícitamente en
 * el template, y de ahí al hardcoded de la librería (p. ej. `theme: 'square'`).
 */
export const BIP_THEME_DEFAULTS = new InjectionToken<BipThemeConfig>('BIP_THEME_DEFAULTS');

/**
 * `provideBipTheme({ defaultTheme: 'rounded', storageKey: 'acme-theme' })` en
 * `app.config.ts` (`providers: [provideBipTheme(...)]`) — evita repetir la misma config
 * en cada `<bip-theme-provider>` de la app cuando solo hay un root provider.
 */
export function provideBipTheme(config: BipThemeConfig) {
  return { provide: BIP_THEME_DEFAULTS, useValue: config };
}
