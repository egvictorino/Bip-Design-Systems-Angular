import { Pipe, type PipeTransform } from '@angular/core';
import { injectBipLocale } from '../i18n';
import { formatCurrency } from './currency';

/**
 * `{{ amount | bipCurrency }}` usa `locale.locale` del `BipLocale` activo como locale de
 * `Intl.NumberFormat` por defecto — pasar `currency`/`locale` explícitos los sobrescribe.
 * `pure: false` porque el locale activo llega vía DI (`injectBipLocale()`), no como binding
 * de entrada, así que un pipe puro no volvería a evaluar si solo cambia el locale.
 */
@Pipe({ name: 'bipCurrency', pure: false })
export class BipCurrencyPipe implements PipeTransform {
  private readonly locale = injectBipLocale();

  transform(value: number, currency?: string, locale?: string): string {
    return formatCurrency(value, { locale: locale ?? this.locale().locale, currency });
  }
}
