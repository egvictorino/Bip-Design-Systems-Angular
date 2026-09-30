import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  inject,
  input as ngInput,
} from '@angular/core';
import { BipIdGenerator } from '@bip-design-systems/angular/core';
import type { BipSize } from '@bip-design-systems/angular/core';
import { BipRadioGroup } from './radio-group.component';

const RING_SIZE_CLASS: Record<BipSize, string> = {
  sm: 'bip-radio-ring--sm',
  md: 'bip-radio-ring--md',
  lg: 'bip-radio-ring--lg',
};

const DOT_SIZE_CLASS: Record<BipSize, string> = {
  sm: 'bip-radio-dot--sm',
  md: 'bip-radio-dot--md',
  lg: 'bip-radio-dot--lg',
};

const LABEL_SIZE_CLASS: Record<BipSize, string> = {
  sm: 'bip-radio-label--sm',
  md: 'bip-radio-label--md',
  lg: 'bip-radio-label--lg',
};

const HELPER_SIZE_CLASS: Record<BipSize, string> = {
  sm: 'bip-radio-helper--sm',
  md: 'bip-radio-helper--sm',
  lg: 'bip-radio-helper--lg',
};

const INDENT_SIZE_CLASS: Record<BipSize, string> = {
  sm: 'bip-radio-indent--sm',
  md: 'bip-radio-indent--md',
  lg: 'bip-radio-indent--lg',
};

/**
 * Debe usarse dentro de `<bip-radio-group>` — el grupo arbitra la exclusividad (mismo `name`
 * nativo, un solo valor seleccionado). `inject(BipRadioGroup)` sin `optional` lanza con un
 * mensaje explícito si falta, en vez de degradar en silencio a un radio no funcional (ver
 * CLAUDE.md, patrón de compound components).
 *
 * Por diseño, el radio **no** lleva `aria-invalid` (a diferencia de Input/Checkbox) — el estado
 * de error del grupo ya se comunica vía el `aria-describedby` del `<fieldset>` hacia el mensaje
 * de error, y `aria-invalid` en cada radio individual sería ruido redundante para lectores de
 * pantalla en un grupo de opciones mutuamente excluyentes.
 */
@Component({
  selector: 'bip-radio',
  templateUrl: './radio.component.html',
  styleUrl: './radio.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BipRadio {
  protected readonly group = inject(BipRadioGroup, { optional: true });
  private readonly idGenerator = inject(BipIdGenerator);

  constructor() {
    if (!this.group) {
      throw new Error('<bip-radio> debe usarse dentro de <bip-radio-group>');
    }
  }

  readonly value = ngInput.required<string>();
  readonly size = ngInput<BipSize | undefined>(undefined);
  readonly label = ngInput<string>('');
  readonly helperText = ngInput<string>('');
  readonly error = ngInput<boolean | undefined>(undefined, { transform: booleanAttribute });
  readonly errorMessage = ngInput<string>('');
  readonly required = ngInput(false, { transform: booleanAttribute });
  readonly forceDisabled = ngInput(false, { transform: booleanAttribute, alias: 'disabled' });

  protected readonly fieldId = this.idGenerator.next('bip-radio');
  protected readonly errorId = `${this.fieldId}-message`;

  protected readonly checked = computed(() => this.group!.value() === this.value());
  protected readonly resolvedSize = computed(() => this.size() ?? this.group!.size() ?? 'md');
  protected readonly resolvedError = computed(() => this.error() ?? this.group!.error() ?? false);
  protected readonly resolvedDisabled = computed(
    () => this.forceDisabled() || (this.group!.disabled() ?? false)
  );

  protected readonly hasVisibleMessage = computed(
    () => (this.resolvedError() && !!this.errorMessage()) || !!this.helperText()
  );

  protected readonly ringClass = computed(() => {
    const classes = ['bip-radio-ring', RING_SIZE_CLASS[this.resolvedSize()]];
    if (this.resolvedError()) classes.push('bip-radio-ring--error');
    if (this.resolvedDisabled()) classes.push('bip-radio-ring--disabled');
    return classes.join(' ');
  });

  protected readonly dotClass = computed(() => {
    const classes = ['bip-radio-dot', DOT_SIZE_CLASS[this.resolvedSize()]];
    if (this.resolvedError()) classes.push('bip-radio-dot--error');
    return classes.join(' ');
  });

  protected readonly labelClass = computed(() => {
    const classes = [LABEL_SIZE_CLASS[this.resolvedSize()]];
    classes.push(this.resolvedError() ? 'bip-radio-label--error' : 'bip-radio-label--normal');
    if (this.resolvedDisabled()) classes.push('bip-radio-label--disabled');
    return classes.join(' ');
  });

  protected readonly helperClass = computed(
    () => `${HELPER_SIZE_CLASS[this.resolvedSize()]} ${INDENT_SIZE_CLASS[this.resolvedSize()]}`
  );

  protected onChange(): void {
    this.group!.select(this.value());
  }
}
