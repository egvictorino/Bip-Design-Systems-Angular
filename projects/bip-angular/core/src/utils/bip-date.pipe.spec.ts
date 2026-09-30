import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { provideBipLocale } from '../i18n';
import { enUS } from '../i18n/en-us.locale';
import { BipDatePipe } from './bip-date.pipe';

@Component({
  selector: 'bip-date-pipe-test',
  template: `{{ date | bipDate }}`,
  imports: [BipDatePipe],
})
class DatePipeTest {
  readonly date = new Date(2026, 5, 15);
}

describe('BipDatePipe', () => {
  it('usa el locale del BipLocale activo por defecto', () => {
    TestBed.configureTestingModule({ providers: [provideBipLocale(enUS)] });
    const fixture = TestBed.createComponent(DatePipeTest);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe(
      new Intl.DateTimeFormat('en-US').format(new Date(2026, 5, 15))
    );
  });

  it('acepta Intl.DateTimeFormatOptions y un locale explícito', () => {
    const pipe = TestBed.runInInjectionContext(() => new BipDatePipe());
    const date = new Date(2026, 5, 15);
    expect(pipe.transform(date, { month: 'long', day: 'numeric' }, 'en-US')).toBe(
      new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric' }).format(date)
    );
  });
});
