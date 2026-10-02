import { Injectable, computed, signal } from '@angular/core';
import { THEME_RESET_STYLE } from './theme-init-script';
import { NOOP_CONTROLS } from './theme.types';
import type {
  BipColorSchemePreference,
  BipDensity,
  BipDir,
  BipResolvedColorScheme,
  BipThemeName,
  ThemeControls,
} from './theme.types';

export interface BipThemeAttributes {
  'data-theme': BipThemeName;
  'data-color-scheme': BipResolvedColorScheme;
  'data-density'?: BipDensity;
  dir?: BipDir;
  style: Record<string, string>;
}

interface BipThemeContextSnapshot {
  theme: BipThemeName;
  colorSchemePreference: BipColorSchemePreference;
  resolvedColorScheme: BipResolvedColorScheme;
  density: BipDensity | undefined;
  dir: BipDir | undefined;
  resolvedVars: Record<string, string>;
  controls: ThemeControls;
}

/**
 * Contexto de theming vivo — una instancia por `<bip-theme-provider>`/`[bipTheme]` (ver
 * `providers: [BipThemeContext]` en theme-provider.component.ts / theme.directive.ts).
 * Sin ancestro (`inject(BipThemeContext, { optional: true })` devuelve `null`), el tema
 * efectivo es square/light — coincide con los defaults declarados en `:root` (tokens.css,
 * styles/themes.css), así que un overlay (BipOverlay) o componente portalled puede leer
 * `attributes()`/`controls()` sin exigir un provider ancestro (ver `defaultThemeAttributes()`).
 */
@Injectable()
export class BipThemeContext {
  private readonly _theme = signal<BipThemeName>('square');
  private readonly _colorSchemePreference = signal<BipColorSchemePreference>('light');
  private readonly _resolvedColorScheme = signal<BipResolvedColorScheme>('light');
  private readonly _density = signal<BipDensity | undefined>(undefined);
  private readonly _dir = signal<BipDir | undefined>(undefined);
  private readonly _resolvedVars = signal<Record<string, string>>({});
  private readonly _controls = signal<ThemeControls>(NOOP_CONTROLS);

  readonly theme = this._theme.asReadonly();
  /** Preferencia declarada — puede ser 'system'; usar `resolvedColorScheme` para pintar el icono sol/luna. */
  readonly colorScheme = this._colorSchemePreference.asReadonly();
  readonly resolvedColorScheme = this._resolvedColorScheme.asReadonly();
  /** undefined = sin opinión, cae al default CSS (:root, [data-density='comfortable']). */
  readonly density = this._density.asReadonly();
  /** undefined = sin opinión, cae al default del navegador (ltr). */
  readonly dir = this._dir.asReadonly();
  /** Vars CSS resueltas acumuladas (padre + propias) — ver theme-base.ts. */
  readonly resolvedVars = this._resolvedVars.asReadonly();

  /**
   * Atributos data-theme / data-color-scheme / data-density / dir + style para estampar el
   * eje de tema (incluidas las vars de marca resueltas) en un nodo portalled (BipOverlay)
   * que vive fuera del árbol DOM del provider y por eso no hereda el estampado. `style` ya
   * incluye THEME_RESET_STYLE. `data-density`/`dir` solo se incluyen cuando el provider los
   * fija.
   */
  readonly attributes = computed<BipThemeAttributes>(() => {
    const density = this._density();
    const dir = this._dir();
    return {
      'data-theme': this._theme(),
      'data-color-scheme': this._resolvedColorScheme(),
      ...(density ? { 'data-density': density } : {}),
      ...(dir ? { dir } : {}),
      style: { ...THEME_RESET_STYLE, ...this._resolvedVars() },
    };
  });

  /** @internal — llamado por BipThemeHost (theme-base.ts) en cada recómputo reactivo. */
  _update(next: BipThemeContextSnapshot): void {
    this._theme.set(next.theme);
    this._colorSchemePreference.set(next.colorSchemePreference);
    this._resolvedColorScheme.set(next.resolvedColorScheme);
    this._density.set(next.density);
    this._dir.set(next.dir);
    this._resolvedVars.set(next.resolvedVars);
    this._controls.set(next.controls);
  }

  /** Usado por `injectThemeControls()`. */
  controls(): ThemeControls {
    return this._controls();
  }
}

/**
 * Atributos "raíz" para cuando no hay ningún `<bip-theme-provider>`/`[bipTheme]` ancestro —
 * equivalente a `DEFAULT_CONTEXT` en el ThemeProvider de React.
 */
export function defaultThemeAttributes(): BipThemeAttributes {
  return {
    'data-theme': 'square',
    'data-color-scheme': 'light',
    style: { ...THEME_RESET_STYLE },
  };
}
