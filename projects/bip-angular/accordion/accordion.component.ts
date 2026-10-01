import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input, model } from '@angular/core';
import { BIP_ACCORDION_CONTEXT, type BipAccordionContext } from './accordion-context';

export type BipAccordionType = 'single' | 'multiple';
export type BipAccordionVariant = 'default' | 'bordered' | 'ghost';

function toSet(value: string | readonly string[]): Set<string> {
  if (Array.isArray(value)) return new Set(value);
  return value ? new Set([value as string]) : new Set();
}

/**
 * `value` es un único `model()` cuya forma pública (string vs string[]) depende de `type` —
 * igual que React, donde `value`/`onChange` cambian de forma según `type="single"|"multiple"`.
 * Internamente siempre se normaliza a `Set<string>` (`toSet()`) para no duplicar lógica de
 * apertura/cierre entre ambos modos.
 */
@Component({
  selector: 'bip-accordion',
  standalone: true,
  template: `<ng-content />`,
  styleUrl: './accordion.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: BIP_ACCORDION_CONTEXT, useExisting: BipAccordion }],
  host: { class: 'bip-accordion' },
})
export class BipAccordion implements BipAccordionContext {
  readonly type = input<BipAccordionType>('single');
  readonly collapsible = input(false, { transform: booleanAttribute });
  readonly variant = input<BipAccordionVariant>('default');
  readonly value = model<string | readonly string[]>('');

  readonly openItems = computed(() => toSet(this.value()));

  toggleItem(itemValue: string): void {
    if (this.type() === 'single') {
      const isOpen = this.openItems().has(itemValue);
      if (isOpen) {
        this.value.set(this.collapsible() ? '' : itemValue);
      } else {
        this.value.set(itemValue);
      }
      return;
    }

    const next = new Set(this.openItems());
    if (next.has(itemValue)) {
      next.delete(itemValue);
    } else {
      next.add(itemValue);
    }
    this.value.set([...next]);
  }
}
