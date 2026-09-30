export type {
  BipColorScheme,
  BipColorSchemePreference,
  BipDensity,
  BipDir,
  BipFocusRingOverrides,
  BipMotionOverrides,
  BipRadiusOverrides,
  BipResolvedColorScheme,
  BipSpacingOverrides,
  BipThemeConfig,
  BipThemeName,
  BipThemeTokens,
  BipTokenOverrides,
  ThemeControls,
} from './theme.types';

export {
  FOCUS_RING_VAR_MAP,
  MOTION_VAR_MAP,
  ON_TEXT_VAR_MAP,
  RADIUS_VAR_MAP,
  SPACING_VAR_MAP,
  TOKEN_VAR_MAP,
  resolveTokenVars,
  resolveVarMap,
} from './var-maps';

export { BipThemeContext, defaultThemeAttributes } from './theme-context';
export type { BipThemeAttributes } from './theme-context';

export { BIP_THEME_DEFAULTS, provideBipTheme } from './provide-bip-theme';
export { getThemeInitScript, THEME_RESET_STYLE } from './theme-init-script';
export type { ThemeInitScriptOptions } from './theme-init-script';

export { BipThemeProvider } from './theme-provider.component';
export { BipThemeDirective } from './theme.directive';
export { injectThemeControls } from './inject-theme-controls';
