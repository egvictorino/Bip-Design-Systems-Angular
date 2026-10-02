/**
 * Persistencia de la preferencia de tema en localStorage — solo los ejes no-controlados
 * (theme/colorScheme). SSR-safe: nunca se llama fuera de isPlatformBrowser() (ver
 * theme-context.ts). try/catch porque Safari en modo privado lanza en setItem, y un
 * valor corrupto en getItem no debe romper el render.
 */
import type { BipColorSchemePreference, BipThemeName } from './theme.types';

export interface StoredThemePreference {
  theme?: BipThemeName;
  colorScheme?: BipColorSchemePreference;
}

export function readStoredPreference(storageKey: string): StoredThemePreference | null {
  try {
    const raw = window.localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as StoredThemePreference) : null;
  } catch {
    // localStorage inaccesible (modo privado) o valor corrupto — se ignora, quedan los defaults.
    return null;
  }
}

export function writeStoredPreference(storageKey: string, value: StoredThemePreference): void {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(value));
  } catch {
    // Safari en modo privado lanza en setItem — la persistencia es best-effort.
  }
}
