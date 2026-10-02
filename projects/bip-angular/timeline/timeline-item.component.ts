import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import type { BipSize } from '@bip-design-systems/angular/core';
import { BIP_TIMELINE_CONTEXT } from './timeline-context';

export type BipTimelineItemVariant = 'default' | 'success' | 'warning' | 'danger';

const VARIANT_CLASS: Record<BipTimelineItemVariant, string> = {
  default: 'bip-timeline-item--default',
  success: 'bip-timeline-item--success',
  warning: 'bip-timeline-item--warning',
  danger: 'bip-timeline-item--danger',
};

const SIZE_CLASS: Record<BipSize, string> = {
  sm: 'bip-timeline-item--sm',
  md: 'bip-timeline-item--md',
  lg: 'bip-timeline-item--lg',
};

/**
 * Sin interacción de teclado ni foco propio — puramente presentacional, como su referencia
 * React. El punto/conector es decorativo (`aria-hidden`); el contenido real (fecha, título,
 * descripción, hijos extra) es texto normal dentro de un `role="listitem"`.
 */
@Component({
  selector: 'bip-timeline-item',
  templateUrl: './timeline-item.component.html',
  styleUrl: './timeline-item.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'bip-timeline-item',
    '[class]': 'hostClasses()',
    role: 'listitem',
  },
})
export class BipTimelineItem {
  private readonly context = (() => {
    const ctx = inject(BIP_TIMELINE_CONTEXT, { optional: true });
    if (!ctx) {
      throw new Error('<bip-timeline-item> debe usarse dentro de <bip-timeline>');
    }
    return ctx;
  })();

  readonly date = input<string | undefined>(undefined);
  readonly title = input.required<string>();
  readonly description = input<string | undefined>(undefined);
  readonly variant = input<BipTimelineItemVariant>('default');
  readonly size = input<BipSize>('md');

  protected readonly hostClasses = computed(() => {
    const classes = [VARIANT_CLASS[this.variant()], SIZE_CLASS[this.size()]];
    if (this.context.orientation() === 'horizontal') {
      classes.push('bip-timeline-item--horizontal');
    }
    return classes.join(' ');
  });
}
