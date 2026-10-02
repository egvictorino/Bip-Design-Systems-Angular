import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BIP_ACCORDION_ITEM_CONTEXT } from './accordion-context';

/**
 * Mejora un `<button>` nativo — Enter/Espacio activan de forma nativa, sin navegación por
 * flechas entre encabezados (igual que la referencia React: solo el orden de tabulación nativo
 * entre triggers).
 */
@Component({
  selector: 'button[bipAccordionTrigger]',
  template: `
    <ng-content />
    <span class="bip-accordion-chevron" [class.bip-accordion-chevron--open]="context.isOpen()" aria-hidden="true"></span>
  `,
  styleUrl: './accordion-trigger.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'bip-accordion-trigger',
    '[id]': 'context.triggerId',
    '[attr.aria-expanded]': 'context.isOpen()',
    '[attr.aria-controls]': 'context.contentId',
    '[disabled]': 'context.disabled()',
    '(click)': 'context.toggle()',
  },
})
export class BipAccordionTrigger {
  protected readonly context = (() => {
    const ctx = inject(BIP_ACCORDION_ITEM_CONTEXT, { optional: true });
    if (!ctx) {
      throw new Error('<button bipAccordionTrigger> debe usarse dentro de <bip-accordion-item>');
    }
    return ctx;
  })();
}
