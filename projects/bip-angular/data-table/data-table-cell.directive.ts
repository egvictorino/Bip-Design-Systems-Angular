import { Directive, TemplateRef, inject, input } from '@angular/core';
import type { BipDataTableCellContext } from './data-table.types';

/**
 * Marca un `<ng-template bipCell="key">` proyectado como el renderer custom de esa columna —
 * reemplaza el `render: (value, row) => ReactNode` por columna de la referencia React (que en
 * Angular no tiene sentido: aquí el consumidor proyecta templates, no pasa funciones).
 */
@Directive({ selector: 'ng-template[bipCell]' })
export class BipDataTableCell<T = Record<string, unknown>> {
  readonly key = input.required<string>({ alias: 'bipCell' });
  readonly templateRef = inject<TemplateRef<BipDataTableCellContext<T>>>(TemplateRef);

  static ngTemplateContextGuard<T>(
    _dir: BipDataTableCell<T>,
    _ctx: unknown
  ): _ctx is BipDataTableCellContext<T> {
    return true;
  }
}
