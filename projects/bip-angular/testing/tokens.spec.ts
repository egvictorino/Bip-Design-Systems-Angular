import { readFileSync } from 'fs';
import { resolve } from 'path';
import { describe, it, expect } from 'vitest';

const TOKENS_CSS_PATH = resolve(__dirname, '../styles/tokens.css');
const THEMES_CSS_PATH = resolve(__dirname, '../styles/themes.css');
const PRIMITIVES_CSS_PATH = resolve(__dirname, '../styles/primitives.css');
const DENSITY_CSS_PATH = resolve(__dirname, '../styles/density.css');

/**
 * Tokens que son invariantes a propósito entre esquemas de color y no
 * deben tener contraparte en el bloque [data-color-scheme='dark'].
 * --color-txt-white es "texto sobre relleno de marca" — correcto en
 * ambos esquemas (ver CLAUDE.md § Reglas de código).
 */
const SCHEME_INVARIANT_TOKENS = new Set(['color-txt-white']);

/**
 * Tokens semánticos que el Bloque 2 (bipTheme) debe poder mapear vía
 * RADIUS_VAR_MAP / FOCUS_RING_VAR_MAP / MOTION_VAR_MAP / SPACING_VAR_MAP — se
 * comprueba aquí que la capa CSS ya los declara, sin depender todavía de
 * bipTheme (llega en el Bloque 2).
 */
const EXPECTED_RADIUS_TOKENS = [
  'radius-marker',
  'radius-field',
  'radius-control',
  'radius-surface',
  'radius-container',
  'radius-container-lg',
];
const EXPECTED_FOCUS_RING_TOKENS = [
  'focus-ring-width',
  'focus-ring-offset',
  'focus-ring-color',
  'focus-ring',
];
const EXPECTED_MOTION_TOKENS = [
  'duration-instant',
  'duration-fast',
  'duration-normal',
  'duration-slow',
  'ease-standard',
  'ease-out',
  'ease-in',
];
const EXPECTED_SPACING_TOKENS = [
  'space-control-x-sm',
  'space-control-y-sm',
  'space-control-x-md',
  'space-control-y-md',
  'space-control-x-lg',
  'space-control-y-lg',
];

const extractBlock = (css: string, selectorPattern: RegExp): string => {
  const match = css.match(selectorPattern);
  if (!match) throw new Error(`No se encontró el bloque para ${selectorPattern}`);
  return match[1];
};

const extractDeclaredTokens = (block: string): string[] =>
  [...block.matchAll(/--([\w-]+):/g)].map((m) => m[1]);

