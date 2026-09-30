import { Pipe, type PipeTransform } from '@angular/core';
import { injectBipLocale } from '../i18n';
import { formatDate } from './date-format';

/**
 * `{{ date | bipDate }}` / `{{ date | bipDate:{ month: 'long' } }}` — mismo criterio que
 * `BipCurrencyPipe`: `locale.locale` del `BipLocale` activo por defecto, `pure: false` porque
 * el locale llega por DI en vez de por binding.
 */
@Pipe({ name: 'bipDate', pure: false })
export class BipDatePipe implements PipeTransform {
  private readonly locale = injectBipLocale();

  transform(value: Date, options?: Intl.DateTimeFormatOptions, locale?: string): string {
    return formatDate(value, { ...options, locale: locale ?? this.locale().locale });
  }
}
