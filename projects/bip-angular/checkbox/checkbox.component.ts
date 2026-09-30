import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  effect,
  inject,
  model,
  viewChild,
  input as ngInput,
} from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import { BipFormControlBase } from '@bip-design-systems/angular/core';
import type { BipSize } from '@bip-design-systems/angular/core';
import { BipCheckboxGroup } from './checkbox-group.component';

const BOX_SIZE_CLASS: Record<BipSize, string> = {
  sm: 'bip-checkbox-box--sm',
  md: 'bip-checkbox-box--md',
  lg: 'bip-checkbox-box--lg',
};

const ICON_SIZE_CLASS: Record<BipSize, string> = {
  sm: 'bip-checkbox-icon--sm',
  md: 'bip-checkbox-icon--md',
  lg: 'bip-checkbox-icon--lg',
};

const LABEL_SIZE_CLASS: Record<BipSize, string> = {
  sm: 'bip-checkbox-label--sm',
  md: 'bip-checkbox-label--md',
  lg: 'bip-checkbox-label--lg',
};

const HELPER_SIZE_CLASS: Record<BipSize, string> = {
  sm: 'bip-checkbox-helper--sm',
  md: 'bip-checkbox-helper--sm',
  lg: 'bip-checkbox-helper--lg',
};

const INDENT_SIZE_CLASS: Record<BipSize, string> = {
  sm: 'bip-checkbox-indent--sm',
  md: 'bip-checkbox-indent--md',
  lg: 'bip-checkbox-indent--lg',
};

/**
 * `size`/`disabled`/`error` caen en cascada desde `BipCheckboxGroup` (`inject(..., { optional:
 * true })`) cuando el checkbox no fija su propia prop — igual que `errorProp ?? groupCtx?.error`
 * en la referencia React. `disabled` es la excepción a "disabled solo viene del form" del resto
 * del Bloque 5: aquí también puede venir del grupo, así que se expone como signal propio en vez
 * de depender únicamente de `setDisabledState()`.
 */
@Component({
  selector: 'bip-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BipCheckbox extends BipFormControlBase implements ControlValueAccessor {
  private readonly group = inject(BipCheckboxGroup, { optional: true });
  private readonly nativeInput = viewChild<ElementRef<HTMLInputElement>>('nativeInput');

  readonly value = model(false);

  readonly size = ngInput<BipSize | undefined>(undefined);
  readonly label = ngInput<string>('');
  readonly helperText = ngInput<string>('');
  readonly error = ngInput<boolean | undefined>(undefined, { transform: booleanAttribute });
  readonly errorMessage = ngInput<string>('');
  readonly required = ngInput(false, { transform: booleanAttribute });
  readonly indeterminate = ngInput(false, { transform: booleanAttribute });
  readonly forceDisabled = ngInput(false, { transform: booleanAttribute, alias: 'disabled' });

  private onChange: (value: boolean) => void = () => {};

  protected readonly resolvedSize = computed(() => this.size() ?? this.group?.size() ?? 'md');
  protected readonly resolvedError = computed(() => this.error() ?? this.group?.error() ?? false);
  protected readonly resolvedDisabled = computed(
    () => this.forceDisabled() || this.disabled() || (this.group?.disabled() ?? false)
  );

  protected readonly hasVisibleMessage = computed(
    () => (this.resolvedError() && !!this.errorMessage()) || !!this.helperText()
  );
  protected readonly messageId = computed(() => (this.hasVisibleMessage() ? this.errorId : undefined));

  protected readonly boxClass = computed(() => {
    const classes = ['bip-checkbox-box', BOX_SIZE_CLASS[this.resolvedSize()]];
    if (this.resolvedError()) classes.push('bip-checkbox-box--error');
    if (this.resolvedDisabled()) classes.push('bip-checkbox-box--disabled');
    return classes.join(' ');
  });

  protected readonly iconClass = computed(() => `bip-checkbox-icon ${ICON_SIZE_CLASS[this.resolvedSize()]}`);

  protected readonly labelClass = computed(() => {
    const classes = [LABEL_SIZE_CLASS[this.resolvedSize()]];
    classes.push(this.resolvedError() ? 'bip-checkbox-label--error' : 'bip-checkbox-label--normal');
    if (this.resolvedDisabled()) classes.push('bip-checkbox-label--disabled');
    return classes.join(' ');
  });

  protected readonly helperClass = computed(
    () => `${HELPER_SIZE_CLASS[this.resolvedSize()]} ${INDENT_SIZE_CLASS[this.resolvedSize()]}`
  );

  constructor() {
    super();
    effect(() => {
      this.explicitError.set(this.resolvedError() ? this.errorMessage() || 'error' : null);
    });
    effect(() => {
      const el = this.nativeInput()?.nativeElement;
      if (el) el.indeterminate = this.indeterminate();
    });
  }

  writeValue(value: boolean): void {
    this.value.set(value ?? false);
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  protected onInputChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.value.set(checked);
    this.onChange(checked);
  }

  protected onBlur(): void {
    this.markTouched();
  }
}
