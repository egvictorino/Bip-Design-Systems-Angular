/**
 * Mapas de overrides -> CSS custom properties, y los resolvers que los consumen.
 * Puerto de ThemeProvider.tsx (React) — ver TOKEN_VAR_MAP/RADIUS_VAR_MAP/etc.
 */
import { pickReadableText, contrastRatio } from '../utils/contrast';
import type {
  BipFocusRingOverrides,
  BipMotionOverrides,
  BipRadiusOverrides,
  BipResolvedColorScheme,
  BipSpacingOverrides,
  BipThemeTokens,
  BipTokenOverrides,
} from './theme.types';

/** Único punto a actualizar si se agrega una semilla nueva a tokens.css. */
export const TOKEN_VAR_MAP: Record<keyof BipTokenOverrides, string> = {
  colorPrimary: '--color-primary',
  colorSecondary: '--color-secondary',
  colorDanger: '--color-danger',
  colorInfo: '--color-info',
  colorSuccess: '--color-success',
  colorWarning: '--color-warning',
  colorUnique: '--color-unique',
  colorLink: '--color-link',
  colorTxt: '--color-txt',
  colorSurface: '--color-surface-1',
  colorEdge: '--color-edge',
  colorField: '--color-field',
  fontFamily: '--font-sans',
};

export const RADIUS_VAR_MAP: Record<keyof BipRadiusOverrides, string> = {
  marker: '--radius-marker',
  field: '--radius-field',
  control: '--radius-control',
  surface: '--radius-surface',
  container: '--radius-container',
  containerLg: '--radius-container-lg',
};

export const FOCUS_RING_VAR_MAP: Record<keyof BipFocusRingOverrides, string> = {
  width: '--focus-ring-width',
  offset: '--focus-ring-offset',
  color: '--focus-ring-color',
};

export const MOTION_VAR_MAP: Record<keyof BipMotionOverrides, string> = {
  durationInstant: '--duration-instant',
  durationFast: '--duration-fast',
  durationNormal: '--duration-normal',
  durationSlow: '--duration-slow',
  easeStandard: '--ease-standard',
  easeOut: '--ease-out',
  easeIn: '--ease-in',
};

export const SPACING_VAR_MAP: Record<keyof BipSpacingOverrides, string> = {
  controlXSm: '--space-control-x-sm',
  controlYSm: '--space-control-y-sm',
  controlXMd: '--space-control-x-md',
  controlYMd: '--space-control-y-md',
  controlXLg: '--space-control-x-lg',
  controlYLg: '--space-control-y-lg',
};

/**
 * Semillas de relleno de marca — al sobrescribirlas, se recalcula con
 * pickReadableText() el token --color-txt-on-* correspondiente (ver
 * tokens.css § contraste automático). Solo las semillas usadas como fondo
 * sólido con texto encima entran aquí.
 */
export const ON_TEXT_VAR_MAP: Partial<Record<keyof BipTokenOverrides, string>> = {
  colorPrimary: '--color-txt-on-primary',
  colorDanger: '--color-txt-on-danger',
  colorSuccess: '--color-txt-on-success',
  colorWarning: '--color-txt-on-warning',
  colorInfo: '--color-txt-on-info',
  colorUnique: '--color-txt-on-unique',
};

/**
 * Resuelve cualquier objeto de overrides "plano" (radius/focusRing/motion/spacing —
 * cada clave independiente, a diferencia de `tokens` que deriva toda una familia de
 * una sola semilla) contra su *_VAR_MAP correspondiente.
 */
export function resolveVarMap<T extends object>(
  overrides: T | undefined,
  map: Record<keyof T, string>
): Record<string, string> {
  if (!overrides) return {};
  const vars: Record<string, string> = {};
  for (const [key, value] of Object.entries(overrides) as [keyof T, string | undefined][]) {
    if (value === undefined) continue;
    vars[map[key]] = value;
  }
  return vars;
}

