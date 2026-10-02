/**
 * Tipos y overrides del eje de theming — puerto de
 * bip-design-system (React) src/components/ThemeProvider/ThemeProvider.tsx.
 * Sin dependencias de Angular: puro TypeScript, reutilizable en tests/tooling.
 */
import type {
  BipColorScheme,
  BipDensity,
  BipDir,
  BipResolvedColorScheme,
  BipThemeName,
} from '../types';

export type { BipColorScheme, BipDensity, BipDir, BipResolvedColorScheme, BipThemeName };

/**
 * Overrides de marca — cada clave mapea a una token "semilla" en tokens.css
 * (ver TOKEN_VAR_MAP). Sobrescribir una semilla recolorea automáticamente
 * toda su familia derivada (hover/press/focus/text/light/subtle) vía los
 * color-mix() ya declarados en tokens.css.
 */
export interface BipTokenOverrides {
  colorPrimary?: string;
  colorSecondary?: string;
  colorDanger?: string;
  colorInfo?: string;
  colorSuccess?: string;
  colorWarning?: string;
  colorUnique?: string;
  colorLink?: string;
  colorTxt?: string;
  colorSurface?: string;
  colorEdge?: string;
  colorField?: string;
  /** Sobrescribe --font-sans — p. ej. 'Poppins, sans-serif'. No varía por esquema. */
  fontFamily?: string;
}

/**
 * Overrides de los 6 tokens semánticos de radius (styles/themes.css) — un
 * eje aparte de `tokens` porque no varía por esquema de color, sino por
 * `theme` (square/rounded), y porque cada override es independiente en vez
 * de derivarse de una única semilla como el eje de color.
 */
export interface BipRadiusOverrides {
  marker?: string;
  field?: string;
  control?: string;
  surface?: string;
  container?: string;
  containerLg?: string;
}

/**
 * Overrides del anillo de foco — reemplaza el `box-shadow: var(--focus-ring)`
 * que cada componente re-declara (ver `--focus-ring` en primitives.css).
 */
export interface BipFocusRingOverrides {
  width?: string;
  offset?: string;
  color?: string;
}

/** Overrides de motion — duraciones/easings de primitives.css. */
export interface BipMotionOverrides {
  durationInstant?: string;
  durationFast?: string;
  durationNormal?: string;
  durationSlow?: string;
  easeStandard?: string;
  easeOut?: string;
  easeIn?: string;
}

/**
 * Overrides de la horquilla de padding de controles (density.css) — la parte de la
 * escala --space-* donde compact/comfortable realmente cambia el layout. El resto de
 * --space-* (gaps, paddings de superficie, etc.) es invariante a densidad por diseño.
 */
export interface BipSpacingOverrides {
  controlXSm?: string;
  controlYSm?: string;
  controlXMd?: string;
  controlYMd?: string;
  controlXLg?: string;
  controlYLg?: string;
}

/** Preferencia declarada por el consumidor — 'system' se resuelve a light/dark en runtime. */
export type BipColorSchemePreference = BipColorScheme;

export interface BipThemeTokens extends BipTokenOverrides {
  light?: BipTokenOverrides;
  dark?: BipTokenOverrides;
}

export interface ThemeControls {
  theme: BipThemeName;
  /** Preferencia declarada — puede ser 'system'; usar `resolvedColorScheme` para pintar el icono sol/luna. */
  colorScheme: BipColorSchemePreference;
  resolvedColorScheme: BipResolvedColorScheme;
  setTheme: (theme: BipThemeName) => void;
  setColorScheme: (colorScheme: BipColorSchemePreference) => void;
  /** Alterna entre light/dark. Si la preferencia actual es 'system', parte del valor resuelto. */
  toggleColorScheme: () => void;
}

export const NOOP_CONTROLS: ThemeControls = {
  theme: 'square',
  colorScheme: 'light',
  resolvedColorScheme: 'light',
  setTheme: () => {},
  setColorScheme: () => {},
  toggleColorScheme: () => {},
};

/** Config a nivel app para `provideBipTheme()`. */
export interface BipThemeConfig {
  defaultTheme?: BipThemeName;
  defaultColorScheme?: BipColorSchemePreference;
  storageKey?: string;
  tokens?: BipThemeTokens;
  radius?: BipRadiusOverrides;
  focusRing?: BipFocusRingOverrides;
  motion?: BipMotionOverrides;
  density?: BipDensity;
  spacing?: BipSpacingOverrides;
  dir?: BipDir;
  cssVars?: Record<string, string>;
}
