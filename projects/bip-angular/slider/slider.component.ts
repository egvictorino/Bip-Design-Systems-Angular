import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  effect,
  model,
  numberAttribute,
} from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import { BipFormControlBase } from '@bip-design-systems/angular/core';
import { input as ngInput } from '@angular/core';

/** `<input type="range">` nativo — sin reimplementar el thumb con CDK drag. */
@Component({
  selector: 'bip-slider',
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'bip-slider-wrapper',
    '[class.bip-slider-wrapper--full-width]': 'fullWidth()',
  },
})
export class BipSlider extends BipFormControlBase implements ControlValueAccessor {
  readonly value = model(0);

  readonly label = ngInput<string>('');
  readonly helperText = ngInput<string>('');
  readonly error = ngInput(false, { transform: booleanAttribute });
  readonly errorMessage = ngInput<string>('');
  readonly fullWidth = ngInput(false, { transform: booleanAttribute });
  readonly required = ngInput(false, { transform: booleanAttribute });
  readonly showValue = ngInput(false, { transform: booleanAttribute });
  readonly min = ngInput(0, { transform: numberAttribute });
  readonly max = ngInput(100, { transform: numberAttribute });
  readonly step = ngInput(1, { transform: numberAttribute });

  private onChange: (value: number) => void = () => {};

  protected readonly hasVisibleMessage = computed(
    () => (this.error() && !!this.errorMessage()) || !!this.helperText()
  );
  protected readonly messageId = computed(() => (this.hasVisibleMessage() ? this.errorId : undefined));
  protected readonly showFooter = computed(() => !!this.label() || this.showValue());

  constructor() {
    super();
    effect(() => {
      this.explicitError.set(this.error() ? this.errorMessage() || 'error' : null);
    });
  }

  writeValue(value: number): void {
    this.value.set(value ?? this.min());
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  protected onInput(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.value.set(value);
    this.onChange(value);
  }

  protected onBlur(): void {
    this.markTouched();
  }
}
