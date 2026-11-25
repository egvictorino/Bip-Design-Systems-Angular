import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  effect,
  model,
  signal,
  input as ngInput,
} from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import { BipFormControlBase, injectBipLocale } from '@bip-design-systems/angular/core';
import type { BipSize } from '@bip-design-systems/angular/core';

export type BipInputVariant = 'outlined' | 'filled' | 'bare';
export type BipInputType = 'text' | 'email' | 'password' | 'tel' | 'url';

const LABEL_SIZE_CLASS: Record<BipSize, string> = {
  sm: 'bip-input-label--sm',
  md: 'bip-input-label--md',
  lg: 'bip-input-label--lg',
};

const HELPER_SIZE_CLASS: Record<BipSize, string> = {
  sm: 'bip-input-helper--sm',
  md: 'bip-input-helper--md',
  lg: 'bip-input-helper--lg',
};

const VARIANT_CLASS: Record<BipInputVariant, string> = {
  outlined: 'bip-input--outlined',
  filled: 'bip-input--filled',
  bare: 'bip-input--bare',
};

const SIZE_CLASS: Record<BipSize, string> = {
  sm: 'bip-input--sm',
  md: 'bip-input--md',
  lg: 'bip-input--lg',
};

/**
 * Encapsula label + input + helper/error (selector de elemento, no de atributo) — estructura
 * compuesta, no una simple mejora de un `<input>` nativo. `startIcon`/`endIcon` se exponen como
 * flags booleanos: el contenido real se proyecta vía `<ng-content select="...">`, la referencia
 * React pasaba `ReactNode`, aquí el consumidor marca el slot correspondiente con un atributo y
 * el flag solo controla el padding.
 */
@Component({
  selector: 'bip-input',
  templateUrl: './input.component.html',
  styleUrl: './input.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'bip-input-wrapper',
    '[class.bip-input-wrapper--full-width]': 'fullWidth()',
  },
})
export class BipInput extends BipFormControlBase implements ControlValueAccessor {
  protected readonly locale = injectBipLocale();

  readonly value = model('');

  readonly variant = ngInput<BipInputVariant>('outlined');
  readonly size = ngInput<BipSize>('md');
  readonly type = ngInput<BipInputType>('text');
  readonly label = ngInput<string>('');
  readonly helperText = ngInput<string>('');
  readonly error = ngInput(false, { transform: booleanAttribute });
  readonly errorMessage = ngInput<string>('');
  readonly fullWidth = ngInput(false, { transform: booleanAttribute });
  readonly required = ngInput(false, { transform: booleanAttribute });
  readonly readonly = ngInput(false, { transform: booleanAttribute });
  readonly clearable = ngInput(false, { transform: booleanAttribute });
  readonly hasStartIcon = ngInput(false, { transform: booleanAttribute, alias: 'startIcon' });
  readonly hasEndIcon = ngInput(false, { transform: booleanAttribute, alias: 'endIcon' });

  protected readonly focused = signal(false);
  protected readonly showPassword = signal(false);

  private onChange: (value: string) => void = () => {};

  protected readonly isPassword = computed(() => this.type() === 'password');
  protected readonly actualType = computed<BipInputType | 'text'>(() =>
    this.isPassword() && this.showPassword() ? 'text' : this.type()
  );
  protected readonly showClear = computed(() => this.clearable() && this.value() !== '');
  protected readonly hasEndAdornment = computed(
    () => this.hasEndIcon() || this.showClear() || this.isPassword()
  );
  protected readonly hasVisibleMessage = computed(
    () => (this.error() && !!this.errorMessage()) || !!this.helperText()
  );
  protected readonly messageId = computed(() =>
    this.hasVisibleMessage() ? this.errorId : undefined
  );

  protected readonly labelClass = computed(() => {
    const classes = [LABEL_SIZE_CLASS[this.size()]];
    classes.push(
      this.error()
        ? 'bip-input-label--error'
        : this.focused()
          ? 'bip-input-label--focused'
          : 'bip-input-label--normal'
    );
    if (this.disabled()) classes.push('bip-input-label--disabled');
    return classes.join(' ');
  });

  protected readonly helperClass = computed(() => HELPER_SIZE_CLASS[this.size()]);

  protected readonly inputClass = computed(() => {
    const classes = [VARIANT_CLASS[this.variant()], SIZE_CLASS[this.size()]];
    if (this.error()) classes.push('bip-input--error');
    if (this.hasStartIcon()) classes.push('bip-input--has-start-icon');
    if (this.hasEndAdornment()) classes.push('bip-input--has-end-adornment');
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

  protected onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
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

  protected togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value);
  }

  protected clear(): void {
    this.value.set('');
    this.onChange('');
  }
}
