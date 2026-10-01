import { ChangeDetectionStrategy, Component, booleanAttribute, computed, inject, input } from '@angular/core';
import { BipIdGenerator } from '@bip-design-systems/angular/core';
import { BIP_ACCORDION_CONTEXT, BIP_ACCORDION_ITEM_CONTEXT, type BipAccordionItemContext } from './accordion-context';

const VARIANT_CLASS: Record<string, string> = {
  default: 'bip-accordion-item--default',
  bordered: 'bip-accordion-item--bordered',
  ghost: 'bip-accordion-item--ghost',
};

/**
 * Provee `BipAccordionItemContext` a su `button[bipAccordionTrigger]`/`<bip-accordion-content>`
 * — ids estables vía `BipIdGenerator` (nunca derivados del label del trigger).
 */
@Component({
  selector: 'bip-accordion-item',
  standalone: true,
  template: `<ng-content />`,
  styleUrl: './accordion-item.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: BIP_ACCORDION_ITEM_CONTEXT, useExisting: BipAccordionItem }],
  host: {
    class: 'bip-accordion-item',
    '[class]': 'hostClasses()',
  },
})
export class BipAccordionItem implements BipAccordionItemContext {
  private readonly accordion = (() => {
    const ctx = inject(BIP_ACCORDION_CONTEXT, { optional: true });
    if (!ctx) {
      throw new Error('<bip-accordion-item> debe usarse dentro de <bip-accordion>');
    }
    return ctx;
  })();

  readonly value = input.required<string>();
  readonly disabled = input(false, { transform: booleanAttribute });

  readonly isOpen = computed(() => this.accordion.openItems().has(this.value()));
  readonly triggerId = inject(BipIdGenerator).next('bip-accordion-trigger');
  readonly contentId = inject(BipIdGenerator).next('bip-accordion-content');

  protected readonly hostClasses = computed(() => VARIANT_CLASS[this.accordion.variant()]);

  toggle(): void {
    if (this.disabled()) return;
    this.accordion.toggleItem(this.value());
  }
}
