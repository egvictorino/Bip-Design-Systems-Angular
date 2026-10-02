import {
  InjectionToken,
  type Provider,
  type Signal,
  inject,
  isSignal,
  signal,
} from '@angular/core';
import { esMX } from './es-mx.locale';
import type { BipLocale } from './locale.types';

/**
 * Sin ancestro que llame a `provideBipLocale()`, el factory por defecto entrega `esMX` —
 * equivalente al fallback `useContext(LocaleContext) ?? esMX` de React (rendear fuera de un
 * provider es legítimo, no un error).
 */
export const BIP_LOCALE = new InjectionToken<Signal<BipLocale>>('BIP_LOCALE', {
  providedIn: 'root',
  factory: () => signal(esMX),
});

/**
 * Registra el diccionario activo a nivel app (`providers: [provideBipLocale(enUS)]`) o de
 * un subárbol (`providers` de una ruta/componente). Acepta un `BipLocale` fijo o un
 * `Signal<BipLocale>` ya reactivo (p. ej. un `computed()` sobre la preferencia del usuario) —
 * para overrides parciales, componer con `mergeLocale(esMX, overrides)` antes de pasarlo aquí.
 */
export function provideBipLocale(locale: BipLocale | Signal<BipLocale>): Provider {
  return {
    provide: BIP_LOCALE,
    useValue: isSignal(locale) ? locale : signal(locale),
  };
}

/** Lee el diccionario activo — reactivo a `provideBipLocale()` del ancestro más cercano. */
export function injectBipLocale(): Signal<BipLocale> {
  return inject(BIP_LOCALE);
}
