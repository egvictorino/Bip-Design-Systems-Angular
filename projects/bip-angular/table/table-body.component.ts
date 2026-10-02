import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BIP_TABLE_CONTEXT } from './table-context';

/** Mejora un `<tbody>` nativo — solo aplica el borde superior que separa el cuerpo del encabezado. */
@Component({
  selector: 'tbody[bipTableBody]',
  template: `<ng-content />`,
  styleUrl: './table-body.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'bip-table-tbody' },
})
export class BipTableBody {
  constructor() {
    if (!inject(BIP_TABLE_CONTEXT, { optional: true })) {
      throw new Error('<tbody bipTableBody> debe usarse dentro de <bip-table>');
    }
  }
}
