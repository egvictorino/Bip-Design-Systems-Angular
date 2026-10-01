import { ChangeDetectionStrategy, Component, booleanAttribute, computed, effect, model, signal } from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import { BipFormControlBase } from '@bip-design-systems/angular/core';
import type { BipSize } from '@bip-design-systems/angular/core';
import { input as ngInput } from '@angular/core';

export type BipSelectVariant = 'outlined' | 'filled' | 'bare';

export interface BipSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface BipSelectOptionGroup {
  label: string;
  options: BipSelectOption[];
  disabled?: boolean;
}

const LABEL_SIZE_CLASS: Record<BipSize, string> = {
  sm: 'bip-select-label--sm',
  md: 'bip-select-label--md',
  lg: 'bip-select-label--lg',
};

const HELPER_SIZE_CLASS: Record<BipSize, string> = {
  sm: 'bip-select-helper--sm',
  md: 'bip-select-helper--sm',
  lg: 'bip-select-helper--lg',
};

const VARIANT_CLASS: Record<BipSelectVariant, string> = {
  outlined: 'bip-select--outlined',
  filled: 'bip-select--filled',
  bare: 'bip-select--bare',
};

const SIZE_CLASS: Record<BipSize, string> = {
  sm: 'bip-select--sm',
  md: 'bip-select--md',
  lg: 'bip-select--lg',
};

/** Selector nativo (`<select>`) — misma decisión que la referencia React, sin reimplementar un listbox custom. */
@Component({
  selector: 'bip-select',
  templateUrl: './select.component.html',
  styleUrl: './select.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'bip-select-wrapper',
    '[class.bip-select-wrapper--full-width]': 'fullWidth()',
  },
})
export class BipSelect extends BipFormControlBase implements ControlValueAccessor {
  readonly value = model('');

  readonly variant = ngInput<BipSelectVariant>('outlined');
  readonly size = ngInput<BipSize>('md');
  readonly label = ngInput<string>('');
  readonly helperText = ngInput<string>('');
  readonly error = ngInput(false, { transform: booleanAttribute });
  readonly errorMessage = ngInput<string>('');
  readonly fullWidth = ngInput(false, { transform: booleanAttribute });
  readonly required = ngInput(false, { transform: booleanAttribute });
  readonly placeholder = ngInput<string>('');
  readonly options = ngInput<BipSelectOption[]>([]);
  readonly groups = ngInput<BipSelectOptionGroup[]>([]);

  protected readonly focused = signal(false);

  private onChange: (value: string) => void = () => {};

  protected readonly hasVisibleMessage = computed(
    () => (this.error() && !!this.errorMessage()) || !!this.helperText()
  );
  protected readonly messageId = computed(() => (this.hasVisibleMessage() ? this.errorId : undefined));

  protected readonly labelClass = computed(() => {
    const classes = [LABEL_SIZE_CLASS[this.size()]];
    classes.push(
      this.error()
        ? 'bip-select-label--error'
        : this.focused()
          ? 'bip-select-label--focused'
          : 'bip-select-label--normal'
    );
    if (this.disabled()) classes.push('bip-select-label--disabled');
    return classes.join(' ');
  });

  protected readonly helperClass = computed(() => HELPER_SIZE_CLASS[this.size()]);

  protected readonly selectClass = computed(() => {
    const classes = [VARIANT_CLASS[this.variant()], SIZE_CLASS[this.size()]];
    if (this.error()) classes.push('bip-select--error');
    return classes.join(' ');
  });

  protected readonly chevronClass = computed(() => {
    const classes = ['bip-select-chevron'];
    classes.push(
      this.error()
        ? 'bip-select-chevron--error'
        : this.focused()
          ? 'bip-select-chevron--focused'
          : 'bip-select-chevron--normal'
    );
    if (this.disabled()) classes.push('bip-select-chevron--disabled');
    return classes.join(' ');
  });

  constructor() {
    super();
    effect(() => {
      this.explicitError.set(this.error() ? this.errorMessage() || 'error' : null);
    });
  }

  writeValue(value: string): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  protected onSelectChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.value.set(value);
    this.onChange(value);
  }

  protected onFocus(): void {
    this.focused.set(true);
  }

  protected onBlur(): void {
    this.focused.set(false);
    this.markTouched();
  }
}
