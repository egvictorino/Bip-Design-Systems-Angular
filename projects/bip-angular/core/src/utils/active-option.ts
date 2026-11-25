interface Navigable {
  disabled: boolean;
}

/** Índice de la primera opción habilitada, o `-1` si no hay. */
export function firstEnabledIndex(entries: readonly Navigable[]): number {
  return entries.findIndex((entry) => !entry.disabled);
}

/**
 * Siguiente opción habilitada desde `from` en `direction`, saltando deshabilitadas y sin wrap.
 * Si no hay más en esa dirección devuelve `from` (la activa no cambia).
 */
export function nextEnabledIndex(
  entries: readonly Navigable[],
  from: number,
  direction: 1 | -1
): number {
  let i = from;
  do {
    i += direction;
  } while (i >= 0 && i < entries.length && entries[i].disabled);
  return i < 0 || i >= entries.length ? from : i;
}
