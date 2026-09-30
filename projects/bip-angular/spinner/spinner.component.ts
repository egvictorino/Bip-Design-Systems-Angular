import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { injectBipLocale } from '@bip-design-systems/angular/core';
import type { BipSizeExtended } from '@bip-design-systems/angular/core';

export type BipSpinnerVariant = 'primary' | 'secondary' | 'inverse' | 'danger' | 'success' | 'info';
export type BipSpinnerSpeed = 'slow' | 'normal' | 'fast';

const SIZE_CLASS: Record<BipSizeExtended, string> = {
  xs: 'bip-spinner-svg--xs',
  sm: 'bip-spinner-svg--sm',
  md: 'bip-spinner-svg--md',
  lg: 'bip-spinner-svg--lg',
  xl: 'bip-spinner-svg--xl',
};

const VARIANT_CLASS: Record<BipSpinnerVariant, string> = {
  primary: 'bip-spinner-svg--primary',
  secondary: 'bip-spinner-svg--secondary',
  inverse: 'bip-spinner-svg--inverse',
  danger: 'bip-spinner-svg--danger',
  success: 'bip-spinner-svg--success',
  info: 'bip-spinner-svg--info',
};

const SPEED_CLASS: Record<BipSpinnerSpeed, string> = {
  slow: 'bip-spinner-svg--slow',
  normal: 'bip-spinner-svg--normal',
  fast: 'bip-spinner-svg--fast',
};

/** Indicador de carga circular animado (`role="status"`, SVG interno decorativo `aria-hidden`). */
@Component({
  selector: 'bip-spinner',
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'bip-spinner',
    role: 'status',
    '[attr.aria-label]': 'ariaLabel()',
  },
})
export class BipSpinner {
  private readonly locale = injectBipLocale();

  readonly size = input<BipSizeExtended>('md');
  readonly variant = input<BipSpinnerVariant>('primary');
  readonly speed = input<BipSpinnerSpeed | undefined>(undefined);
  readonly label = input<string | undefined>(undefined);

  protected readonly ariaLabel = computed(() => this.label() ?? this.locale().spinner.defaultLabel);

  protected readonly svgClasses = computed(() => {
    const speed = this.speed();
    return [SIZE_CLASS[this.size()], VARIANT_CLASS[this.variant()], speed ? SPEED_CLASS[speed] : '']
      .filter(Boolean)
      .join(' ');
  });
}
