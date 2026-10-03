import { readFileSync } from 'fs';
import { resolve } from 'path';
import { describe, it, expect } from 'vitest';
import { contrastRatio } from '../core/src/utils/contrast';

const TOKENS_CSS_PATH = resolve(__dirname, '../styles/tokens.css');

/**
 * WCAG AA para texto normal — mismo umbral que bipTheme's warnIfLowContrast() usará
 * en el Bloque 2 (ver ThemeProvider.tsx AA_CONTRAST_THRESHOLD en la referencia React).
 */
const AA_CONTRAST_THRESHOLD = 4.5;

/**
 * Pares semilla de relleno ←→ --color-txt-on-* que bipTheme (Bloque 2) recalculará en
 * runtime con pickReadableText() cuando el consumidor sobrescriba la semilla. Aquí solo
 * se verifica que los valores por defecto del sistema ya cumplen AA — ver el límite
 * documentado abajo.
 */
const FILL_PAIRS: Array<[seed: string, onText: string]> = [
  ['color-primary', 'color-txt-on-primary'],
  ['color-danger', 'color-txt-on-danger'],
  ['color-success', 'color-txt-on-success'],
  ['color-warning', 'color-txt-on-warning'],
  ['color-info', 'color-txt-on-info'],
  ['color-unique', 'color-txt-on-unique'],
];

const extractBlock = (css: string, selectorPattern: RegExp): string => {
  const match = css.match(selectorPattern);
  if (!match) throw new Error(`No se encontró el bloque para ${selectorPattern}`);
  return match[1];
};

/**
 * A diferencia de tokens.spec.ts (solo nombres), acá se necesita el valor — pero solo
 * para hex literales: los derivados con color-mix() no se pueden resolver sin un motor
 * CSS real, así que se excluyen y se devuelve un Map parcial. Ver el límite documentado
 * abajo.
 */
const extractHexValues = (block: string): Map<string, string> => {
  const map = new Map<string, string>();
  for (const [, name, value] of block.matchAll(/--([\w-]+):\s*([^;]+);/g)) {
    const trimmed = value.trim();
    if (/^#[0-9a-fA-F]{3,8}$/.test(trimmed)) map.set(name, trimmed);
  }
  return map;
};

describe('styles/tokens.css — contraste WCAG AA de tokens reales (no solo la función contrastRatio)', () => {
  const tokensCss = readFileSync(TOKENS_CSS_PATH, 'utf-8');
  const lightValues = extractHexValues(
    extractBlock(tokensCss, /\[data-color-scheme='light'\]\s*{([^}]*)}/s)
  );
  const darkValues = extractHexValues(
    extractBlock(tokensCss, /\[data-color-scheme='dark'\]\s*{([^}]*)}/s)
  );

  /**
   * Límite explícito de esta suite: solo evalúa pares cuyo valor en tokens.css es un hex
   * literal — las 6 semillas de relleno contra su --color-txt-on-*, y el par base
   * --color-txt / --color-surface-1. Los derivados con color-mix() (hover, press, light,
   * subtle, text, etc.) no se pueden resolver a un hex concreto sin un motor CSS real —
   * ese contraste renderizado lo cubrirá @axe-core/playwright en visual/a11y-browser.spec.ts
   * (Bloque 11), corriendo axe con color-contrast activado en un navegador de verdad. No
   * asumir que esta suite cubre toda la paleta: cubre las semillas de fill, que es lo único
   * que bipTheme recalculará en runtime vía pickReadableText() (Bloque 2).
   */
  describe.each(['light', 'dark'] as const)('esquema %s', (scheme) => {
    const values = scheme === 'light' ? lightValues : darkValues;

    it.each(FILL_PAIRS)('%s alcanza 4.5:1 contra su %s', (seedVar, onTextVar) => {
      const seedHex = values.get(seedVar);
      const onTextHex = values.get(onTextVar);

      expect(seedHex, `--${seedVar} no se encontró como hex literal en tokens.css`).toBeDefined();
      expect(
        onTextHex,
        `--${onTextVar} no se encontró como hex literal en tokens.css`
      ).toBeDefined();

      const ratio = contrastRatio(seedHex!, onTextHex!);
      expect(
        ratio,
        `--${seedVar}(${seedHex}) vs --${onTextVar}(${onTextHex}) = ${ratio.toFixed(2)}:1, mínimo ${AA_CONTRAST_THRESHOLD}:1`
      ).toBeGreaterThanOrEqual(AA_CONTRAST_THRESHOLD);
    });

    it('--color-txt alcanza 4.5:1 contra --color-surface-1', () => {
      const txt = values.get('color-txt');
      const surface = values.get('color-surface-1');
      expect(txt).toBeDefined();
      expect(surface).toBeDefined();

      const ratio = contrastRatio(txt!, surface!);
      expect(
        ratio,
        `--color-txt(${txt}) vs --color-surface-1(${surface}) = ${ratio.toFixed(2)}:1, mínimo ${AA_CONTRAST_THRESHOLD}:1`
      ).toBeGreaterThanOrEqual(AA_CONTRAST_THRESHOLD);
    });

    /**
     * Texto atenuado de calendar-grid: días de otro mes (--color-txt-utility sobre el panel) y
     * sobre --color-secondary en rango/hover (--color-txt-secondary).
     */
    it.each([
      ['color-txt-utility', 'color-surface-1'],
      ['color-txt-secondary', 'color-secondary'],
    ])('--%s alcanza 4.5:1 contra --%s', (fgVar, bgVar) => {
      const fg = values.get(fgVar);
      const bg = values.get(bgVar);
      expect(fg).toBeDefined();
      expect(bg).toBeDefined();

      const ratio = contrastRatio(fg!, bg!);
      expect(
        ratio,
        `--${fgVar}(${fg}) vs --${bgVar}(${bg}) = ${ratio.toFixed(2)}:1, mínimo ${AA_CONTRAST_THRESHOLD}:1`
      ).toBeGreaterThanOrEqual(AA_CONTRAST_THRESHOLD);
    });
  });
});