const CSS_CUSTOM_PROPERTY_RE = /^--[\w-]+$/;

/**
 * `cssVars` (el escape hatch de `<bip-theme-provider>`) termina en un `[style]` del host y
 * en el pane de cualquier `BipOverlay` — a diferencia del resto de los *_VAR_MAP, aquí la
 * CLAVE también es arbitraria (la define quien llama), no solo el valor. Angular no sanitiza
 * bindings de `style`, así que una clave que no sea una custom property (`background-image`,
 * `behavior`, etc.) terminaría aplicándose igual — si ese valor viniera de datos externos no
 * confiables, eso habilita cosas como una petición saliente vía `url(...)`. Se descarta
 * cualquier entrada cuya clave no sea una custom property (`--algo`), con `console.warn` en
 * desarrollo para que el error de tipeo no quede en silencio.
 */
export function sanitizeCssVars(
  cssVars: Record<string, string> | undefined,
  devWarn = false
): Record<string, string> {
  if (!cssVars) return {};
  const sanitized: Record<string, string> = {};
  for (const [key, value] of Object.entries(cssVars)) {
    if (CSS_CUSTOM_PROPERTY_RE.test(key)) {
      sanitized[key] = value;
    } else if (devWarn) {
      console.warn(
        `[BipTheme] cssVars ignora la clave "${key}": solo se aceptan custom properties ` +
          `(--nombre), nunca propiedades CSS normales.`
      );
    }
  }
  return sanitized;
}

/** WCAG AA para texto normal (4.5:1). */
const AA_CONTRAST_THRESHOLD = 4.5;

/** Evita re-avisar el mismo hex en cada render — solo una vez por valor visto. */
const warnedLowContrastValues = new Set<string>();

function warnIfLowContrast(
  seedKey: string,
  hex: string,
  onTextHex: string,
  devMode: boolean
): void {
  if (!devMode) return;
  if (warnedLowContrastValues.has(hex)) return;
  const ratio = contrastRatio(hex, onTextHex);
  if (ratio >= AA_CONTRAST_THRESHOLD) return;
  warnedLowContrastValues.add(hex);
  console.warn(
    `[bip-design-systems] tokens.${seedKey}="${hex}" no alcanza contraste WCAG AA (${ratio.toFixed(2)}:1, ` +
      `mínimo 4.5:1) contra el texto calculado (${onTextHex}). Prueba un tono más saturado u oscuro/claro.`
  );
}

/**
 * Resuelve el mapa final { '--color-primary': '#...' } a partir de los overrides
 * comunes + el refinamiento del esquema activo + el escape hatch cssVars, en ese
 * orden (cada capa pisa a la anterior). `devMode` controla el console.warn de
 * contraste — el llamador (BipThemeContext) lo fija a `isDevMode()`.
 */
export function resolveTokenVars(
  tokens: BipThemeTokens | undefined,
  colorScheme: BipResolvedColorScheme,
  cssVars: Record<string, string> | undefined,
  devMode = false
): Record<string, string> {
  if (!tokens && !cssVars) return {};

  const { light, dark, ...base } = tokens ?? {};
  const scoped = colorScheme === 'dark' ? dark : light;
  const merged: BipTokenOverrides = { ...base, ...scoped };

  const vars: Record<string, string> = {};
  for (const [key, value] of Object.entries(merged)) {
    if (value === undefined) continue;
    const typedKey = key as keyof BipTokenOverrides;
    vars[TOKEN_VAR_MAP[typedKey]] = value;

    const onTextVar = ON_TEXT_VAR_MAP[typedKey];
    if (onTextVar) {
      const onTextHex = pickReadableText(value);
      vars[onTextVar] = onTextHex;
      warnIfLowContrast(typedKey, value, onTextHex, devMode);
    }
  }
  return { ...vars, ...sanitizeCssVars(cssVars, devMode) };
}
