import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  effect,
  model,
  numberAttribute,
  signal,
} from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import { BipFormControlBase, injectBipLocale } from '@bip-design-systems/angular/core';
import type { BipSize } from '@bip-design-systems/angular/core';
import { input as ngInput } from '@angular/core';

export type BipNumberInputVariant = 'outlined' | 'filled' | 'bare';

const INPUT_SIZE_CLASS: Record<BipSize, string> = {
  sm: 'bip-number-input--sm',
  md: 'bip-number-input--md',
  lg: 'bip-number-input--lg',
};

const LABEL_SIZE_CLASS: Record<BipSize, string> = {
  sm: 'bip-number-input-label--sm',
  md: 'bip-number-input-label--md',
  lg: 'bip-number-input-label--lg',
};

const HELPER_SIZE_CLASS: Record<BipSize, string> = {
  sm: 'bip-number-input-helper--sm',
  md: 'bip-number-input-helper--sm',
  lg: 'bip-number-input-helper--lg',
};

const STEP_BTN_SIZE_CLASS: Record<BipSize, string> = {
  sm: 'bip-number-input-step-btn--sm',
  md: 'bip-number-input-step-btn--md',
  lg: 'bip-number-input-step-btn--lg',
};

const PREFIX_SIZE_CLASS: Record<BipSize, string> = {
  sm: 'bip-number-input-prefix--sm',
  md: 'bip-number-input-prefix--md',
  lg: 'bip-number-input-prefix--lg',
};

const SUFFIX_SIZE_CLASS: Record<BipSize, string> = {
  sm: 'bip-number-input-suffix--sm',
  md: 'bip-number-input-suffix--md',
  lg: 'bip-number-input-suffix--lg',
};

const INPUT_PREFIX_SIZE_CLASS: Record<BipSize, string> = {
  sm: 'bip-number-input--prefix-sm',
  md: 'bip-number-input--prefix-md',
  lg: 'bip-number-input--prefix-lg',
};

const INPUT_SUFFIX_SIZE_CLASS: Record<BipSize, string> = {
  sm: 'bip-number-input--suffix-sm',
  md: 'bip-number-input--suffix-md',
  lg: 'bip-number-input--suffix-lg',
};

function parseValue(raw: string): number | null {
  if (raw.trim() === '') return null;
  const n = Number(raw);
  return isNaN(n) ? null : n;
}

/**
 * `value` es `number | null` (CVA) — internamente se edita como texto (`rawValue`) para permitir
 * estados intermedios que `Number()` no resolvería a un número útil todavía (p. ej. "-" solo, o
 * un signo antes del primer dígito); se reconcilia al salir del campo (blur: clamp + formateo a
 * `decimals`). Un `effect()` mantiene `rawValue` sincronizado con `value()` cuando cambia desde
 * fuera (binding inicial, `writeValue`, `set()` externo) — pero nunca mientras el campo tiene
 * foco, para no arrebatarle al usuario lo que está escribiendo.
 */
@Component({
  selector: 'bip-number-input',
  templateUrl: './number-input.component.html',
  styleUrl: './number-input.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'bip-number-input-wrapper',
    '[class.bip-number-input-wrapper--full-width]': 'fullWidth()',
  },
})
export class BipNumberInput extends BipFormControlBase implements ControlValueAccessor {
  protected readonly locale = injectBipLocale();

  readonly value = model<number | null>(null);

  readonly variant = ngInput<BipNumberInputVariant>('outlined');
  readonly size = ngInput<BipSize>('md');
  readonly label = ngInput<string>('');
  readonly helperText = ngInput<string>('');
  readonly error = ngInput(false, { transform: booleanAttribute });
  readonly errorMessage = ngInput<string>('');
  readonly fullWidth = ngInput(false, { transform: booleanAttribute });
  readonly required = ngInput(false, { transform: booleanAttribute });
  readonly readonly = ngInput(false, { transform: booleanAttribute });
  readonly min = ngInput<number | undefined>(undefined);
  readonly max = ngInput<number | undefined>(undefined);
  readonly step = ngInput(1, { transform: numberAttribute });
  readonly decimals = ngInput<number | undefined>(undefined);
  readonly prefix = ngInput<string>('');
  readonly suffix = ngInput<string>('');

  protected readonly focused = signal(false);
  protected readonly rawValue = signal('');

  private onChange: (value: number | null) => void = () => {};

