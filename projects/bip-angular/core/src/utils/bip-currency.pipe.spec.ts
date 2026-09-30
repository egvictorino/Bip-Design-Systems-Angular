import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { provideBipLocale } from '../i18n';
import { enUS } from '../i18n/en-us.locale';
import { BipCurrencyPipe } from './bip-currency.pipe';

@Component({
  selector: 'bip-currency-pipe-test',
  template: `{{ amount | bipCurrency }}`,
  imports: [BipCurrencyPipe],
})
class CurrencyPipeTest {
  readonly amount = 1500;
}

describe('BipCurrencyPipe', () => {
  it('usa el locale del BipLocale activo por defecto', () => {
    TestBed.configureTestingModule({ providers: [provideBipLocale(enUS)] });
    const fixture = TestBed.createComponent(CurrencyPipeTest);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe(
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MXN' }).format(1500)
    );
  });

  it('un locale/currency explícito sobrescribe el del contexto', () => {
    const pipe = TestBed.runInInjectionContext(() => new BipCurrencyPipe());
    expect(pipe.transform(1500, 'USD', 'en-US')).toBe(
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(1500)
    );
  });
});
