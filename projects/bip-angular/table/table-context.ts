import type { Signal } from '@angular/core';
import { InjectionToken } from '@angular/core';

/**
 * Contrato que `thead[bipTableHead]`, `tbody[bipTableBody]`, `tr[bipTableRow]`,
 * `th[bipTableHeader]`, `td[bipTableCell]` y `tr[bipTableEmpty]` necesitan de su `<bip-table>`
 * ancestro — token en vez de la clase directa (mismo motivo que `tabs-context.ts`).
 */
export interface BipTableContext {
  readonly striped: Signal<boolean>;
  readonly compact: Signal<boolean>;
  readonly stickyHeader: Signal<boolean>;
}

export const BIP_TABLE_CONTEXT = new InjectionToken<BipTableContext>('BIP_TABLE_CONTEXT');

/**
 * Marcador que solo `thead[bipTableHead]` provee — permite a `tr[bipTableRow]` distinguir si
 * está dentro del encabezado (sin `aria-selected` ni estilos de hover/zebra) sin que
 * `BipTableContext` tenga que exponer un árbol de contextos anidado como en la referencia React
 * (`TableContext.Provider` con `inHead` sobreescrito). Ausente (vs. `BIP_TABLE_CONTEXT`, que
 * siempre debe existir) fuera de `<thead bipTableHead>`.
 */
export const BIP_TABLE_IN_HEAD = new InjectionToken<true>('BIP_TABLE_IN_HEAD');
