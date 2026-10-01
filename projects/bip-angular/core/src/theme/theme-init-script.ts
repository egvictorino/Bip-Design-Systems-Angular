import type { BipColorSchemePreference, BipThemeName } from './theme.types';

/**
 * `body { color: var(--color-txt); font-family: var(--font-sans); ... }` (base.css)
 * resuelve esas variables en la posición de `body` — fuera de CUALQUIER nodo con
 * data-theme/data-color-scheme propio — y los hijos heredan el valor ya calculado,
 * no una referencia viva a la variable. Todo nodo que estampa un esquema distinto al
 * de `body` (el wrapper de <bip-theme-provider>, y los overlays vía BipOverlay) debe
 * re-declarar estas propiedades explícitamente para que sus descendientes sin
 * `color`/`font-family` propios las re-resuelvan en su propia posición del árbol.
 */
export const THEME_RESET_STYLE: Record<string, string> = {
  'font-family': 'var(--font-sans)',
  'letter-spacing': 'var(--font-letter-spacing)',
  color: 'var(--color-txt)',
};

export interface ThemeInitScriptOptions {
  /** Debe coincidir con el `storageKey` pasado a <bip-theme-provider>. */
  storageKey?: string;
  defaultTheme?: BipThemeName;
  defaultColorScheme?: BipColorSchemePreference;
}

const VALID_THEMES: readonly BipThemeName[] = ['square', 'rounded'];
const VALID_COLOR_SCHEMES: readonly BipColorSchemePreference[] = ['light', 'dark', 'system'];

// Código de carácter de los separadores de línea Unicode LINE SEPARATOR (U+2028) y
// PARAGRAPH SEPARATOR (U+2029) — construidos con String.fromCharCode a partir del código
// numérico, nunca tecleando el carácter real ni su escape en este archivo: un editor,
// formateador o pipeline de guardado podría normalizar ese carácter de un modo que rompa el
// propio literal de RegExp de más abajo (JS lo trata como fin de statement fuera de un
// string). HTML no lo reconoce como salto de línea, así que JSON.stringify no lo escapa.
const LINE_SEPARATOR_CODE = 8232; // U+2028
const PARAGRAPH_SEPARATOR_CODE = 8233; // U+2029
const UNSAFE_INLINE_JS_CHARS = new RegExp(
  `[<>&${String.fromCharCode(LINE_SEPARATOR_CODE)}${String.fromCharCode(PARAGRAPH_SEPARATOR_CODE)}]`,
  'g'
);

/**
 * `JSON.stringify` deja el valor seguro como literal de JavaScript, pero no dentro de un
 * `<script>` inlineado en HTML: no escapa la secuencia de cierre de tag, así que un
 * `storageKey` (u otro valor, si en algún momento dejara de venir de un literal de tipo
 * fijo) que contuviera `</script><script>...` cerraría el bloque e inyectaría markup/script
 * arbitrario en el `<head>`. Se escapan `<`, `>`, `&` y los separadores de línea de arriba
 * como secuencias de escape Unicode — `JSON.parse` en tiempo de ejecución las revierte sin
 * cambiar el valor.
 */
function toInlineJs(value: string): string {
  return JSON.stringify(value).replace(UNSAFE_INLINE_JS_CHARS, (char) => {
    const hex = char.charCodeAt(0).toString(16).padStart(4, '0');
    return '\\' + 'u' + hex;
  });
}

/**
 * Devuelve el string de un script síncrono para inlinear en el `<head>` del documento,
 * ANTES de cualquier CSS/hidratación — es la única forma de evitar el flash de tema
 * por defecto (FOUC) en el primer paint. Lee localStorage (si hay storageKey) y
 * prefers-color-scheme, y estampa data-theme/data-color-scheme en `<html>`. El
 * selector doble en tokens.css (`:root[data-color-scheme='dark'], [data-color-scheme='dark']`)
 * ya soporta que el atributo viva ahí.
 *
 * `defaultTheme`/`defaultColorScheme` están tipados, pero el llamador puede llegar a pasar un
 * valor fuera de esos literales desde JavaScript puro (sin `strict` o con un `as any`) — se
 * valida contra un allowlist y se cae al default seguro en vez de confiar en el tipo. El
 * valor leído de `localStorage` recibe la misma validación: viene de fuera (otra pestaña,
 * una extensión, o simplemente alguien editándolo a mano en devtools) y de otro modo
 * terminaría estampado sin filtrar en `data-theme`/`data-color-scheme`.
 */
export function getThemeInitScript(options: ThemeInitScriptOptions = {}): string {
  const { storageKey, defaultTheme = 'square', defaultColorScheme = 'light' } = options;
  const safeTheme = VALID_THEMES.includes(defaultTheme) ? defaultTheme : 'square';
  const safeColorScheme = VALID_COLOR_SCHEMES.includes(defaultColorScheme) ? defaultColorScheme : 'light';

  const validThemesJs = VALID_THEMES.map((t) => toInlineJs(t)).join(',');
  const validColorSchemesJs = VALID_COLOR_SCHEMES.map((c) => toInlineJs(c)).join(',');
  const storageRead = storageKey
    ? `var raw=localStorage.getItem(${toInlineJs(storageKey)});if(raw){var saved=JSON.parse(raw);` +
      `if([${validThemesJs}].indexOf(saved.theme)!==-1)t=saved.theme;` +
      `if([${validColorSchemesJs}].indexOf(saved.colorScheme)!==-1)c=saved.colorScheme;}`
    : '';
  return (
    `(function(){try{` +
    `var d=document.documentElement;` +
    `var t=${toInlineJs(safeTheme)};` +
    `var c=${toInlineJs(safeColorScheme)};` +
    storageRead +
    `if(c==='system'){c=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}` +
    `d.setAttribute('data-theme',t);` +
    `d.setAttribute('data-color-scheme',c);` +
    `}catch(e){}})();`
  );
}
