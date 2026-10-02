import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BIP_ACCORDION_ITEM_CONTEXT } from './accordion-context';

/**
 * Siempre montado en el DOM (nunca `@if`) — abre/cierra con una transición de `grid-template-
 * rows` (`0fr` ↔ `1fr`), el truco CSS estándar para animar hacia una altura desconocida sin
 * medir nada en JS. Igual que la referencia React.
 */
@Component({
  selector: 'bip-accordion-content',
  template: `
    <div class="bip-accordion-content-inner">
      <ng-content />
    </div>
  `,
  styleUrl: './accordion-content.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'bip-accordion-content',
    '[class.bip-accordion-content--open]': 'context.isOpen()',
    role: 'region',
    '[id]': 'context.contentId',
    '[attr.aria-labelledby]': 'context.triggerId',
  },
})
export class BipAccordionContent {
  protected readonly context = (() => {
    const ctx = inject(BIP_ACCORDION_ITEM_CONTEXT, { optional: true });
    if (!ctx) {
      throw new Error('<bip-accordion-content> debe usarse dentro de <bip-accordion-item>');
    }
    return ctx;
  })();
}
