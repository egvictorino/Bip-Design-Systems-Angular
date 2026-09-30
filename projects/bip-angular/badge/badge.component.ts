import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input } from '@angular/core';
import type { BipSize } from '@bip-design-systems/angular/core';

export type BipBadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';

const VARIANT_CLASS: Record<BipBadgeVariant, string> = {
  primary: 'bip-badge--primary',
  success: 'bip-badge--success',
  warning: 'bip-badge--warning',
  danger: 'bip-badge--danger',
  neutral: 'bip-badge--neutral',
};

const SIZE_CLASS: Record<BipSize, string> = {
  sm: 'bip-badge--sm',
  md: 'bip-badge--md',
  lg: 'bip-badge--lg',
};

const DOT_VARIANT_CLASS: Record<BipBadgeVariant, string> = {
  primary: 'bip-badge-dot--primary',
  success: 'bip-badge-dot--success',
  warning: 'bip-badge-dot--warning',
  danger: 'bip-badge-dot--danger',
  neutral: 'bip-badge-dot--neutral',
};

const DOT_SIZE_CLASS: Record<BipSize, string> = {
  sm: 'bip-badge-dot--sm',
  md: 'bip-badge-dot--md',
  lg: 'bip-badge-dot--lg',
};

@Component({
  selector: 'bip-badge',
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'bip-badge',
    '[class]': 'hostClasses()',
  },
})
export class BipBadge {
  readonly variant = input<BipBadgeVariant>('neutral');
  readonly size = input<BipSize>('md');
  readonly dot = input(false, { transform: booleanAttribute });

  protected readonly hostClasses = computed(
    () => `${VARIANT_CLASS[this.variant()]} ${SIZE_CLASS[this.size()]}`
  );

  protected readonly dotClasses = computed(
    () => `bip-badge-dot ${DOT_VARIANT_CLASS[this.variant()]} ${DOT_SIZE_CLASS[this.size()]}`
  );
}
