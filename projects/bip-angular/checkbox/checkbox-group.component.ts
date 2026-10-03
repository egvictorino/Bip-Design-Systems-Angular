import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  inject,
  input,
} from '@angular/core';
import { BipIdGenerator } from '@bip-design-systems/angular/core';
import type { BipSize } from '@bip-design-systems/angular/core';

const LEGEND_SIZE_CLASS: Record<BipSize, string> = {
  sm: 'bip-checkbox-group-legend--sm',
  md: 'bip-checkbox-group-legend--md',
  lg: 'bip-checkbox-group-legend--lg',
};

const HELPER_SIZE_CLASS: Record<BipSize, string> = {
  sm: 'bip-checkbox-group-helper--sm',
  md: 'bip-checkbox-group-helper--md',
  lg: 'bip-checkbox-group-helper--lg',
};

/**
 * `<fieldset>` de agrupación puramente visual/contextual — no es un `ControlValueAccessor`
 * (cada `BipCheckbox` hijo mantiene su propio valor booleano e independiente, igual que la
 * referencia React). Se inyecta a sí mismo (`inject(BipCheckboxGroup, { optional: true })`
 * desde `BipCheckbox`) para que `size`/`disabled`/`error` cascadeen cuando el hijo no los fija
 * explícitamente.
 */
@Component({
  selector: 'bip-checkbox-group',
  templateUrl: './checkbox-group.component.html',
  styleUrl: './checkbox-group.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BipCheckboxGroup {
  private readonly idGenerator = inject(BipIdGenerator);

  readonly label = input<string>('');
  readonly helperText = input<string>('');
  readonly error = input(false, { transform: booleanAttribute });
  readonly errorMessage = input<string>('');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly size = input<BipSize>('md');

  protected readonly groupId = this.idGenerator.next('bip-checkbox-group');
  protected readonly messageId = `${this.groupId}-message`;

  protected readonly hasVisibleMessage = computed(
    () => (this.error() && !!this.errorMessage()) || !!this.helperText()
  );

  protected readonly legendClass = computed(
    () =>
      `bip-checkbox-group-legend ${LEGEND_SIZE_CLASS[this.size()]} ${this.error() ? 'bip-checkbox-group-legend--error' : 'bip-checkbox-group-legend--default'}`
  );

  protected readonly helperClass = computed(() => HELPER_SIZE_CLASS[this.size()]);
}
