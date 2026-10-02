import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { BipFormControlBase } from './form-control-base';

@Component({
  selector: 'bip-form-control-base-test',
  template: `
    <input
      [attr.id]="fieldId"
      [attr.aria-invalid]="hasError() || null"
      [attr.aria-describedby]="errorId"
      [value]="value()"
      (input)="onInput($event)"
      (blur)="onBlur()"
    />
    <span [id]="errorId">{{ hasError() ? 'error' : '' }}</span>
  `,
})
class TestControl extends BipFormControlBase {
  readonly value = signal('');
  private onChange: (value: string) => void = () => {};

  writeValue(value: string): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.value.set(value);
    this.onChange(value);
  }

  onBlur(): void {
    this.markTouched();
  }
}

@Component({
  selector: 'bip-form-control-base-host-test',
  imports: [TestControl, ReactiveFormsModule],
  template: `<bip-form-control-base-test [formControl]="formControl" />`,
})
class HostTest {
  readonly formControl = new FormControl('', { validators: Validators.required });
}

describe('BipFormControlBase', () => {
  it('genera ids de campo/helper/error estables y derivados entre sí', () => {
    const control = TestBed.runInInjectionContext(() => new TestControl());
    expect(control.helperId).toBe(`${control.fieldId}-helper`);
    expect(control.errorId).toBe(`${control.fieldId}-error`);
  });

  it('arranca sin error ni touched', () => {
    const control = TestBed.runInInjectionContext(() => new TestControl());
    expect(control.hasError()).toBe(false);
    expect(control.touched()).toBe(false);
  });

  it('setDisabledState() actualiza disabled()', () => {
    const control = TestBed.runInInjectionContext(() => new TestControl());
    control.setDisabledState(true);
    expect(control.disabled()).toBe(true);
  });

  it('con un FormControl inválido, hasError() se activa recién tras tocar el campo (blur)', async () => {
    await render(HostTest);
    const input = screen.getByRole('textbox');

    expect(input).not.toHaveAttribute('aria-invalid');

    input.dispatchEvent(new Event('blur', { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('writeValue() vía NgControl refleja el valor inicial del FormControl', async () => {
    const host = new HostTest();
    host.formControl.setValue('inicial');
    await render(HostTest, { componentProperties: { formControl: host.formControl } });

    expect(screen.getByRole('textbox')).toHaveValue('inicial');
  });

  /**
   * Regresión: `hasError` leía `control.invalid`/`control.touched` dentro de un `computed()`
   * sin ninguna dependencia reactiva de por medio — un `markAllAsTouched()` programático (el
   * patrón típico al enviar un formulario) no tocaba el signal `_touched()` propio del
   * control, así que el computed nunca se recalculaba y `aria-invalid` se quedaba desfasado.
   */
  it('markAllAsTouched() en el FormControl (sin blur) también activa hasError()', async () => {
    const { fixture } = await render(HostTest);
    const input = screen.getByRole('textbox');
    expect(input).not.toHaveAttribute('aria-invalid');

    fixture.componentInstance.formControl.markAllAsTouched();
    await new Promise((resolve) => setTimeout(resolve, 0));
    fixture.detectChanges();

    expect(input).toHaveAttribute('aria-invalid', 'true');
  });
});
