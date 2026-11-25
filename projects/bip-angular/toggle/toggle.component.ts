import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  effect,
  model,
} from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import { BipFormControlBase } from '@bip-design-systems/angular/core';
import type { BipSize } from '@bip-design-systems/angular/core';
import { input as ngInput } from '@angular/core';

const TRACK_SIZE_CLASS: Record<BipSize, string> = {
  sm: 'bip-toggle-track--sm',
  md: 'bip-toggle-track--md',
  lg: 'bip-toggle-track--lg',
};

const THUMB_SIZE_CLASS: Record<BipSize, string> = {
  sm: 'bip-toggle-thumb--sm',
  md: 'bip-toggle-thumb--md',
  lg: 'bip-toggle-thumb--lg',
};

const LABEL_SIZE_CLASS: Record<BipSize, string> = {
  sm: 'bip-toggle-label--sm',
  md: 'bip-toggle-label--md',
  lg: 'bip-toggle-label--lg',
};

const HELPER_SIZE_CLASS: Record<BipSize, string> = {
  sm: 'bip-toggle-helper--sm',
  md: 'bip-toggle-helper--sm',
  lg: 'bip-toggle-helper--lg',
};

const INDENT_SIZE_CLASS: Record<BipSize, string> = {
  sm: 'bip-toggle-indent--sm',
  md: 'bip-toggle-indent--md',
  lg: 'bip-toggle-indent--lg',
};

/** `role="switch"` sobre un `input[type=checkbox]` nativo — mismo patrón visual que Checkbox. */
@Component({
  selector: 'bip-toggle',
  templateUrl: './toggle.component.html',
  styleUrl: './toggle.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BipToggle extends BipFormControlBase implements ControlValueAccessor {
  readonly value = model(false);

  readonly size = ngInput<BipSize>('md');
  readonly label = ngInput<string>('');
  readonly helperText = ngInput<string>('');
  readonly error = ngInput(false, { transform: booleanAttribute });
  readonly errorMessage = ngInput<string>('');
  readonly required = ngInput(false, { transform: booleanAttribute });

  private onChange: (value: boolean) => void = () => {};

  protected readonly hasVisibleMessage = computed(
    () => (this.error() && !!this.errorMessage()) || !!this.helperText()
  );
  protected readonly messageId = computed(() =>
    this.hasVisibleMessage() ? this.errorId : undefined
  );

  protected readonly trackClass = computed(() => {
    const classes = ['bip-toggle-track', TRACK_SIZE_CLASS[this.size()]];
    if (this.error()) classes.push('bip-toggle-track--error');
    if (this.disabled()) classes.push('bip-toggle-track--disabled');
    return classes.join(' ');
  });

  protected readonly thumbClass = computed(
    () => `bip-toggle-thumb ${THUMB_SIZE_CLASS[this.size()]}`
  );

  protected readonly labelClass = computed(() => {
    const classes = [LABEL_SIZE_CLASS[this.size()]];
    classes.push(this.error() ? 'bip-toggle-label--error' : 'bip-toggle-label--normal');
    if (this.disabled()) classes.push('bip-toggle-label--disabled');
    return classes.join(' ');
  });

  protected readonly helperClass = computed(
    () => `${HELPER_SIZE_CLASS[this.size()]} ${INDENT_SIZE_CLASS[this.size()]}`
  );

  constructor() {
    super();
    effect(() => {
      this.explicitError.set(this.error() ? this.errorMessage() || 'error' : null);
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
