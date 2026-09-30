import { isPlatformBrowser } from '@angular/common';
import { Directionality, type Direction } from '@angular/cdk/bidi';
import {
  DestroyRef,
  Directive,
  EventEmitter,
  Injectable,
  type OnDestroy,
  PLATFORM_ID,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  isDevMode,
  model,
  signal,
} from '@angular/core';
import { BipThemeContext } from './theme-context';
import { BIP_THEME_DEFAULTS } from './provide-bip-theme';
import {
  readStoredPreference,
  writeStoredPreference,
  type StoredThemePreference,
} from './theme.storage';
import { THEME_RESET_STYLE } from './theme-init-script';
import {
  FOCUS_RING_VAR_MAP,
  MOTION_VAR_MAP,
  RADIUS_VAR_MAP,
  SPACING_VAR_MAP,
  resolveTokenVars,
  resolveVarMap,
} from './var-maps';
import type {
  BipColorSchemePreference,
  BipDensity,
  BipDir,
  BipFocusRingOverrides,
  BipMotionOverrides,
  BipRadiusOverrides,
  BipResolvedColorScheme,
  BipSpacingOverrides,
  BipThemeName,
  BipThemeTokens,
  ThemeControls,
} from './theme.types';

/**
 * Puente mínimo hacia `@angular/cdk/bidi` — cada `<bip-theme-provider>`/`[bipTheme]`
 * provee su propia instancia (`providers` en theme-provider.component.ts /
 * theme.directive.ts) y la mantiene sincronizada con `resolvedDir()` (ver constructor de
 * BipThemeHost). Así, cualquier componente que use `inject(Directionality)` —
 * ListKeyManager, Overlay position strategies, etc. — resuelve el `dir` efectivo del
 * `<bip-theme-provider>` más cercano en vez del `Directionality` global del documento.
 */
@Injectable()
class BipDirectionalityBridge implements OnDestroy {
  readonly valueSignal = signal<Direction>('ltr');
  readonly change = new EventEmitter<Direction>();
  get value(): Direction {
    return this.valueSignal();
  }
  ngOnDestroy(): void {
    this.change.complete();
  }
}

/** Host bindings compartidos por `<bip-theme-provider>` y `[bipTheme]` — ver sus decoradores. */
export const BIP_THEME_HOST_BINDINGS = {
  '[attr.data-theme]': 'resolvedTheme()',
  '[attr.data-color-scheme]': 'resolvedColorScheme()',
  '[attr.data-density]': 'resolvedDensity() ?? null',
  '[attr.dir]': 'resolvedDir() ?? null',
  '[style]': 'hostStyle()',
} as const;

/** Providers compartidos por `<bip-theme-provider>` y `[bipTheme]` — ver sus decoradores. */
export const BIP_THEME_PROVIDERS = [
  BipThemeContext,
  { provide: Directionality, useClass: BipDirectionalityBridge },
];

/**
 * Lógica compartida por `<bip-theme-provider>` y `[bipTheme]` — ver CLAUDE.md § Bloque 2.
 * No se instancia directamente (no se registra en ningún módulo/standalone import): ambos
 * hosts la extienden y agregan su propio `@Component`/`@Directive` con
 * `providers: BIP_THEME_PROVIDERS` y `host: BIP_THEME_HOST_BINDINGS`. El `@Directive()`
 * vacío de abajo es el patrón "clase base abstracta" de Angular — obligatorio para que el
 * compilador procese los `input()`/`model()` declarados aquí y los herede la subclase real.
 */
@Directive()
export abstract class BipThemeHost {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly appDefaults = inject(BIP_THEME_DEFAULTS, { optional: true });
  /** El provider padre, si hay uno — habilita la herencia/merge (ver CLAUDE.md § Anidación). */
  private readonly parent = inject(BipThemeContext, { optional: true, skipSelf: true });
  private readonly context = inject(BipThemeContext, { self: true });
  private readonly directionality = inject(Directionality, {
    self: true,
  }) as BipDirectionalityBridge;
  private readonly destroyRef = inject(DestroyRef);

  /** Controlado (two-way `[(theme)]`). `undefined` = no-controlado, ver `defaultTheme`. */
  readonly theme = model<BipThemeName | undefined>(undefined);
  /** Controlado (two-way `[(colorScheme)]`). Acepta 'system'. `undefined` = no-controlado. */
  readonly colorScheme = model<BipColorSchemePreference | undefined>(undefined);
  readonly defaultTheme = input<BipThemeName>(this.appDefaults?.defaultTheme ?? 'square');
  readonly defaultColorScheme = input<BipColorSchemePreference>(
    this.appDefaults?.defaultColorScheme ?? 'light'
  );
  /** Activa persistencia en localStorage bajo esta key — solo afecta los ejes no-controlados. */
  readonly storageKey = input<string | undefined>(this.appDefaults?.storageKey);
  readonly tokens = input<BipThemeTokens | undefined>(this.appDefaults?.tokens);
  readonly radius = input<BipRadiusOverrides | undefined>(this.appDefaults?.radius);
  readonly focusRing = input<BipFocusRingOverrides | undefined>(this.appDefaults?.focusRing);
  readonly motion = input<BipMotionOverrides | undefined>(this.appDefaults?.motion);
  /** Valor directo, sin modo controlado/no-controlado propio — como radius/focusRing/motion. */
  readonly density = input<BipDensity | undefined>(this.appDefaults?.density);
  readonly spacing = input<BipSpacingOverrides | undefined>(this.appDefaults?.spacing);
  /** Valor directo — un provider anidado sin `dir` hereda el del padre. */
  readonly dir = input<BipDir | undefined>(this.appDefaults?.dir);
  /** Escape hatch: cualquier custom property. Gana sobre el resto de ejes. */
  readonly cssVars = input<Record<string, string> | undefined>(this.appDefaults?.cssVars);

