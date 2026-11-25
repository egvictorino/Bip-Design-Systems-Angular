import type { BipTokenOverrides } from '../core/src/theme';

/**
 * Presets de marca para el toolbar `brand` de Storybook (ver .storybook/preview.ts) — cada
 * uno es un `tokens` override que se pasa directo a `<bip-theme-provider [tokens]>`. No se
 * publica con la librería (vive en foundations/, ver CLAUDE.md § Estructura).
 */
export interface BipBrandPreset {
  label: string;
  tokens: BipTokenOverrides;
}

export const BRAND_PRESETS: Record<string, BipBrandPreset> = {
  default: { label: 'Default', tokens: {} },
  canary: { label: 'Canary', tokens: { colorPrimary: '#ffe066' } },
};

export const BRAND_PRESET_KEYS = Object.keys(BRAND_PRESETS);
