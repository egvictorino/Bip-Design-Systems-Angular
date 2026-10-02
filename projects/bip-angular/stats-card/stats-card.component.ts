import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  contentChild,
  input,
} from '@angular/core';
import { injectBipLocale } from '@bip-design-systems/angular/core';
import { BipStatsCardIcon } from './stats-card-icon.directive';

export type BipStatsCardVariant = 'elevated' | 'outlined' | 'flat';
export type BipStatsCardSize = 'sm' | 'md' | 'lg';
type BipStatsCardTrendDirection = 'positive' | 'negative' | 'neutral';

const VARIANT_CLASS: Record<BipStatsCardVariant, string> = {
  elevated: 'bip-stats-card--elevated',
  outlined: 'bip-stats-card--outlined',
  flat: 'bip-stats-card--flat',
};

const SIZE_CLASS: Record<BipStatsCardSize, string> = {
  sm: 'bip-stats-card--sm',
  md: 'bip-stats-card--md',
  lg: 'bip-stats-card--lg',
};

const TREND_CLASS: Record<BipStatsCardTrendDirection, string> = {
  positive: 'bip-stats-card-trend--positive',
  negative: 'bip-stats-card-trend--negative',
  neutral: 'bip-stats-card-trend--neutral',
};

@Component({
  selector: 'bip-stats-card',
  templateUrl: './stats-card.component.html',
  styleUrl: './stats-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'bip-stats-card',
    '[class]': 'hostClasses()',
    role: 'region',
    '[attr.aria-label]': 'ariaLabel()',
    '[attr.aria-busy]': 'loading() ? "true" : null',
  },
})
export class BipStatsCard {
  private readonly locale = injectBipLocale();

  readonly title = input.required<string>();
  readonly value = input<string | number>('');
  readonly trend = input<number | undefined>(undefined);
  readonly description = input<string | undefined>(undefined);
  readonly variant = input<BipStatsCardVariant>('outlined');
  readonly size = input<BipStatsCardSize>('md');
  readonly loading = input(false, { transform: booleanAttribute });

  protected readonly iconRef = contentChild(BipStatsCardIcon);
  protected readonly hasIcon = computed(() => Boolean(this.iconRef()));

  protected readonly ariaLabel = computed(() =>
    this.loading() ? this.locale().statsCard.loading : this.title() || null
  );

  protected readonly hostClasses = computed(
    () => `${VARIANT_CLASS[this.variant()]} ${SIZE_CLASS[this.size()]}`
  );

  protected readonly trendDirection = computed<BipStatsCardTrendDirection | undefined>(() => {
    const trend = this.trend();
    if (trend === undefined) return undefined;
    if (trend > 0) return 'positive';
    if (trend < 0) return 'negative';
    return 'neutral';
  });

  protected readonly trendClasses = computed(() => {
    const direction = this.trendDirection();
    return direction ? `bip-stats-card-trend ${TREND_CLASS[direction]}` : '';
  });

  protected readonly trendLabel = computed(() => {
    const trend = this.trend();
    return trend !== undefined ? this.locale().statsCard.trend(trend) : '';
  });

  protected readonly trendText = computed(() => {
    const trend = this.trend();
    if (trend === undefined) return '';
    return `${trend > 0 ? '+' : ''}${trend}%`;
  });
}
