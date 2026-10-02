import { describe, expect, it } from 'vitest';
import { enUS } from './en-us.locale';
import { esMX } from './es-mx.locale';
import type { BipLocale } from './locale.types';

/**
 * `BipLocale` trae ~30 funciones de interpolación (pagination.page, odontogram.selectTooth,
 * etc.) que la mayoría de tests de componentes nunca ejercitan directamente, ya que renderean
 * con el default es-MX y rara vez tocan cada label dinámico. Esto recorre cada entrada función
 * de ambos diccionarios y la invoca, así un typo que rompe la interpolación (o una rama sin
 * usar en en-US específicamente) falla un test en vez de aparecer solo en el playground de
 * Storybook Foundations/I18n. Puerto de dictionaries.test.ts (React).
 */
function callEveryFunction(locale: BipLocale, path = ''): void {
  for (const [key, value] of Object.entries(locale as unknown as Record<string, unknown>)) {
    const currentPath = path ? `${path}.${key}` : key;
    if (typeof value === 'function') {
      const result = (value as (...args: unknown[]) => unknown)('Sample', 3, true, 'Extra');
      expect(typeof result, `${currentPath} debe devolver un string`).toBe('string');
      expect(
        (result as string).length,
        `${currentPath} no debe devolver un string vacío`
      ).toBeGreaterThan(0);
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      callEveryFunction(value as unknown as BipLocale, currentPath);
    }
  }
}

/**
 * Recorre recursivamente cada valor del diccionario y produce una ruta hoja por entrada
 * (claves anidadas ordenadas en cada nivel; arrays/funciones/primitivos marcados distinto:
 * `section.key[]`, `section.key()`, `section.key`) — así una clave anidada faltante o de más
 * (p. ej. una sección de BipLocale presente en esMX pero no en enUS) hace fallar la
 * comparación de forma. Comparar solo `Object.keys()` del nivel superior no detectaría esa
 * clase de desvío.
 */
function collectShape(value: unknown, path: string, out: string[]): void {
  if (Array.isArray(value)) {
    out.push(`${path}[]`);
  } else if (typeof value === 'function') {
    out.push(`${path}()`);
  } else if (value && typeof value === 'object') {
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      collectShape((value as Record<string, unknown>)[key], path ? `${path}.${key}` : key, out);
    }
  } else {
    out.push(path);
  }
}

describe('diccionario esMX', () => {
  it('cada función de interpolación devuelve un string no vacío', () => {
    callEveryFunction(esMX);
  });
});

describe('diccionario enUS', () => {
  it('cada función de interpolación devuelve un string no vacío', () => {
    callEveryFunction(enUS);
  });

  it('coincide con la forma de esMX (mismas secciones/claves, recursivamente)', () => {
    const esShape: string[] = [];
    const enShape: string[] = [];
    collectShape(esMX, '', esShape);
    collectShape(enUS, '', enShape);
    expect(enShape.sort()).toEqual(esShape.sort());
  });
});
