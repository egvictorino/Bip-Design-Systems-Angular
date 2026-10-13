import type { Direction } from '@angular/cdk/bidi';

/** Scripts de escritura de derecha a izquierda (ISO 15924). */
const RTL_SCRIPTS = new Set([
  'Arab',
  'Hebr',
  'Thaa',
  'Syrc',
  'Nkoo',
  'Adlm',
  'Rohg',
  'Mand',
  'Samr',
  'Yezi',
]);

/**
 * Dirección natural de escritura de un tag BCP 47 (`es-MX` → `ltr`, `ar-EG` → `rtl`), según su
 * script (con `maximize()`, así `ar`/`he`/`fa` resuelven a Arab/Hebr sin el script explícito).
 * Sirve para aislar un fragmento (p. ej. un rango de fechas) con `[attr.dir]`: el algoritmo bidi
 * no reordena sus extremos según la dirección de la página sino según la del idioma. Solo usa
 * `Intl`, así que es seguro en SSR; un tag inválido cae a `ltr`.
 */
export function localeDirection(locale: string): Direction {
  try {
    const script = new Intl.Locale(locale).maximize().script;
    return script && RTL_SCRIPTS.has(script) ? 'rtl' : 'ltr';
  } catch {
    return 'ltr';
  }
}
