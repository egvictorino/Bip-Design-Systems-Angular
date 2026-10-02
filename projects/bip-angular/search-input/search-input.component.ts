import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  booleanAttribute,
  computed,
  effect,
  inject,
  model,
  numberAttribute,
  output,
  signal,
} from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import { BipFormControlBase, injectBipLocale } from '@bip-design-systems/angular/core';
import type { BipSize } from '@bip-design-systems/angular/core';
import { input as ngInput } from '@angular/core';

export type BipSearchInputVariant = 'outlined' | 'filled' | 'bare';

const INPUT_SIZE_CLASS: Record<BipSize, string> = {
  sm: 'bip-search-input--sm',
  md: 'bip-search-input--md',
  lg: 'bip-search-input--lg',
};

const LABEL_SIZE_CLASS: Record<BipSize, string> = {
  sm: 'bip-search-input-label--sm',
  md: 'bip-search-input-label--md',
  lg: 'bip-search-input-label--lg',
};

const HELPER_SIZE_CLASS: Record<BipSize, string> = {
  sm: 'bip-search-input-helper--sm',
  md: 'bip-search-input-helper--sm',
  lg: 'bip-search-input-helper--lg',
};

const ICON_SIZE_CLASS: Record<BipSize, string> = {
  sm: 'bip-search-input-icon--sm',
  md: 'bip-search-input-icon--md',
  lg: 'bip-search-input-icon--lg',
};

const ICON_OFFSET_CLASS: Record<BipSize, string> = {
  sm: 'bip-search-input-search-icon--sm',
  md: 'bip-search-input-search-icon--md',
  lg: 'bip-search-input-search-icon--lg',
};

const CLEAR_OFFSET_CLASS: Record<BipSize, string> = {
  sm: 'bip-search-input-clear-btn--sm',
  md: 'bip-search-input-clear-btn--md',
  lg: 'bip-search-input-clear-btn--lg',
};

/** `role="search"` en el wrapper; `searched` (output) puede ir debounced o disparar solo con Enter. */
@Component({
  selector: 'bip-search-input',
  templateUrl: './search-input.component.html',
  styleUrl: './search-input.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'bip-search-input-wrapper',
    role: 'search',
    '[class.bip-search-input-wrapper--full-width]': 'fullWidth()',
  },
})
export class BipSearchInput extends BipFormControlBase implements ControlValueAccessor {
  protected readonly locale = injectBipLocale();
  private readonly destroyRef = inject(DestroyRef);

  readonly value = model('');

  readonly variant = ngInput<BipSearchInputVariant>('outlined');
  readonly size = ngInput<BipSize>('md');
  readonly label = ngInput<string>('');
  readonly helperText = ngInput<string>('');
  readonly error = ngInput(false, { transform: booleanAttribute });
  readonly errorMessage = ngInput<string>('');
  readonly fullWidth = ngInput(false, { transform: booleanAttribute });
  readonly required = ngInput(false, { transform: booleanAttribute });
  readonly loading = ngInput(false, { transform: booleanAttribute });
  readonly debounceMs = ngInput(0, { transform: numberAttribute });
  readonly searchOnEnter = ngInput(false, { transform: booleanAttribute });

  readonly searched = output<string>();
  readonly cleared = output<void>();

  protected readonly focused = signal(false);
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  private onChange: (value: string) => void = () => {};

  protected readonly showClear = computed(() => !this.loading() && !this.disabled() && !!this.value());

  protected readonly hasVisibleMessage = computed(
    () => (this.error() && !!this.errorMessage()) || !!this.helperText()
  );
  protected readonly messageId = computed(() => (this.hasVisibleMessage() ? this.errorId : undefined));

  protected readonly labelClass = computed(() => {
    const classes = [LABEL_SIZE_CLASS[this.size()]];
    classes.push(
      this.error()
        ? 'bip-search-input-label--error'
        : this.focused()
          ? 'bip-search-input-label--focused'
          : 'bip-search-input-label--normal'
    );
    if (this.disabled()) classes.push('bip-search-input-label--disabled');
    return classes.join(' ');
  });

  protected readonly helperClass = computed(() => HELPER_SIZE_CLASS[this.size()]);
  protected readonly iconClass = computed(() => ICON_SIZE_CLASS[this.size()]);
  protected readonly clearOffsetClass = computed(() => CLEAR_OFFSET_CLASS[this.size()]);

  protected readonly searchIconClass = computed(() => {
    const classes = [ICON_OFFSET_CLASS[this.size()]];
    classes.push(this.error() ? 'bip-search-input-search-icon--error' : 'bip-search-input-search-icon--normal');
    if (this.disabled()) classes.push('bip-search-input-search-icon--disabled');
    if (this.loading()) classes.push('bip-search-input-search-icon--spinning');
    return classes.join(' ');
  });

  protected readonly inputClass = computed(() => {
    const classes = [`bip-search-input--${this.variant()}${this.error() ? '-error' : ''}`, INPUT_SIZE_CLASS[this.size()]];
    return classes.join(' ');
  });

  constructor() {
    super();
    effect(() => {
      this.explicitError.set(this.error() ? this.errorMessage() || 'error' : null);
    });
    this.destroyRef.onDestroy(() => {
      if (this.debounceTimer) clearTimeout(this.debounceTimer);
    });
  }

  writeValue(value: string): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  protected onInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    this.value.set(raw);
    this.onChange(raw);

    if (this.searchOnEnter()) return;
    const debounceMs = this.debounceMs();
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    if (debounceMs > 0) {
      this.debounceTimer = setTimeout(() => this.searched.emit(raw), debounceMs);
    } else {
      this.searched.emit(raw);
    }
  }

  protected onKeyDown(event: KeyboardEvent): void {
    if (this.searchOnEnter() && event.key === 'Enter') {
      if (this.debounceTimer) clearTimeout(this.debounceTimer);
      this.searched.emit(this.value());
    }
  }

  protected onFocus(): void {
    this.focused.set(true);
  }

  protected onBlur(): void {
    this.focused.set(false);
    this.markTouched();
  }

  protected onClear(): void {
    this.value.set('');
    this.onChange('');
    this.cleared.emit();
  }
}
