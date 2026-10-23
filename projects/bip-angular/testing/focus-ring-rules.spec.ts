import { describe, it, expect } from 'vitest';
import {
  findFocusFindings,
  hasFocusPseudo,
  isPureFocusVisible,
  parseRules,
  splitTopLevel,
  stripNot,
} from './focus-ring-rules';

const RING = 'box-shadow: var(--focus-ring);';

/** Selectores de los hallazgos, para comparar sin acoplarse al texto del detalle. */
const found = (css: string, allowlist: Record<string, string> = {}) =>
  findFocusFindings(css, allowlist).map((f) => `${f.kind}: ${f.selector}`);

describe('focus-ring-rules — parser', () => {
  it('no parte las comas de :is()/:not()/:host() ni de los atributos', () => {
    expect(splitTopLevel(':is(.a, .b):focus-visible, .c[data-x="1,2"]', ',')).toEqual([
      ':is(.a, .b):focus-visible',
      '.c[data-x="1,2"]',
    ]);
  });

  it('lee reglas dentro de @media/@supports y su contexto, y salta @keyframes', () => {
    const rules = parseRules(`
      @keyframes spin { from { opacity: 0; } to { opacity: 1; } }
      .a { color: red; }
      @media (forced-colors: active) { .b:focus-visible { outline: 2px solid; } }
    `);
    expect(rules.map((r) => [r.selectors, r.context])).toEqual([
      [['.a'], []],
      [['.b:focus-visible'], ['@media (forced-colors: active)']],
    ]);
  });

  it('ignora comentarios y toma la última declaración como efectiva', () => {
    const [rule] = parseRules(
      '.a { /* x { y } */ box-shadow: none; box-shadow: var(--focus-ring) !important; }'
    );
    expect(rule!.declarations.at(-1)).toEqual({ prop: 'box-shadow', value: 'var(--focus-ring)' });
  });

  it('falla en voz alta con CSS de anidamiento nativo', () => {
    expect(() => parseRules('.a { color: red; &:focus-visible { box-shadow: none; } }')).toThrow(
      /anidamiento/
    );
  });

  it('reconoce el foco en cualquier posición y descarta :not(:focus-visible)', () => {
    for (const sel of [
      '.a:focus',
      '.a:focus-visible:hover',
      '.a:focus-visible::after',
      ':host(.a:focus-visible)',
      ':is(.a, .b):focus-visible',
      '.a:focus-within',
    ])
      expect(hasFocusPseudo(sel), sel).toBe(true);
    expect(hasFocusPseudo('.a:not(:focus-visible)')).toBe(false);
    expect(hasFocusPseudo('.a:focus-ring')).toBe(false);
    expect(stripNot('.a:not(.b:not(.c)):hover')).toBe('.a:hover');
  });

  it('solo es "puro" el selector que termina en :focus-visible', () => {
    expect(isPureFocusVisible('.a:focus-visible')).toBe(true);
    expect(isPureFocusVisible(':host(.a:focus-visible)')).toBe(true);
    expect(isPureFocusVisible('.a:focus-visible:hover')).toBe(false);
    expect(isPureFocusVisible('.a:focus-visible::after')).toBe(false);
    expect(isPureFocusVisible('.a:focus')).toBe(false);
  });
});

describe('focus-ring-rules — lo que el guard debe detectar', () => {
  it.each<[string, string, string]>([
    [
      'anillo propio',
      `.a:focus-visible { box-shadow: 0 0 0 2px var(--color-primary); }`,
      '.a:focus-visible',
    ],
    ['en :focus', `.a:focus { box-shadow: 0 0 0 2px var(--color-primary); }`, '.a:focus'],
    [
      'en :focus-visible:hover',
      `.a:focus-visible:hover { box-shadow: 0 0 0 2px red; }`,
      '.a:focus-visible:hover',
    ],
    [
      'en ::after',
      `.a:focus-visible::after { box-shadow: 0 0 0 2px red; }`,
      '.a:focus-visible::after',
    ],
    [
      'en :host(:focus-visible)',
      `:host(:focus-visible) { box-shadow: 0 0 0 2px red; }`,
      ':host(:focus-visible)',
    ],
    [
      'dentro de :is()',
      `:is(.a, .b):focus-visible { box-shadow: 0 0 0 2px red; }`,
      ':is(.a, .b):focus-visible',
    ],
    ['en :focus-within', `.a:focus-within { box-shadow: 0 0 0 2px red; }`, '.a:focus-within'],
    ['en mayúsculas', `.a:FOCUS-VISIBLE { box-shadow: 0 0 0 2px red; }`, '.a:FOCUS-VISIBLE'],
    [
      'dentro de @media',
      `@media (min-width: 1px) { .a:focus-visible { box-shadow: 0 0 0 2px red; } }`,
      '.a:focus-visible @ @media (min-width: 1px)',
    ],
    [
      'dentro de @starting-style',
      `@starting-style { .a:focus-visible { box-shadow: 0 0 0 2px red; } }`,
      '.a:focus-visible @ @starting-style',
    ],
    [
      'la última declaración gana',
      `.a:focus-visible { box-shadow: var(--focus-ring); box-shadow: 0 0 0 2px red; }`,
      '.a:focus-visible',
    ],
    ['`none` en vez del anillo', `.a:focus-visible { box-shadow: none; }`, '.a:focus-visible'],
    [
      'selector con comillas y llaves en un atributo',
      `[data-x="{;}"] .a:focus-visible { box-shadow: 0 0 0 2px red; }`,
      '[data-x="{;}"] .a:focus-visible',
    ],
  ])('wrong-shadow: %s', (_name, css, selector) => {
    expect(found(css)).toEqual([`wrong-shadow: ${selector}`]);
  });

  it('wrong-shadow: reporta cada selector de una lista con comas dentro de :is()', () => {
    expect(found('.ok:focus-visible, :is(.a, .b):focus-visible { box-shadow: none; }')).toEqual([
      'wrong-shadow: .ok:focus-visible',
      'wrong-shadow: :is(.a, .b):focus-visible',
    ]);
  });

  it('missing-ring: :focus-visible sin ningún anillo en su grupo', () => {
    expect(found('.a:focus-visible { outline: none; }')).toEqual([
      'missing-ring: .a:focus-visible',
    ]);
    expect(found(':host(.a:focus-visible) { outline: none; }')).toEqual([
      'missing-ring: :host(.a:focus-visible)',
    ]);
  });

  it('missing-ring: regla vacía o sin declaraciones válidas', () => {
    expect(found('.a:focus-visible {}')).toEqual(['missing-ring: .a:focus-visible']);
    expect(found('.a:focus-visible { box-shadow var(--focus-ring) }')).toEqual([
      'missing-ring: .a:focus-visible',
    ]);
  });

  it('missing-ring: el anillo en otro @media no sirve para la regla de otro contexto', () => {
    expect(
      found(`
        @media print { .a:focus-visible { box-shadow: var(--focus-ring); } }
        @media screen { .a:focus-visible { outline: none; } }
      `)
    ).toEqual(['missing-ring: .a:focus-visible @ @media screen']);
  });

  it('missing-ring: :host(:focus-visible) sin clase', () => {
    expect(found(':host(:focus-visible) { outline: none; }')).toEqual([
      'missing-ring: :host(:focus-visible)',
    ]);
  });

  it('-webkit-box-shadow no cuenta como el anillo', () => {
    expect(found('.a:focus-visible { -webkit-box-shadow: var(--focus-ring); }')).toEqual([
      'missing-ring: .a:focus-visible',
    ]);
  });

  it('un -webkit-box-shadow no se confunde con el box-shadow efectivo', () => {
    expect(
      found(`.a:focus-visible { box-shadow: var(--focus-ring); -webkit-box-shadow: none; }`)
    ).toEqual([]);
  });
});

