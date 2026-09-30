import { readFileSync } from 'fs';
import { relative, resolve } from 'path';
import { describe, it, expect } from 'vitest';
import { findFiles } from './find-css-files';

const SRC_DIR = resolve(__dirname, '..');

/**
 * Directorios que no son componentes publicados de la librería — Foundations es solo para
 * Storybook (no viaja al consumidor) y `testing/`/`.storybook` son tooling, no UI.
 */
const EXCLUDED_TOP_LEVEL = new Set(['foundations', 'testing', '.storybook']);

/**
 * Mismo patrón que spacing.spec.ts/on-text.spec.ts/rtl.spec.ts: un componente nuevo con un
 * string en español quemado en aria-label/placeholder/title, en texto de template, o en un
 * literal de string dentro de una expresión (ternarios, `??`, mensajes de `throw new Error`),
 * debe pasar por el diccionario de i18n (`injectBipLocale()`) — no directo en el `.html`/`.ts`.
 * Puerto de i18n/no-hardcoded-strings.test.ts (React), adaptado a `.html` + `.ts` de Angular.
 */
const ALLOWLIST = new Set<string>([
  // Los diccionarios en sí — es la fuente de verdad del texto en español, no un bypass de ella.
  'core/src/i18n/es-mx.locale.ts',
  'core/src/i18n/en-us.locale.ts',
  // console.warn de contraste WCAG en dev (resolveTokenVars(), llamado con isDevMode() desde
  // BipThemeContext) — mensaje de consola para quien integra la librería, no texto de UI
  // renderizado; no pasa por el diccionario de i18n a propósito, igual que en la referencia
  // React (ver ALLOWLIST de ThemeProvider.tsx en i18n/no-hardcoded-strings.test.ts).
  'core/src/theme/var-maps.ts',
]);

const findComponentFiles = (dir: string): string[] =>
  findFiles(
    dir,
    (name) =>
      (name.endsWith('.ts') || name.endsWith('.html')) &&
      !name.endsWith('.spec.ts') &&
      !name.endsWith('.stories.ts')
  ).filter((path) => {
    const relPath = relative(SRC_DIR, path).replace(/\\/g, '/');
    const topLevel = relPath.split('/')[0];
    return !EXCLUDED_TOP_LEVEL.has(topLevel);
  });

// Acentos/¿¡ son una señal inequívoca. El resto es una lista corta de palabras/stopwords en
// español que aparecen constantemente en texto quemado de este repo — no es un diccionario
// completo, es la misma heurística de spot-check que ya usa el resto de los guard tests.
const SPANISH_HINTS =
  /\b(que|hay|más|mas|para|una|uno|del|con|sin|está|estás|guardar|cancelar|agregar|columnas|limpiar|eliminar|seleccionar|buscar|cargando|anterior|siguiente|cerrar|mostrar|registros|archivo|imagen|imágenes|diente|dientes|nota|notas|arrastra|suelta|formatos)\b/i;

const looksSpanish = (text: string): boolean =>
  /[áéíóúñÁÉÍÓÚÑ¿¡]/.test(text) || SPANISH_HINTS.test(text);

// Literal (no interpolado) aria-label="...", placeholder="...", o title="..." con al menos una
// letra, en un template Angular (.html o template inline en .ts).
const HARDCODED_ATTR = /\b(?:aria-label|placeholder|title)="[^"]*[a-zA-Z][^"]*"/;

// Nodo de texto de template Angular (entre `>` y `<`) que contiene un caracter propio del
// español o una de las stopwords de arriba. Evaluado línea por línea para que `[^<]*` no
// "salte" a través de saltos de línea.
const TEMPLATE_TEXT_NODE = />([^<]*)</;

// Un literal de string ('...', "...", `...`) en cualquier parte del archivo — cubre texto en
// español dentro de una expresión JS/TS (`throw new Error('...')`, ternarios, etc.).
const STRING_LITERAL =
  /'([^'\\]*(?:\\.[^'\\]*)*)'|"([^"\\]*(?:\\.[^"\\]*)*)"|`([^`\\]*(?:\\.[^`\\]*)*)`/g;

const stripComments = (content: string): string =>
  content
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .filter((line) => !line.trim().startsWith('//'))
    .join('\n');

// Quita interpolaciones (`{{ count }}`, `{{ expr() }}`) de una línea antes de evaluar el nodo
// de texto que la envuelve.
const stripInterpolations = (line: string): string => line.replace(/\{\{[^{}]*\}\}/g, '');

const hasHardcodedSpanish = (content: string): boolean => {
  if (HARDCODED_ATTR.test(content)) return true;

  const withoutComments = stripComments(content);
  for (const match of withoutComments.matchAll(STRING_LITERAL)) {
    const literal = match[1] ?? match[2] ?? match[3] ?? '';
    if (literal.trim() && looksSpanish(literal)) return true;
  }

  return content.split('\n').some((rawLine) => {
    const line = rawLine.trim();
    if (line.startsWith('//') || line.startsWith('*')) return false;
    const textNode = TEMPLATE_TEXT_NODE.exec(stripInterpolations(line));
    return textNode ? looksSpanish(textNode[1]) : false;
  });
};

describe('sin strings en español quemados en componentes (deben venir de injectBipLocale())', () => {
  it('todo componente nuevo con aria-label/placeholder/title/texto/mensaje en español debe usar el diccionario de i18n', () => {
    const offenders = findComponentFiles(SRC_DIR)
      .map((path) => ({ path, relPath: relative(SRC_DIR, path).replace(/\\/g, '/') }))
      .filter(({ relPath }) => !ALLOWLIST.has(relPath))
      .filter(({ path }) => hasHardcodedSpanish(readFileSync(path, 'utf-8')));

    expect(offenders.map((o) => o.relPath)).toEqual([]);
  });
});