describe('styles/tokens.css — dominio del eje de color/esquema', () => {
  it('contiene solo tokens --color-* y --shadow-* — no typography/radius (viven en primitives.css)', () => {
    const tokensCss = readFileSync(TOKENS_CSS_PATH, 'utf-8');
    const declarations = tokensCss.match(/--[a-z0-9-]+(?=:)/g) ?? [];
    expect(declarations.length).toBeGreaterThan(0);
    for (const decl of declarations) {
      expect(decl).toMatch(/^--(color|shadow)-/);
    }
  });

  it("todo token del esquema claro ([data-color-scheme='light']) tiene contraparte en [data-color-scheme='dark'], salvo invariantes declarados", () => {
    const tokensCss = readFileSync(TOKENS_CSS_PATH, 'utf-8');
    const lightTokens = extractDeclaredTokens(
      extractBlock(tokensCss, /\[data-color-scheme='light'\]\s*{([^}]*)}/s)
    );
    const darkTokens = new Set(
      extractDeclaredTokens(extractBlock(tokensCss, /\[data-color-scheme='dark'\]\s*{([^}]*)}/s))
    );

    const missing = lightTokens.filter(
      (t) => !darkTokens.has(t) && !SCHEME_INVARIANT_TOKENS.has(t)
    );
    expect(missing).toEqual([]);
  });

  it('el bloque dark no declara tokens ausentes del esquema claro', () => {
    const tokensCss = readFileSync(TOKENS_CSS_PATH, 'utf-8');
    const lightTokens = new Set(
      extractDeclaredTokens(extractBlock(tokensCss, /\[data-color-scheme='light'\]\s*{([^}]*)}/s))
    );
    const darkTokens = extractDeclaredTokens(
      extractBlock(tokensCss, /\[data-color-scheme='dark'\]\s*{([^}]*)}/s)
    );

    const extra = darkTokens.filter((t) => !lightTokens.has(t));
    expect(extra).toEqual([]);
  });

  it('declara color-scheme: dark en el bloque oscuro (controles nativos / scrollbars)', () => {
    const tokensCss = readFileSync(TOKENS_CSS_PATH, 'utf-8');
    const darkBlock = extractBlock(tokensCss, /\[data-color-scheme='dark'\]\s*{([^}]*)}/s);
    expect(darkBlock).toMatch(/color-scheme:\s*dark/);
  });

  it('ambos esquemas usan selector doble (:root + [data-color-scheme=X]) — necesario para que los derivados se re-resuelvan en un <bip-theme-provider> anidado, no solo en <html>', () => {
    const tokensCss = readFileSync(TOKENS_CSS_PATH, 'utf-8');
    expect(tokensCss).toMatch(/:root,\s*\n\s*\[data-color-scheme='light'\]\s*{/);
    expect(tokensCss).toMatch(
      /:root\[data-color-scheme='dark'\],\s*\n\s*\[data-color-scheme='dark'\]\s*{/
    );
  });

  it('cada declaración de color es una semilla (hex literal) o un derivado que referencia var(--color-*)', () => {
    const tokensCss = readFileSync(TOKENS_CSS_PATH, 'utf-8').replace(/\/\*[\s\S]*?\*\//g, '');
    const declarations = [...tokensCss.matchAll(/--(color-[\w-]+):\s*([^;]+);/g)].map(
      ([, name, value]) => ({
        name,
        value: value.trim(),
      })
    );

    const isHexLiteral = (v: string) => /^#[0-9a-fA-F]{3,8}$/.test(v);
    const isDerived = (v: string) => v.startsWith('var(--') || v.startsWith('color-mix(');

    const invalid = declarations.filter((d) => !isHexLiteral(d.value) && !isDerived(d.value));
    expect(invalid).toEqual([]);
  });
});

describe('styles/themes.css — dominio del eje de tema (square/rounded)', () => {
  it('declara todos los tokens semánticos de radius que bipTheme (Bloque 2) deberá mapear', () => {
    const themesCss = readFileSync(THEMES_CSS_PATH, 'utf-8');
    for (const token of EXPECTED_RADIUS_TOKENS) {
      expect(themesCss).toContain(`--${token}:`);
    }
  });

  it("[data-theme='square'] y [data-theme='rounded'] declaran exactamente el mismo conjunto de tokens", () => {
    const themesCss = readFileSync(THEMES_CSS_PATH, 'utf-8');
    const squareTokens = new Set(
      extractDeclaredTokens(extractBlock(themesCss, /\[data-theme='square'\]\s*{([^}]*)}/s))
    );
    const roundedTokens = new Set(
      extractDeclaredTokens(extractBlock(themesCss, /\[data-theme='rounded'\]\s*{([^}]*)}/s))
    );

    expect([...squareTokens].sort()).toEqual([...roundedTokens].sort());
  });
});

describe('styles/primitives.css — dominio invariante (motion, focus ring, tipografía, z-index)', () => {
  it('declara los tokens de focus-ring que bipTheme (Bloque 2) deberá mapear', () => {
    const primitivesCss = readFileSync(PRIMITIVES_CSS_PATH, 'utf-8');
    for (const token of EXPECTED_FOCUS_RING_TOKENS) {
      expect(primitivesCss).toContain(`--${token}:`);
    }
  });

  it('declara los tokens de motion que bipTheme (Bloque 2) deberá mapear', () => {
    const primitivesCss = readFileSync(PRIMITIVES_CSS_PATH, 'utf-8');
    for (const token of EXPECTED_MOTION_TOKENS) {
      expect(primitivesCss).toContain(`--${token}:`);
    }
  });
});

describe('styles/density.css — dominio del eje de densidad (comfortable/compact)', () => {
  it('declara los tokens de spacing de control que bipTheme (Bloque 2) deberá mapear', () => {
    const densityCss = readFileSync(DENSITY_CSS_PATH, 'utf-8');
    for (const token of EXPECTED_SPACING_TOKENS) {
      expect(densityCss).toContain(`--${token}:`);
    }
  });

  it("[data-density='comfortable'] y [data-density='compact'] declaran exactamente el mismo conjunto de tokens", () => {
    const densityCss = readFileSync(DENSITY_CSS_PATH, 'utf-8');
    const comfortableTokens = new Set(
      extractDeclaredTokens(extractBlock(densityCss, /\[data-density='comfortable'\]\s*{([^}]*)}/s))
    );
    const compactTokens = new Set(
      extractDeclaredTokens(extractBlock(densityCss, /\[data-density='compact'\]\s*{([^}]*)}/s))
    );

    expect([...comfortableTokens].sort()).toEqual([...compactTokens].sort());
  });
});
