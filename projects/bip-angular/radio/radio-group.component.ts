import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  effect,
  input,
  model,
} from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import { BipFormControlBase } from '@bip-design-systems/angular/core';
import type { BipSize } from '@bip-design-systems/angular/core';

const LEGEND_SIZE_CLASS: Record<BipSize, string> = {
  sm: 'bip-radio-group-legend--sm',
  md: 'bip-radio-group-legend--md',
  lg: 'bip-radio-group-legend--lg',
};

const HELPER_SIZE_CLASS: Record<BipSize, string> = {
  sm: 'bip-radio-group-helper--sm',
  md: 'bip-radio-group-helper--md',
  lg: 'bip-radio-group-helper--lg',
};

/**
 * A diferencia de `BipCheckboxGroup` (puramente contextual), `BipRadioGroup` SÍ es un
 * `ControlValueAccessor` — decisión explícita de este bloque (ver CLAUDE.md): el valor
 * seleccionado es uno solo entre todas las opciones, así que vive naturalmente en el grupo
 * (igual que `mat-radio-group`), no en cada `BipRadio` individual. Cada `BipRadio` hijo se
 * inyecta el grupo (`inject(BipRadioGroup)`, sin `optional`) y lanza si no lo encuentra — no
 * tiene sentido un radio aislado sin grupo que arbitre la exclusividad.
 */
@Component({
  selector: 'bip-radio-group',
  templateUrl: './radio-group.component.html',
  styleUrl: './radio-group.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BipRadioGroup extends BipFormControlBase implements ControlValueAccessor {
  readonly value = model<string | null>(null);

  readonly label = input<string>('');
  readonly helperText = input<string>('');
  readonly error = input(false, { transform: booleanAttribute });
  readonly errorMessage = input<string>('');
  readonly size = input<BipSize>('md');

  /** Compartido por todos los `BipRadio` hijos vía el atributo `name` nativo. */
  readonly name = this.fieldId;

  private onChange: (value: string | null) => void = () => {};

  protected readonly hasVisibleMessage = computed(
    () => (this.error() && !!this.errorMessage()) || !!this.helperText()
  );

  protected readonly legendClass = computed(
    () =>
      `bip-radio-group-legend ${LEGEND_SIZE_CLASS[this.size()]} ${
        this.error() ? 'bip-radio-group-legend--error' : 'bip-radio-group-legend--default'
      }`
  );

  protected readonly helperClass = computed(() => HELPER_SIZE_CLASS[this.size()]);

  constructor() {
    super();
    effect(() => {
      this.explicitError.set(this.error() ? this.errorMessage() || 'error' : null);
    });
  }

  writeValue(value: string | null): void {
    this.value.set(value ?? null);
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  /** Llamado por cada `BipRadio` hijo al seleccionarse. */
  select(value: string): void {
    this.value.set(value);
    this.onChange(value);
    this.markTouched();
  }
}
