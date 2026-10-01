import type { BipTableAlign, BipTableSortDirection } from '@bip-design-systems/angular/table';
import type { BipButtonVariant } from '@bip-design-systems/angular/button';

export type { BipTableSortDirection as BipDataTableSortDirection };

export interface BipDataTableColumn<T = Record<string, unknown>> {
  key: Extract<keyof T, string>;
  header: string;
  sortable?: boolean;
  width?: string;
  align?: BipTableAlign;
}

export interface BipDataTableBulkAction<T = Record<string, unknown>> {
  label: string;
  onClick: (selectedRows: T[]) => void;
  variant?: BipButtonVariant;
}

/**
 * Contexto expuesto a `<ng-template bipCell="key" let-row let-value="value" let-rowIndex="rowIndex">`.
 * `$implicit` es la fila completa (igual que el segundo argumento `row` del `render` de la
 * referencia React); `value` es el valor crudo de esa columna en esa fila.
 */
export interface BipDataTableCellContext<T = Record<string, unknown>> {
  $implicit: T;
  value: unknown;
  rowIndex: number;
}
