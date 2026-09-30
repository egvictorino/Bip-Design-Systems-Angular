import type { BipLocale, PartialBipLocale } from './locale.types';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Un solo nivel de recursión alcanza — `BipLocale` tiene exactamente dos niveles de
 * profundidad (sección → clave). Puerto de mergeLocale() en LocaleContext.tsx (React).
 */
export function mergeLocale(base: BipLocale, override?: PartialBipLocale): BipLocale {
  if (!override) return base;
  const result = { ...base } as Record<string, unknown>;
  for (const key of Object.keys(override) as (keyof BipLocale)[]) {
    const overrideValue = override[key];
    const baseValue = base[key];
    result[key] =
      isPlainObject(overrideValue) && isPlainObject(baseValue)
        ? { ...baseValue, ...overrideValue }
        : overrideValue;
  }
  return result as unknown as BipLocale;
}
