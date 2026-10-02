import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { BIP_TABLE_CONTEXT } from './table-context';
import type { BipTableAlign } from './table.types';

/** Mejora un `<td>` nativo. */
@Component({
  selector: 'td[bipTableCell]',
  template: `<ng-content />`,
  styleUrl: './table-cell.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'bip-table-cell',
    '[class]': 'hostClasses()',
  },
})
export class BipTableCell {
  private readonly context = (() => {
    const ctx = inject(BIP_TABLE_CONTEXT, { optional: true });
    if (!ctx) {
      throw new Error('<td bipTableCell> debe usarse dentro de <bip-table>');
    }
    return ctx;
  })();

  readonly align = input<BipTableAlign>('start');

  protected readonly hostClasses = computed(() => {
    const classes = [this.context.compact() ? 'bip-table-cell--compact' : 'bip-table-cell--normal'];
    classes.push(`bip-table-align-${this.align()}`);
    return classes.join(' ');
  });
}
