import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { BIP_TABLE_CONTEXT, BIP_TABLE_IN_HEAD } from './table-context';

/**
 * Mejora un `<thead>` nativo (selector de atributo, igual que `button[bipTab]`) — conserva la
 * semántica de tabla intacta. Provee `BIP_TABLE_IN_HEAD` para que `tr[bipTableRow]` proyectado
 * dentro sepa que no debe aplicar `aria-selected`/zebra/hover (ver `table-context.ts`).
 */
@Component({
  selector: 'thead[bipTableHead]',
  template: `<ng-content />`,
  styleUrl: './table-head.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: BIP_TABLE_IN_HEAD, useValue: true }],
  host: {
    class: 'bip-table-thead',
    '[class.bip-table-thead--sticky]': 'isSticky()',
  },
})
export class BipTableHead {
  private readonly context = (() => {
    const ctx = inject(BIP_TABLE_CONTEXT, { optional: true });
    if (!ctx) {
      throw new Error('<thead bipTableHead> debe usarse dentro de <bip-table>');
    }
    return ctx;
  })();

  protected readonly isSticky = computed(() => this.context.stickyHeader());
}
