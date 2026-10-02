import { ChangeDetectionStrategy, Component, computed, input, numberAttribute } from '@angular/core';
import type { BipSize } from '@bip-design-systems/angular/core';

export type BipSkeletonVariant = 'text' | 'circle' | 'rect';
export type BipSkeletonAnimation = 'pulse' | 'wave' | 'none';

const VARIANT_CLASS: Record<BipSkeletonVariant, string> = {
  text: 'bip-skeleton--text',
  circle: 'bip-skeleton--circle',
  rect: 'bip-skeleton--rect',
};

const SIZE_CLASS: Record<BipSize, string> = {
  sm: 'bip-skeleton--sm',
  md: 'bip-skeleton--md',
  lg: 'bip-skeleton--lg',
};

const ANIMATION_CLASS: Record<BipSkeletonAnimation, string> = {
  pulse: 'bip-skeleton--pulse',
  wave: 'bip-skeleton--wave',
  none: '',
};

/** Placeholder de carga (`aria-hidden="true"`, puramente decorativo). */
@Component({
  selector: 'bip-skeleton',
  templateUrl: './skeleton.component.html',
  styleUrl: './skeleton.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BipSkeleton {
  readonly variant = input<BipSkeletonVariant>('text');
  readonly lines = input(1, { transform: numberAttribute });
  readonly size = input<BipSize>('md');
  readonly animation = input<BipSkeletonAnimation>('pulse');
  readonly width = input<string | undefined>(undefined);
  readonly height = input<string | undefined>(undefined);

  protected readonly isMultiline = computed(() => this.variant() === 'text' && this.lines() > 1);

  protected readonly lineIndexes = computed(() => Array.from({ length: this.lines() }, (_, i) => i));

  protected readonly sizeAndAnimationClasses = computed(
    () => `${SIZE_CLASS[this.size()]} ${ANIMATION_CLASS[this.animation()]}`.trim()
  );

  protected readonly singleClasses = computed(
    () =>
      `bip-skeleton-base ${VARIANT_CLASS[this.variant()]} ${this.sizeAndAnimationClasses()}`.trim()
  );

  protected lineClasses(index: number): string {
    const lineWidthClass = index === this.lines() - 1 ? 'bip-skeleton--line-short' : 'bip-skeleton--line-full';
    return `bip-skeleton-base ${VARIANT_CLASS.text} ${this.sizeAndAnimationClasses()} ${lineWidthClass}`.trim();
  }
}
