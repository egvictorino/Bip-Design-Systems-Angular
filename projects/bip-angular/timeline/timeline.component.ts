import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { BIP_TIMELINE_CONTEXT, type BipTimelineContext } from './timeline-context';

export type BipTimelineOrientation = 'vertical' | 'horizontal';

/**
 * Componente puramente presentacional (sin teclado ni estado) — solo comparte `orientation`
 * con sus `<bip-timeline-item>` vía contexto. `aria-label` es responsabilidad del consumidor
 * (opcional, sin default localizado — fiel a la referencia React, que tampoco lo trae).
 */
@Component({
  selector: 'bip-timeline',
  template: `<ng-content />`,
  styleUrl: './timeline.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: BIP_TIMELINE_CONTEXT, useExisting: BipTimeline }],
  host: {
    class: 'bip-timeline',
    '[class.bip-timeline--horizontal]': "orientation() === 'horizontal'",
    role: 'list',
  },
})
export class BipTimeline implements BipTimelineContext {
  readonly orientation = input<BipTimelineOrientation>('vertical');
}