describe('focus-ring-rules — CSS que el parser no debe leer a medias', () => {
  it.each([
    [
      'llave de cierre suelta',
      '.a { color: red; } } .b:focus-visible { box-shadow: none; }',
      /inesperada/,
    ],
    ['llave sin cerrar', '.a { color: red;', /sin cerrar/],
    ['prelude sin terminar', '.a { color: red; } .b:focus-visible', /truncado/],
    ['bloque anidado en un @media sin cerrar', '@media (x) { .a { color: red; }', /./],
  ])('lanza error: %s', (_name, css, message) => {
    expect(() => parseRules(css)).toThrow(message);
  });

  it('no se confunde con comillas, url(;), escapes ni @layer sin bloque', () => {
    const rules = parseRules(String.raw`
      @layer base, theme;
      .a::after { content: "}{;"; background: url(data:image/png;base64,AAA); }
      .b\'c:focus-visible { box-shadow: var(--focus-ring) !important; }
    `);
    expect(rules.map((r) => r.selectors)).toEqual([
      ['.a::after'],
      [String.raw`.b\'c:focus-visible`],
    ]);
    expect(rules[0]!.declarations.map((d) => d.prop)).toEqual(['content', 'background']);
    expect(rules[1]!.declarations[0]!.value).toBe('var(--focus-ring)');
  });
});

describe('focus-ring-rules — lo que el guard debe aceptar', () => {
  it.each([
    ['el anillo', `.a:focus-visible { outline: none; ${RING} }`],
    [
      'anillo en la regla base y override de color aparte',
      `.a:focus-visible { ${RING} }\n.a:focus-visible { --focus-ring-color: var(--color-danger); }`,
    ],
    [
      'override de color en variante (hereda el anillo de la base)',
      `.a:focus-visible { ${RING} }\n.a.b:focus-visible { --focus-ring-color: red; }`,
    ],
    ['anillo con :is()', `:is(.a, .b):focus-visible { ${RING} }`],
    ['anillo en :host()', `:host(:focus-visible) { ${RING} }`],
    [
      'anillo en :focus y en :focus-visible',
      `.a:focus { outline: none; }\n.a:focus-visible { ${RING} }`,
    ],
    ['negar el foco', `.a:not(:focus-visible) { box-shadow: none; }`],
    ['reglas sin foco', `.a { box-shadow: 0 0 0 2px red; }\n.a:hover { box-shadow: none; }`],
    [
      'foco con otro estado que no pinta sombra',
      `.a:focus-visible { ${RING} }\n.a:focus-visible:hover { background: red; }`,
    ],
    ['anillo dentro de @media', `@media (min-width: 1px) { .a:focus-visible { ${RING} } }`],
    [
      '-webkit-box-shadow aparte del anillo',
      `.a:focus-visible { ${RING} -webkit-box-shadow: none; }`,
    ],
  ])('%s', (_name, css) => {
    expect(found(css)).toEqual([]);
  });

  it('respeta la allowlist por selector sin la pseudo-clase de foco', () => {
    const css = '.a:focus-visible { box-shadow: 0 0 0 2px red; }';
    expect(found(css, { '.a': 'motivo' })).toEqual([]);
    expect(found(css, { '.b': 'motivo' })).toHaveLength(1);
  });
});
