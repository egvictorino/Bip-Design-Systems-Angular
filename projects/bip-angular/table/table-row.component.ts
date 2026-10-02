import { ChangeDetectionStrategy, Component, booleanAttribute, computed, inject, input } from '@angular/core';
import { BIP_TABLE_CONTEXT, BIP_TABLE_IN_HEAD } from './table-context';

/**
 * Mejora un `<tr>` nativo. `aria-selected` y las clases de hover/zebra se omiten cuando la fila
 * vive dentro de `<thead bipTableHead>` (ver `BIP_TABLE_IN_HEAD` en `table-context.ts`) — igual
 * que el `inHead` de la referencia React.
 */
@Component({
  selector: 'tr[bipTableRow]',
  template: `<ng-content />`,
  styleUrl: './table-row.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'bip-table-row',
    '[class]': 'hostClasses()',
    '[attr.aria-selected]': 'ariaSelected()',
  },
})
export class BipTableRow {
  private readonly context = (() => {
    const ctx = inject(BIP_TABLE_CONTEXT, { optional: true });
    if (!ctx) {
      throw new Error('<tr bipTableRow> debe usarse dentro de <bip-table>');
    }
    return ctx;
  })();
  private readonly inHead = inject(BIP_TABLE_IN_HEAD, { optional: true }) ?? false;

  readonly selected = input(false, { transform: booleanAttribute });
  readonly clickable = input(false, { transform: booleanAttribute });

  protected readonly ariaSelected = computed(() => (!this.inHead && this.selected() ? true : null));

  protected readonly hostClasses = computed(() => {
    const classes: string[] = [];
    if (this.selected()) {
      classes.push('bip-table-row--selected');
    } else {
      classes.push('bip-table-row--hoverable');
      if (this.context.striped()) classes.push('bip-table-row--striped');
    }
    if (this.clickable()) classes.push('bip-table-row--clickable');
    return classes.join(' ');
  });
}
