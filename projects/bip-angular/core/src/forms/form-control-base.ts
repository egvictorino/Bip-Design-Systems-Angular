import { Directive, computed, inject, signal } from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import { NgControl } from '@angular/forms';
import { BipIdGenerator } from '../a11y';

/**
 * Plomería transversal de `ControlValueAccessor` que cada control de formulario del Bloque 5
 * en adelante (Input, Checkbox, Radio, Select...) extiende. Deliberadamente NO posee el
 * signal `value` en sí — cada control tiene un tipo de valor distinto (`string`, `boolean`,
 * `Date | null`, `string[]`...) y su propio `model()`/`[(value)]`; imponer aquí un
 * `value = model<T>(default)` genérico exigiría un valor por defecto antes de que el
 * constructor del subtipo pueda fijarlo, lo cual es frágil. Lo que sí es genuinamente
 * transversal (disabled, touched, cómputo de error, ids de label/helper/error, wiring de
 * NgControl) vive aquí.
 *
 * Un subtipo típico:
 * ```ts
 * class BipInput extends BipFormControlBase implements ControlValueAccessor {
 *   readonly value = model('');
 *   writeValue(value: string): void { this.value.set(value ?? ''); }
 *   registerOnChange(fn: (value: string) => void): void { this.onChange = fn; }
 *   onInput(value: string): void {
 *     this.value.set(value);
 *     this.onChange(value);
 *   }
 * }
 * ```
 */
@Directive()
export abstract class BipFormControlBase implements Pick<
  ControlValueAccessor,
  'registerOnTouched' | 'setDisabledState'
> {
  protected readonly ngControl = inject(NgControl, { optional: true, self: true });
  private readonly idGenerator = inject(BipIdGenerator);

  private readonly _disabled = signal(false);
  private readonly _touched = signal(false);
  private onTouchedCallback: () => void = () => {};

  /** Fijado por Reactive/Template-driven Forms vía `setDisabledState()`. */
  readonly disabled = this._disabled.asReadonly();
  /** `true` después del primer `markTouched()` (típicamente en `blur`). */
  readonly touched = this._touched.asReadonly();

  readonly fieldId = this.idGenerator.next('bip-field');
  readonly helperId = `${this.fieldId}-helper`;
  readonly errorId = `${this.fieldId}-error`;

  /**
   * `error() || null` explícito (prop del componente) tiene prioridad; si no hay uno, cae al
   * estado de validación de `NgControl` — pero solo cuenta como error una vez que el control
   * fue tocado, para no mostrar rojo antes de que el usuario interactúe.
   */
  protected readonly explicitError = signal<string | null>(null);

  readonly hasError = computed<boolean>(() => {
    if (this.explicitError()) return true;
    const control = this.ngControl?.control;
    if (!control) return false;
    return control.invalid === true && (control.touched || this._touched());
  });

  constructor() {
    if (this.ngControl) {
      // El subtipo concreto SÍ implementa `writeValue`/`registerOnChange` (ver doc de clase) —
      // la base no los declara porque no posee el signal `value` que necesitarían.
      this.ngControl.valueAccessor = this as unknown as ControlValueAccessor;
    }
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedCallback = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._disabled.set(isDisabled);
  }

  /** Llamar desde el handler de `blur` del control concreto. */
  protected markTouched(): void {
    this._touched.set(true);
    this.onTouchedCallback();
  }
}
