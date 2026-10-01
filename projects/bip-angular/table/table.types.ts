/**
 * `'start'|'center'|'end'` en vez de `'left'|'center'|'right'` (la referencia React) — son
 * palabras clave lógicas de `text-align` nativas de CSS, así que ni la API ni el CSS necesitan
 * mapear nada para RTL.
 */
export type BipTableAlign = 'start' | 'center' | 'end';

export type BipTableSortDirection = 'asc' | 'desc' | null;
