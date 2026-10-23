/**
 * Mini-parser de reglas CSS para los guards de foco (testing/*focus*.spec.ts). Sin dependencias.
 *
 * Entiende lo que el CSS plano de la librería usa de verdad: comentarios, comas dentro de
 * `:is()`/`:not()`/`:host()`, `@media`/`@supports`/`@layer` anidados y varias declaraciones de la
 * misma propiedad (gana la última). Lo que no entiende falla en voz alta en vez de pasar en
 * silencio: CSS con anidamiento nativo (`&`) lanza un error.
 */

export interface CssDeclaration {
  prop: string;
  value: string;
}

export interface CssRule {
  /** Selectores de la lista, ya separados por las comas del nivel 0 y con espacios normalizados. */
  selectors: string[];
  declarations: CssDeclaration[];
  /** At-rules que envuelven la regla (`@media (...)`), de afuera hacia adentro. */
  context: string[];
}

/** At-rules con bloque cuyo contenido NO son reglas de estilo; el resto se recorre (media, supports, layer, starting-style…). */
const NON_STYLE_AT_RULES = new Set([
  'keyframes',
  '-webkit-keyframes',
  'font-face',
  'font-feature-values',
  'property',
  'page',
  'counter-style',
  'view-transition',
]);

export function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

/** Parte `text` por `separator` solo en el nivel 0 de paréntesis, corchetes y comillas. */
export function splitTopLevel(text: string, separator: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let quote: string | null = null;
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    if (quote) {
      if (ch === '\\') i++;
      else if (ch === quote) quote = null;
    } else if (ch === '\\') i++;
    else if (ch === '"' || ch === "'") quote = ch;
    else if (ch === '(' || ch === '[') depth++;
    else if (ch === ')' || ch === ']') depth--;
    else if (ch === separator && depth === 0) {
      parts.push(text.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(text.slice(start));
  return parts.map((p) => p.trim().replace(/\s+/g, ' ')).filter(Boolean);
}

function parseDeclarations(body: string): CssDeclaration[] {
  return splitTopLevel(body, ';').flatMap((decl) => {
    const colon = decl.indexOf(':');
    if (colon < 0) return [];
    return [
      {
        prop: decl.slice(0, colon).trim().toLowerCase(),
        value: decl
          .slice(colon + 1)
          .replace(/\s*!important\s*$/i, '')
          .trim(),
      },
    ];
  });
}

/** ¿Hay un `{` real (fuera de comillas, paréntesis y escapes) en el cuerpo de una regla? */
function hasNestedBlock(body: string): boolean {
  let quote: string | null = null;
  let depth = 0;
  for (let i = 0; i < body.length; i++) {
    const ch = body[i]!;
    if (quote) {
      if (ch === '\\') i++;
      else if (ch === quote) quote = null;
    } else if (ch === '\\') i++;
    else if (ch === '"' || ch === "'") quote = ch;
    else if (ch === '(' || ch === '[') depth++;
    else if (ch === ')' || ch === ']') depth--;
    else if (ch === '{' && depth === 0) return true;
  }
  return false;
}

export function parseRules(css: string): CssRule[] {
  const src = stripComments(css);
  const rules: CssRule[] = [];
  let i = 0;

  /** Avanza hasta el `}` que cierra el bloque cuyo `{` ya se consumió; devuelve su cuerpo. */
  const readBlock = (): string => {
    const start = i;
    let depth = 1;
    let quote: string | null = null;
    for (; i < src.length; i++) {
      const ch = src[i]!;
      if (quote) {
        if (ch === '\\') i++;
        else if (ch === quote) quote = null;
      } else if (ch === '\\') i++;
      else if (ch === '"' || ch === "'") quote = ch;
      else if (ch === '{') depth++;
      else if (ch === '}' && --depth === 0) break;
    }
    if (depth !== 0) throw new Error('Llave "{" sin cerrar en el CSS del guard de foco');
    return src.slice(start, i++);
  };

  const parse = (context: string[], nested: boolean): void => {
    while (i < src.length) {
      const start = i;
      let depth = 0;
      let quote: string | null = null;
      for (; i < src.length; i++) {
        const ch = src[i]!;
        if (quote) {
          if (ch === '\\') i++;
          else if (ch === quote) quote = null;
        } else if (ch === '\\') i++;
        else if (ch === '"' || ch === "'") quote = ch;
        else if (ch === '(' || ch === '[') depth++;
        else if (ch === ')' || ch === ']') depth--;
        else if (depth === 0 && (ch === '{' || ch === '}' || ch === ';')) break;
      }
      const prelude = src.slice(start, i).trim();
      if (i >= src.length) {
        if (prelude) throw new Error(`CSS truncado en el guard de foco: "${prelude}"`);
        if (nested) throw new Error('At-rule sin cerrar en el CSS del guard de foco');
        return;
      }
      const terminator = src[i++];
      if (terminator === '}') {
        if (!nested) throw new Error('Llave "}" inesperada en el CSS del guard de foco');
        return;
      }
      if (terminator === ';') continue;

      if (prelude.startsWith('@')) {
        const name = /^@([\w-]+)/.exec(prelude)![1]!.toLowerCase();
        if (NON_STYLE_AT_RULES.has(name)) readBlock();
        else parse([...context, prelude.replace(/\s+/g, ' ')], true);
        continue;
      }

      const body = readBlock();
      if (hasNestedBlock(body)) {
        throw new Error(
          `CSS con anidamiento nativo no soportado por el guard de foco: "${prelude}"`
        );
      }
      rules.push({
        selectors: splitTopLevel(prelude, ','),
        declarations: parseDeclarations(body),
        context,
      });
    }
    if (nested) throw new Error('At-rule sin cerrar en el CSS del guard de foco');
  };

  parse([], false);
  return rules;
}

/** Valor efectivo de `prop` en la regla (la última declaración gana; `-webkit-box-shadow` no cuenta). */
export function lastValue(rule: CssRule, prop: string): string | undefined {
  return rule.declarations.filter((d) => d.prop === prop).at(-1)?.value;
}

/** Quita los grupos `:not(...)` (balanceados): negar el foco no es un estilo de foco. */
export function stripNot(selector: string): string {
  let out = '';
  for (let i = 0; i < selector.length; i++) {
    if (selector.startsWith(':not(', i)) {
      let depth = 0;
      let j = i + 4;
      for (; j < selector.length; j++) {
        if (selector[j] === '(') depth++;
        else if (selector[j] === ')' && --depth === 0) break;
      }
      i = j;
    } else out += selector[i];
  }
  return out;
}

const FOCUS_PSEUDO = /:focus(?:-visible|-within)?(?![\w-])/gi;

export function hasFocusPseudo(selector: string): boolean {
  return /:focus(?:-visible|-within)?(?![\w-])/i.test(stripNot(selector));
}

/** Selector sin ninguna pseudo-clase de foco (clave de la allowlist). */
export function withoutFocus(selector: string): string {
  return selector.replace(FOCUS_PSEUDO, '');
}

/**
 * Selector "puro" de foco de teclado: el último estado es `:focus-visible` (también dentro de
 * `:host(...)`/`:is(...)`), sin `:hover` ni pseudo-elementos detrás.
 */
export function isPureFocusVisible(selector: string): boolean {
  return /:focus-visible\)?$/i.test(stripNot(selector));
}

export type FocusFindingKind = 'wrong-shadow' | 'missing-ring';

export interface FocusFinding {
  kind: FocusFindingKind;
  selector: string;
  /** `wrong-shadow`: el `box-shadow` que pinta. `missing-ring`: lo que sí declara (informativo). */
  detail: string;
}

/**
 * Reglas de foco que no pintan `var(--focus-ring)`:
 *  - `wrong-shadow`: cualquier selector con `:focus`/`:focus-visible`/`:focus-within` (en cualquier
 *    posición, también `:is()`, `:host()`, `:focus-visible:hover`, `::after`) cuyo `box-shadow`
 *    efectivo no es `var(--focus-ring)`.
 *  - `missing-ring`: selector `:focus-visible` puro cuyo grupo (el selector sin el foco) no tiene
 *    ninguna regla con `box-shadow: var(--focus-ring)`. Las reglas que solo declaran custom
 *    properties (`--focus-ring-color`) no exigen anillo propio: lo hereda de la regla base.
 *
 * `allowlist` se indexa por el selector sin la pseudo-clase de foco.
 */
export function findFocusFindings(
  css: string,
  allowlist: Record<string, string> = {}
): FocusFinding[] {
  const findings: FocusFinding[] = [];
  const needRing = new Map<string, { selector: string; detail: string }>();
  // Clave `contexto>>base`; un anillo fuera de todo @media sirve para cualquier contexto.
  const withRing = new Set<string>();

  for (const rule of parseRules(css)) {
    const shadow = lastValue(rule, 'box-shadow');
    const onlyCustomProps =
      rule.declarations.length > 0 && rule.declarations.every((d) => d.prop.startsWith('--'));
    const context = rule.context.join(' | ');
    const hasRing = shadow !== undefined && shadow.replace(/\s+/g, '') === 'var(--focus-ring)';
    for (const selector of rule.selectors) {
      if (!hasFocusPseudo(selector)) continue;
      if (withoutFocus(selector) in allowlist) continue;
      const where = rule.context.length ? `${selector} @ ${rule.context.join(' ')}` : selector;

      if (shadow !== undefined && !hasRing)
        findings.push({ kind: 'wrong-shadow', selector: where, detail: shadow });

      if (isPureFocusVisible(selector)) {
        const base = stripNot(selector).replace(/:focus-visible(\)?)$/i, '$1');
        if (hasRing) withRing.add(`${context}>>${base}`);
        else if (!onlyCustomProps && shadow === undefined)
          needRing.set(`${context}>>${base}`, {
            selector: where,
            detail: rule.declarations.map((d) => `${d.prop}: ${d.value}`).join('; '),
          });
      }
    }
  }

  for (const [key, { selector, detail }] of needRing) {
    const base = key.slice(key.indexOf('>>') + 2);
    if (!withRing.has(key) && !withRing.has(`>>${base}`))
      findings.push({ kind: 'missing-ring', selector, detail });
  }
  return findings;
}

/** Forma en una línea, para los `toEqual([])` de los guards. */
export function formatFinding(relPath: string, f: FocusFinding): string {
  return f.kind === 'wrong-shadow'
    ? `${relPath} :: ${f.selector} { box-shadow: ${f.detail} }`
    : `${relPath} :: ${f.selector} sin var(--focus-ring) { ${f.detail} }`;
}
