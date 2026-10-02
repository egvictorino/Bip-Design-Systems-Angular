/**
 * Normaliza texto para comparar en búsquedas: minúsculas (según `locale`) y sin diacríticos,
 * así "mexico" encuentra "México" y "canada" encuentra "Canadá".
 */
export function foldSearchText(text: string, locale?: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase(locale);
}

/** `true` si `query` aparece en el `label` o el `value` de la opción (query vacía → todo coincide). */
export function matchesSearch(
  option: { label: string; value: string },
  query: string,
  locale?: string
): boolean {
  const q = foldSearchText(query.trim(), locale);
  if (!q) return true;
  return (
    foldSearchText(option.label, locale).includes(q) ||
    foldSearchText(option.value, locale).includes(q)
  );
}
