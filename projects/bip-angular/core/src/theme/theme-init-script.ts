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

/**
 * Devuelve el string de un script síncrono para inlinear en el `<head>` del documento,
 * ANTES de cualquier CSS/hidratación — es la única forma de evitar el flash de tema
 * por defecto (FOUC) en el primer paint. Lee localStorage (si hay storageKey) y
 * prefers-color-scheme, y estampa data-theme/data-color-scheme en `<html>`. El
 * selector doble en tokens.css (`:root[data-color-scheme='dark'], [data-color-scheme='dark']`)
 * ya soporta que el atributo viva ahí.
 */
export function getThemeInitScript(options: ThemeInitScriptOptions = {}): string {
  const { storageKey, defaultTheme = 'square', defaultColorScheme = 'light' } = options;
  const storageRead = storageKey
    ? `var raw=localStorage.getItem(${JSON.stringify(storageKey)});if(raw){var saved=JSON.parse(raw);if(saved.theme)t=saved.theme;if(saved.colorScheme)c=saved.colorScheme;}`
    : '';
  return (
    `(function(){try{` +
    `var d=document.documentElement;` +
    `var t=${JSON.stringify(defaultTheme)};` +
    `var c=${JSON.stringify(defaultColorScheme)};` +
    storageRead +
    `if(c==='system'){c=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}` +
    `d.setAttribute('data-theme',t);` +
    `d.setAttribute('data-color-scheme',c);` +
    `}catch(e){}})();`
  );
}