  protected readonly hasVisibleMessage = computed(
    () => (this.error() && !!this.errorMessage()) || !!this.helperText()
  );
  protected readonly messageId = computed(() => (this.hasVisibleMessage() ? this.errorId : undefined));

  protected readonly isIncrementDisabled = computed(() => {
    const max = this.max();
    const current = this.value();
    return this.disabled() || this.readonly() || (max !== undefined && current !== null && current >= max);
  });

  protected readonly isDecrementDisabled = computed(() => {
    const min = this.min();
    const current = this.value();
    return this.disabled() || this.readonly() || (min !== undefined && current !== null && current <= min);
  });

  protected readonly labelClass = computed(() => {
    const classes = [LABEL_SIZE_CLASS[this.size()]];
    classes.push(
      this.error()
        ? 'bip-number-input-label--error'
        : this.focused()
          ? 'bip-number-input-label--focused'
          : 'bip-number-input-label--normal'
    );
    if (this.disabled()) classes.push('bip-number-input-label--disabled');
    return classes.join(' ');
  });

  protected readonly helperClass = computed(() => HELPER_SIZE_CLASS[this.size()]);
  protected readonly stepBtnClass = computed(() => STEP_BTN_SIZE_CLASS[this.size()]);
  protected readonly prefixClass = computed(() => PREFIX_SIZE_CLASS[this.size()]);
  protected readonly suffixClass = computed(() => SUFFIX_SIZE_CLASS[this.size()]);

  protected readonly inputClass = computed(() => {
    const classes = [`bip-number-input--${this.variant()}${this.error() ? '-error' : ''}`, INPUT_SIZE_CLASS[this.size()]];
    if (this.prefix()) classes.push(INPUT_PREFIX_SIZE_CLASS[this.size()]);
    if (this.suffix()) classes.push(INPUT_SUFFIX_SIZE_CLASS[this.size()]);
    return classes.join(' ');
  });

  constructor() {
    super();
    effect(() => {
      this.explicitError.set(this.error() ? this.errorMessage() || 'error' : null);
    });
    // Sincroniza rawValue desde value() cuando cambia desde fuera (binding inicial de
    // [(value)], writeValue, o un set() externo) — pero nunca mientras el campo tiene foco
    // (no le arrebata al usuario lo que está escribiendo) ni cuando rawValue ya representa el
    // mismo número (evita pisar un formateo ya hecho a mano, p. ej. decimals en onBlur).
    effect(() => {
      const current = this.value();
      if (this.focused()) return;
      if (parseValue(this.rawValue()) === current) return;
      this.rawValue.set(current === null ? '' : String(current));
    });
  }

  writeValue(value: number | null): void {
    this.value.set(value ?? null);
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  private clamp(n: number): number {
    let result = n;
    const min = this.min();
    const max = this.max();
    if (min !== undefined) result = Math.max(result, min);
    if (max !== undefined) result = Math.min(result, max);
    return result;
  }

  protected onInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    const decimals = this.decimals();
    if (decimals !== undefined) {
      const dotIndex = raw.indexOf('.');
      if (dotIndex !== -1 && raw.length - dotIndex - 1 > decimals) return;
      if (decimals === 0 && dotIndex !== -1) return;
    }
    this.rawValue.set(raw);
    const parsed = parseValue(raw);
    this.value.set(parsed);
    this.onChange(parsed);
  }

  protected onFocus(): void {
    this.focused.set(true);
  }

  protected onBlur(): void {
    this.focused.set(false);
    this.markTouched();
    const parsed = this.value();
    if (parsed === null) return;
    const clamped = this.clamp(parsed);
    const decimals = this.decimals();
    const formattedText = decimals === undefined ? String(clamped) : clamped.toFixed(decimals);
    const formatted = Number(formattedText);
    this.rawValue.set(formattedText);
    this.value.set(formatted);
    this.onChange(formatted);
  }

  protected onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.increment();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.decrement();
    }
  }

  protected increment(): void {
    if (this.isIncrementDisabled()) return;
    const base = this.value() ?? this.min() ?? 0;
    const next = this.clamp(base + this.step());
    this.rawValue.set(String(next));
    this.value.set(next);
    this.onChange(next);
  }

  protected decrement(): void {
    if (this.isDecrementDisabled()) return;
    const base = this.value() ?? this.max() ?? 0;
    const next = this.clamp(base - this.step());
    this.rawValue.set(String(next));
    this.value.set(next);
    this.onChange(next);
  }
}
