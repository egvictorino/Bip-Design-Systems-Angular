import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  PLATFORM_ID,
  booleanAttribute,
  computed,
  effect,
  inject,
  model,
  numberAttribute,
  signal,
  viewChild,
  input as ngInput,
} from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import { BipFormControlBase } from '@bip-design-systems/angular/core';
import type { BipSize } from '@bip-design-systems/angular/core';

export type BipTextareaVariant = 'outlined' | 'filled' | 'bare';
export type BipTextareaResize = 'none' | 'vertical' | 'horizontal' | 'both';

const LABEL_SIZE_CLASS: Record<BipSize, string> = {
  sm: 'bip-textarea-label--sm',
  md: 'bip-textarea-label--md',
  lg: 'bip-textarea-label--lg',
};

const HELPER_SIZE_CLASS: Record<BipSize, string> = {
  sm: 'bip-textarea-helper--sm',
  md: 'bip-textarea-helper--md',
  lg: 'bip-textarea-helper--lg',
};

const VARIANT_CLASS: Record<BipTextareaVariant, string> = {
  outlined: 'bip-textarea--outlined',
  filled: 'bip-textarea--filled',
  bare: 'bip-textarea--bare',
};

const SIZE_CLASS: Record<BipSize, string> = {
  sm: 'bip-textarea--sm',
  md: 'bip-textarea--md',
  lg: 'bip-textarea--lg',
};

const RESIZE_CLASS: Record<BipTextareaResize, string> = {
  none: 'bip-textarea--resize-none',
  vertical: 'bip-textarea--resize-vertical',
  horizontal: 'bip-textarea--resize-horizontal',
  both: 'bip-textarea--resize-both',
};

/** Encapsula label + textarea + footer (helper/error + contador) — selector de elemento. */
@Component({
  selector: 'bip-textarea',
  templateUrl: './textarea.component.html',
  styleUrl: './textarea.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'bip-textarea-wrapper',
    '[class.bip-textarea-wrapper--full-width]': 'fullWidth()',
  },
})
export class BipTextarea extends BipFormControlBase implements ControlValueAccessor {
  private readonly textareaRef = viewChild<ElementRef<HTMLTextAreaElement>>('textareaEl');

  readonly value = model('');

  readonly variant = ngInput<BipTextareaVariant>('outlined');
  readonly size = ngInput<BipSize>('md');
  readonly label = ngInput<string>('');
  readonly helperText = ngInput<string>('');
  readonly error = ngInput(false, { transform: booleanAttribute });
  readonly errorMessage = ngInput<string>('');
  readonly fullWidth = ngInput(false, { transform: booleanAttribute });
  readonly required = ngInput(false, { transform: booleanAttribute });
  readonly resize = ngInput<BipTextareaResize>('vertical');
  readonly autoGrow = ngInput(false, { transform: booleanAttribute });
  readonly maxLength = ngInput<number | undefined>(undefined);
  readonly rows = ngInput(3, { transform: numberAttribute });

  protected readonly focused = signal(false);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private onChange: (value: string) => void = () => {};

  protected readonly showCounter = computed(() => this.maxLength() !== undefined);
  protected readonly charCount = computed(() => this.value().length);
  protected readonly hasVisibleMessage = computed(
    () => (this.error() && !!this.errorMessage()) || !!this.helperText()
  );
  protected readonly showFooter = computed(() => this.hasVisibleMessage() || this.showCounter());
  protected readonly messageId = computed(() =>
    this.hasVisibleMessage() ? this.errorId : undefined
  );

  protected readonly labelClass = computed(() => {
    const classes = [LABEL_SIZE_CLASS[this.size()]];
    classes.push(
      this.error()
        ? 'bip-textarea-label--error'
        : this.focused()
          ? 'bip-textarea-label--focused'
          : 'bip-textarea-label--normal'
    );
    if (this.disabled()) classes.push('bip-textarea-label--disabled');
    return classes.join(' ');
  });

  protected readonly helperClass = computed(() => HELPER_SIZE_CLASS[this.size()]);

  protected readonly textareaClass = computed(() => {
    const classes = [VARIANT_CLASS[this.variant()], SIZE_CLASS[this.size()]];
    classes.push(this.autoGrow() ? 'bip-textarea--auto-grow' : RESIZE_CLASS[this.resize()]);
    if (this.error()) classes.push('bip-textarea--error');
    return classes.join(' ');
  });

  protected readonly counterClass = computed(() => {
    const max = this.maxLength();
    return max !== undefined && this.charCount() >= max
      ? 'bip-textarea-counter bip-textarea-counter--limit'
      : 'bip-textarea-counter';
  });

  constructor() {
    super();
    effect(() => {
      this.explicitError.set(this.error() ? this.errorMessage() || 'error' : null);
    });
    effect(() => {
      this.value();
      this.adjustHeight();
    });
  }

  writeValue(value: string): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  protected onInput(event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
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

  private adjustHeight(): void {
    if (!this.autoGrow() || !this.isBrowser) return;
    const el = this.textareaRef()?.nativeElement;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }
}
