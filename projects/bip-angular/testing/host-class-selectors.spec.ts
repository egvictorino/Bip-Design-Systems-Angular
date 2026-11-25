import { readFileSync } from 'fs';
import { dirname, relative, resolve } from 'path';
import { describe, it, expect } from 'vitest';
import { findFiles } from './find-css-files';
import { parseRules } from './focus-ring-rules';

const SRC_DIR = resolve(__dirname, '..');

/**
 * Bajo `ViewEncapsulation.Emulated` un selector plano `.bip-x` se compila a `.bip-x[_ngcontent-H]`:
 * solo coincide con elementos del template del componente, nunca con su host (`_nghost-H`). Una
 * clase que el componente pone en su host y que su CSS estila con un selector plano no se aplica
 * jamás (text, card, stats-card, empty-state, alert, avatar y las celdas de tabla perdían así sus
 * variantes; 89e3d08 ya lo había corregido en otros 44). Lo correcto es `:host(.bip-x)`.
 *
 * Clases del host, leídas del `.ts`: `host: { class: '…' }`, `'[class.x]'` y, en `'[class]': 'fn()'`,
 * los literales del `computed` (prefijos `` `bip-x-${…}` `` incluidos) y los de las constantes
 * `UPPER_CASE` que use. Cubre todas las variantes, no solo las que usa alguna story.
 */

/** Desde un `{`/`(` en `start`, devuelve el bloque balanceado. */
function balanced(src: string, start: number): string {
  let depth = 0;
  for (let i = start; i < src.length; i++) {
    const ch = src[i];
    if (ch === '{' || ch === '(' || ch === '[') depth++;
    else if (ch === '}' || ch === ')' || ch === ']') {
      depth--;
      if (depth === 0) return src.slice(start, i + 1);
    }
  }
  return src.slice(start);
}

export function hostClasses(ts: string): Set<string> {
  const classes = new Set<string>();
  const hostAt = ts.search(/host:\s*\{/);
  if (hostAt < 0) return classes;
  const host = balanced(ts, ts.indexOf('{', hostAt));
  const statik = /\bclass:\s*'([^']*)'/.exec(host);
  statik?.[1]!
    .split(/\s+/)
    .filter(Boolean)
    .forEach((c) => classes.add(c));
  for (const [, cls] of host.matchAll(/'\[class\.([\w-]+)\]'/g)) classes.add(cls!);
  for (const [, fn] of host.matchAll(/'\[class\]':\s*'(\w+)\(\)'/g)) {
    const defAt = ts.search(new RegExp(`\\b${fn}\\s*=\\s*computed`));
    if (defAt < 0) continue;
    const body = balanced(ts, ts.indexOf('(', defAt));
    for (const [, lit] of body.matchAll(/['`]([^'`]*)['`]/g))
      lit!
        .replace(/\$\{[^}]*\}/g, ' ')
        .split(/\s+/)
        .filter((c) => /^[a-z][\w-]*$/.test(c))
        .forEach((c) => classes.add(c));
    for (const [, prefix] of body.matchAll(/`([\w-]+)\$\{/g)) classes.add(`${prefix}*`);
    for (const [, constant] of body.matchAll(/\b([A-Z][A-Z0-9_]+)\b/g)) {
      const constAt = ts.search(new RegExp(`const ${constant}\\b`));
      if (constAt < 0) continue;
      const eq = ts.indexOf('=', constAt);
      const open = eq + ts.slice(eq).search(/[{[]/);
      for (const [, lit] of balanced(ts, open).matchAll(/'([^']*)'/g))
        lit!
          .split(/\s+/)
          .filter((c) => c.startsWith('bip-'))
          .forEach((c) => classes.add(c));
    }
  }
  return classes;
}

/** Selectores que estilan una clase del host sin pasar por `:host`. */
export function flatHostSelectors(css: string, classes: Set<string>): string[] {
  const isHostClass = (cls: string) =>
    classes.has(cls) || [...classes].some((h) => h.endsWith('*') && cls.startsWith(h.slice(0, -1)));
  const hits: string[] = [];
  for (const rule of parseRules(css))
    for (const selector of rule.selectors) {
      // `:host(...)`, `:host-context(...)` y `:host.x` sí alcanzan al host; lo que va tras
      // `::ng-deep` está fuera de la encapsulación.
      const rest = selector
        .replace(/:host(-context)?\((?:[^()]|\([^()]*\))*\)/g, '')
        .replace(/:host(?:\.[\w-]+|\[[^\]]*\]|:[\w-]+(?:\([^)]*\))?)*/g, '')
        .replace(/::ng-deep[\s\S]*/, '');
      for (const [, cls] of rest.matchAll(/\.([a-zA-Z_][\w-]*)/g))
        if (isHostClass(cls!)) hits.push(`.${cls} :: ${selector}`);
    }
  return hits;
}

describe('CSS de componente — las clases del host se estilan con :host(...)', () => {
  const components = findFiles(
    SRC_DIR,
    (name) => name.endsWith('.ts') && !/\.(spec|stories)\.ts$/.test(name)
  ).flatMap((file) => {
    const ts = readFileSync(file, 'utf-8');
    const url = /styleUrls?:\s*\[?\s*'([^']+)'/.exec(ts)?.[1];
    return url ? [[relative(SRC_DIR, file), ts, resolve(dirname(file), url)] as const] : [];
  });

  it('encuentra componentes con host y styleUrl', () => {
    expect(components.filter(([, ts]) => hostClasses(ts).size > 0).length).toBeGreaterThan(50);
  });

  it.each(components.map(([rel, ts, css]) => [rel, ts, css]))('%s', (_rel, ts, css) => {
    expect(flatHostSelectors(readFileSync(css, 'utf-8'), hostClasses(ts))).toEqual([]);
  });

  it('detecta un selector plano de una clase del host y acepta :host(...) / :host.x', () => {
    const ts = `host: { class: 'bip-x', '[class]': 'hostClasses()' }
      protected readonly hostClasses = computed(() => [SIZE[this.size()], \`bip-x-align-\${a}\`]);
      const SIZE = { sm: 'bip-x--sm' };`;
    const css = `:host { display: block; }
      .bip-x--sm { padding: 0; }
      .bip-x-align-end .child { text-align: end; }
      :host(.bip-x--sm), :host.bip-x--sm, :host(.bip-x--sm) .bip-x-inner { gap: 0; }
      .bip-x-inner { color: red; }`;
    expect(flatHostSelectors(css, hostClasses(ts))).toEqual([
      '.bip-x--sm :: .bip-x--sm',
      '.bip-x-align-end :: .bip-x-align-end .child',
    ]);
  });

  it(':host con clase o atributo va entre paréntesis: `:host(.x)`, no `:host.x` ni `:host[a]`', () => {
    // Compilan igual bajo Emulated, pero `:host.x` no es CSS estándar; convención de CLAUDE.md.
    const offenders = components.flatMap(([rel, , css]) =>
      parseRules(readFileSync(css, 'utf-8')).flatMap((rule) =>
        rule.selectors
          .filter((selector) => /:host[.[]/.test(selector))
          .map((selector) => `${rel} :: ${selector}`)
      )
    );
    expect(offenders).toEqual([]);
  });
});
