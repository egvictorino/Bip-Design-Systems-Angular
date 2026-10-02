import type { Signal } from '@angular/core';
import { InjectionToken } from '@angular/core';
import type { BipAccordionVariant } from './accordion.component';

/**
 * Contrato que `<bip-accordion-item>` necesita de su `<bip-accordion>` ancestro — token en vez
 * de la clase directa (mismo motivo que `dropdown-context.ts`). `openItems` es siempre un
 * `Set<string>` internamente, sin importar si `type` es `single`/`multiple` ni la forma pública
 * de `value` (string | string[]) — ver `toSet()` en `accordion.component.ts`.
 */
export interface BipAccordionContext {
  readonly openItems: Signal<ReadonlySet<string>>;
  readonly variant: Signal<BipAccordionVariant>;
  toggleItem(itemValue: string): void;
}

export const BIP_ACCORDION_CONTEXT = new InjectionToken<BipAccordionContext>('BIP_ACCORDION_CONTEXT');

/**
 * Contrato que `button[bipAccordionTrigger]`/`<bip-accordion-content>` necesitan de su
 * `<bip-accordion-item>` ancestro.
 */
export interface BipAccordionItemContext {
  readonly isOpen: Signal<boolean>;
  readonly disabled: Signal<boolean>;
  readonly triggerId: string;
  readonly contentId: string;
  toggle(): void;
}

export const BIP_ACCORDION_ITEM_CONTEXT = new InjectionToken<BipAccordionItemContext>(
  'BIP_ACCORDION_ITEM_CONTEXT'
);
