import { Component, computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { enUS } from './en-us.locale';
import { esMX } from './es-mx.locale';
import { mergeLocale } from './merge-locale';
import { injectBipLocale, provideBipLocale } from './provide-bip-locale';

describe('injectBipLocale()', () => {
  it('devuelve esMX cuando nadie llamó a provideBipLocale()', () => {
    TestBed.resetTestingModule();
    const locale = TestBed.runInInjectionContext(() => injectBipLocale());
    expect(locale()).toBe(esMX);
  });

  it('devuelve el locale fijo pasado a provideBipLocale()', () => {
    TestBed.configureTestingModule({ providers: [provideBipLocale(enUS)] });
    const locale = TestBed.runInInjectionContext(() => injectBipLocale());
    expect(locale()).toBe(enUS);
  });

  it('acepta un Signal<BipLocale> ya reactivo y lo devuelve sin envolver', () => {
    const preference = signal<'es' | 'en'>('es');
    const localeSignal = computed(() => (preference() === 'es' ? esMX : enUS));
    TestBed.configureTestingModule({ providers: [provideBipLocale(localeSignal)] });
    const locale = TestBed.runInInjectionContext(() => injectBipLocale());

    expect(locale()).toBe(esMX);
    preference.set('en');
    expect(locale()).toBe(enUS);
  });

  it('un provider hijo gana sobre el de un ancestro', () => {
    @Component({
      selector: 'bip-locale-child-test',
      template: '',
      providers: [provideBipLocale(enUS)],
    })
    class ChildTest {
      readonly locale = injectBipLocale();
    }

    TestBed.configureTestingModule({ providers: [provideBipLocale(esMX)] });
    const fixture = TestBed.createComponent(ChildTest);
    expect(fixture.componentInstance.locale()).toBe(enUS);
  });
});

describe('mergeLocale()', () => {
  it('sin override, devuelve el mismo objeto base', () => {
    expect(mergeLocale(esMX)).toBe(esMX);
  });

  it('mergea una sección parcial sin perder el resto de sus claves', () => {
    const merged = mergeLocale(esMX, { alert: { close: 'Custom close' } });
    expect(merged.alert.close).toBe('Custom close');
    expect(merged.modal.close).toBe(esMX.modal.close);
  });

  it('no muta el locale base', () => {
    mergeLocale(esMX, { alert: { close: 'Custom close' } });
    expect(esMX.alert.close).toBe('Cerrar alerta');
  });
});

describe('provideBipLocale() dentro de un componente inyectable', () => {
  it('injectBipLocale() dentro de un componente lee el provider más cercano', () => {
    @Component({
      selector: 'bip-locale-consumer-test',
      template: '',
      providers: [provideBipLocale(enUS)],
    })
    class ConsumerTest {
      private readonly locale = injectBipLocale();
      readonly closeLabel = () => this.locale().modal.close;
    }

    const fixture = TestBed.createComponent(ConsumerTest);
    expect(fixture.componentInstance.closeLabel()).toBe('Close modal');
  });
});
