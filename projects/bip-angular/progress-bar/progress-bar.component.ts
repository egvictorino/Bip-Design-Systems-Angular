import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  inject,
  input,
  numberAttribute,
} from '@angular/core';
import { BipIdGenerator, injectBipLocale } from '@bip-design-systems/angular/core';
import type { BipSize } from '@bip-design-systems/angular/core';

export type BipProgressBarVariant = 'default' | 'success' | 'warning' | 'danger';

const FILL_VARIANT_CLASS: Record<BipProgressBarVariant, string> = {
  default: 'bip-progress-fill--default',
  success: 'bip-progress-fill--success',
  warning: 'bip-progress-fill--warning',
  danger: 'bip-progress-fill--danger',
};

const TRACK_SIZE_CLASS: Record<BipSize, string> = {
  sm: 'bip-progress-track--sm',
  md: 'bip-progress-track--md',
  lg: 'bip-progress-track--lg',
};

@Component({
  selector: 'bip-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrl: './progress-bar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'bip-progress-bar' },
})
export class BipProgressBar {
  private readonly locale = injectBipLocale();
  private readonly autoId = inject(BipIdGenerator).next('bip-progress-bar');

  readonly value = input(0, { transform: numberAttribute });
  readonly variant = input<BipProgressBarVariant>('default');
  readonly size = input<BipSize>('md');
  readonly label = input<string | undefined>(undefined);
  readonly showValue = input(false, { transform: booleanAttribute });
  readonly indeterminate = input(false, { transform: booleanAttribute });
  readonly helperText = input<string | undefined>(undefined);
  readonly valueText = input<string | undefined>(undefined);
  readonly striped = input(false, { transform: booleanAttribute });
  readonly animated = input(false, { transform: booleanAttribute });
  readonly id = input<string | undefined>(undefined);

  protected readonly effectiveId = computed(() => this.id() ?? this.autoId);
  protected readonly descriptionId = computed(() =>
    this.helperText() ? `${this.effectiveId()}-description` : undefined
  );

  protected readonly clampedValue = computed(() => Math.min(100, Math.max(0, this.value())));
  protected readonly showHeader = computed(() => Boolean(this.label() || this.showValue()));

  protected readonly ariaLabel = computed(() => this.label() || this.locale().progressBar.defaultLabel);
  protected readonly ariaValueText = computed(() =>
    !this.indeterminate() && this.valueText() ? this.valueText() : null
  );
  protected readonly ariaValueNow = computed(() => (this.indeterminate() ? null : this.clampedValue()));
  protected readonly ariaBusy = computed(() => (this.indeterminate() ? 'true' : null));

  protected readonly trackClasses = computed(() => `bip-progress-track ${TRACK_SIZE_CLASS[this.size()]}`);
  protected readonly fillClasses = computed(() => {
    const variantClass = FILL_VARIANT_CLASS[this.variant()];
    const stripedOn = this.striped();
    return [
      'bip-progress-fill',
      variantClass,
      stripedOn ? 'bip-progress-fill--striped' : '',
      stripedOn && this.animated() ? 'bip-progress-fill--animated' : '',
    ]
      .filter(Boolean)
      .join(' ');
  });
  protected readonly indeterminateClasses = computed(
    () => `bip-progress-indeterminate ${FILL_VARIANT_CLASS[this.variant()]}`
  );
}