  private readonly internalTheme = signal<BipThemeName | undefined>(undefined);
  private readonly internalColorScheme = signal<BipColorSchemePreference | undefined>(undefined);
  private readonly systemDark = signal(false);

  protected readonly resolvedTheme = computed<BipThemeName>(
    () => this.theme() ?? this.internalTheme() ?? this.defaultTheme()
  );
  protected readonly colorSchemePreference = computed<BipColorSchemePreference>(
    () => this.colorScheme() ?? this.internalColorScheme() ?? this.defaultColorScheme()
  );
  protected readonly resolvedColorScheme = computed<BipResolvedColorScheme>(() => {
    const pref = this.colorSchemePreference();
    return pref === 'system' ? (this.systemDark() ? 'dark' : 'light') : pref;
  });
  protected readonly resolvedDensity = computed<BipDensity | undefined>(
    () => this.density() ?? this.parent?.density()
  );
  protected readonly resolvedDir = computed<BipDir | undefined>(
    () => this.dir() ?? this.parent?.dir()
  );

  private readonly resolvedVars = computed<Record<string, string>>(() => ({
    ...(this.parent?.resolvedVars() ?? {}),
    ...resolveTokenVars(this.tokens(), this.resolvedColorScheme(), undefined, isDevMode()),
    ...resolveVarMap<BipRadiusOverrides>(this.radius(), RADIUS_VAR_MAP),
    ...resolveVarMap<BipFocusRingOverrides>(this.focusRing(), FOCUS_RING_VAR_MAP),
    ...resolveVarMap<BipMotionOverrides>(this.motion(), MOTION_VAR_MAP),
    ...resolveVarMap<BipSpacingOverrides>(this.spacing(), SPACING_VAR_MAP),
    ...(this.cssVars() ?? {}),
  }));

  /** `style` a estampar en el host — usado por `BIP_THEME_HOST_BINDINGS['[style]']`. */
  protected readonly hostStyle = computed<Record<string, string>>(() => ({
    ...THEME_RESET_STYLE,
    ...this.resolvedVars(),
  }));

  private readonly setTheme = (next: BipThemeName): void => {
    this.internalTheme.set(next);
    this.theme.set(next);
  };

  private readonly setColorScheme = (next: BipColorSchemePreference): void => {
    this.internalColorScheme.set(next);
    this.colorScheme.set(next);
  };

  private readonly toggleColorScheme = (): void => {
    const next: BipColorSchemePreference = this.resolvedColorScheme() === 'dark' ? 'light' : 'dark';
    this.setColorScheme(next);
  };

  constructor() {
    // Hidratación desde localStorage — deliberadamente una sola vez tras el primer render, no
    // en cada cambio de theme()/colorScheme() (solo se leen para decidir si el eje es
    // controlado en ese instante). SSR-safe vía afterNextRender (solo corre en el browser).
    afterNextRender(() => {
      const key = this.storageKey();
      if (!key) return;
      const saved = readStoredPreference(key);
      if (!saved) return;
      if (this.theme() === undefined && saved.theme) this.internalTheme.set(saved.theme);
      if (this.colorScheme() === undefined && saved.colorScheme) {
        this.internalColorScheme.set(saved.colorScheme);
      }
    });

    // Sigue prefers-color-scheme del SO en vivo — independiente de storageKey/colorScheme,
    // porque `colorScheme="system"` puede llegar tanto controlado como no-controlado.
    afterNextRender(() => {
      if (!window.matchMedia) return;
      const mql = window.matchMedia('(prefers-color-scheme: dark)');
      this.systemDark.set(mql.matches);
      const listener = (event: MediaQueryListEvent): void => this.systemDark.set(event.matches);
      mql.addEventListener('change', listener);
      this.destroyRef.onDestroy(() => mql.removeEventListener('change', listener));
    });

    // Simétrico a la hidratación de arriba: un eje controlado nunca se escribe, para no
    // persistir un valor que el input ya manda y que la próxima lectura ignoraría de todas
    // formas.
    effect(() => {
      if (!this.isBrowser) return;
      const key = this.storageKey();
      if (!key) return;
      const value: StoredThemePreference = {};
      if (this.theme() === undefined) value.theme = this.resolvedTheme();
      if (this.colorScheme() === undefined) value.colorScheme = this.colorSchemePreference();
      if (Object.keys(value).length === 0) return;
      writeStoredPreference(key, value);
    });

    effect(() => {
      const controls: ThemeControls = {
        theme: this.resolvedTheme(),
        colorScheme: this.colorSchemePreference(),
        resolvedColorScheme: this.resolvedColorScheme(),
        setTheme: this.setTheme,
        setColorScheme: this.setColorScheme,
        toggleColorScheme: this.toggleColorScheme,
      };
      this.context._update({
        theme: this.resolvedTheme(),
        colorSchemePreference: this.colorSchemePreference(),
        resolvedColorScheme: this.resolvedColorScheme(),
        density: this.resolvedDensity(),
        dir: this.resolvedDir(),
        resolvedVars: this.resolvedVars(),
        controls,
      });

      const dir: Direction = this.resolvedDir() ?? 'ltr';
      if (this.directionality.valueSignal() !== dir) {
        this.directionality.valueSignal.set(dir);
        this.directionality.change.emit(dir);
      }
    });
  }
}
