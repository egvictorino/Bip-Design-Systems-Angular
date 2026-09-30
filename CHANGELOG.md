# Changelog

Todos los cambios notables de `@bip-design-systems/angular` se documentan en este archivo.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/), y el proyecto
usa [Semantic Versioning](https://semver.org/lang/es/) (`0.x` mientras haya bloques del plan
pendientes; `1.0.0` cuando los Bloques 0-12 de `CLAUDE.md` estén completos).

## [Unreleased]

### Added

- Layout, tipografía y display (Bloque 4): 17 componentes con paridad funcional con la
  referencia React. `BipContainer`/`BipStack`/`BipGrid` (`[bipContainer]`/`[bipStack]`/
  `[bipGrid]`, selectores de atributo — primitivas de layout puro sobre el elemento host
  elegido por el consumidor, sin semántica propia). `BipText`/`BipHeading` (`[bipText]`/
  `[bipHeading]`; `BipHeading` infiere el nivel accesible del propio tag `h1`-`h6` host en vez
  de duplicarlo en un input, y añade `role="heading"`/`aria-level` solo cuando se aplica sobre
  un elemento no-heading con `level` explícito). `BipDivider` (`<bip-divider>`,
  `role="separator"`, `<hr>` nativo en el caso horizontal sin label). `BipLink` (`a[bipLink]`,
  `underline`/`disabled`/`external` con hint accesible "abre en pestaña nueva" vía
  `<bip-visually-hidden>`). `BipSpinner`/`BipSkeleton` (indicadores de carga;
  `role="status"`+`aria-label` y `aria-hidden` respectivamente). `BipBadge` (variant/size/dot).
  `BipAvatar` + `BipAvatarGroup` (fallback en cascada imagen→iniciales (color hasheado
  estable, contraste automático sobre semillas de marca)→ícono; `size` de grupo propagado a
  los `<bip-avatar>` hijos vía DI — equivalente Angular al `cloneElement` de React; truncado
  `max` + badge "+N" de overflow). `BipProgressBar` (`role="progressbar"`,
  indeterminate/striped/animated, helperText vía `aria-describedby`). `BipEmptyState` (slots
  `[bipEmptyStateIcon]` con fallback nativo de `<ng-content>`, y `[bipEmptyStateAction]`).
  `BipCard` + `BipCardHeader`/`BipCardBody`/`BipCardFooter`/`BipCardMedia` (variant/padding/
  radius, `loading` con skeleton, `clickable` con `role="button"`+Enter/Espacio). `BipStatsCard`
  (`role="region"`, slot `[bipStatsCardIcon]`, tendencia con ícono direccional + aria-label
  localizado). `BipAlert` (`role="status"` info/success, `role="alert"` warning/danger; botón
  cerrar opcional vía `closable`/`(closed)`, ya que Angular no puede detectar un `onClose`
  condicional como React). Nueva clave `avatar.fallbackAlt` en `core/i18n` (`esMX`/`enUS`) —
  la referencia React hardcodea `'Avatar'`, aquí pasa por el diccionario para cumplir el guard
  `no-hardcoded-strings`. `eslint.config.js`: `component-selector` ahora acepta también
  selector de atributo (no solo elemento) para los componentes que mejoran un elemento nativo.
- i18n, utilidades y primitivas de a11y (Bloque 3): `core/i18n` con la interfaz `BipLocale`
  (paridad exacta con la referencia React, incluye `calendar`/`odontogram` para los Bloques
  8/10, tipados con `CalendarView`/`CalendarEventStatus`/`ToothCondition`/`ToothSurface`/
  `ToothImageType` nuevos en `core/types`), diccionarios `esMX` (default) y `enUS`,
  `mergeLocale()`, `provideBipLocale(locale | Signal<BipLocale>)` e `injectBipLocale()`
  (`Signal<BipLocale>` reactivo, con fallback a `esMX` sin provider ancestro). `core/utils`:
  `formatCurrency()`/`formatDate()`/`validateRFC()` + sus versiones Angular (`BipCurrencyPipe`,
  `BipDatePipe`, `bipRfcValidator()` para Reactive Forms) que toman el locale activo por
  defecto; `mediaQuery(breakpoint)` renombrado a `breakpointQuery(breakpoint)` para liberar el
  nombre `mediaQuery()` en `core/a11y`. `core/a11y`: `BipIdGenerator` (puerto de `useId()`,
  estable en SSR vía `APP_ID`), `disclosure()`, `mediaQuery(query)` (sobre `BreakpointObserver`
  del CDK), `[bipClickOutside]`, `<bip-visually-hidden>`. `core/forms`: `BipFormControlBase`,
  base compartida de `ControlValueAccessor` para los controles del Bloque 5 (disabled/touched/
  cómputo de error/ids de label-helper-error/wiring de `NgControl`). Guard nuevo
  `testing/no-hardcoded-strings` (escanea `.html`/`.ts` de componentes), test `dictionaries`
  junto a los diccionarios (mismas claves en ambos, cada función de interpolación probada), y
  registro de cobertura de a11y (`testing/a11y.spec.ts`, `A11Y_REGISTRY`) con coverage guard.
  Story `Foundations/I18n`.
- Theming y puente de overlays (Bloque 2): `<bip-theme-provider>` y la directiva `[bipTheme]`
  (misma lógica, `theme`/`colorScheme` como `model()` controlado/no-controlado con
  `defaultTheme`/`defaultColorScheme`/`storageKey`; `density`/`dir`/`tokens`/`radius`/
  `focusRing`/`motion`/`spacing`/`cssVars`; anidación con merge de vars y herencia de
  density/dir; `colorScheme="system"` resuelto en vivo vía `matchMedia`, nunca estampado en
  el DOM; integra un `Directionality` propio de `@angular/cdk/bidi`) en `core/theme`;
  `provideBipTheme()` para defaults a nivel app; `injectThemeControls()`
  (`setTheme`/`setColorScheme`/`toggleColorScheme`, no-op sin provider ancestro);
  `getThemeInitScript()`/`THEME_RESET_STYLE` para anti-FOUC en SSR; mapas
  `TOKEN_VAR_MAP`/`RADIUS_VAR_MAP`/`ON_TEXT_VAR_MAP`/`FOCUS_RING_VAR_MAP`/`MOTION_VAR_MAP`/
  `SPACING_VAR_MAP` + `resolveVarMap()`/`resolveTokenVars()` (con contraste automático
  `--color-txt-on-*` vía `pickReadableText()` y `console.warn` en dev si el contraste
  resultante no alcanza WCAG AA). `BipOverlay` en `core/overlay`: wrapper de `Overlay` (CDK)
  que estampa `data-theme`/`data-color-scheme`/`data-density`/`dir` + las CSS vars resueltas
  del `<bip-theme-provider>` más cercano al llamador en el panel del overlay, pensado como el
  único punto de creación de overlays para toda la librería. `@angular/cdk` agregado como
  dependencia del workspace y peer dependency de `@bip-design-systems/angular`. Story
  `Foundations/Theming` (Playground, SideBySide, PortalTheming, SystemColorScheme,
  UncontrolledWithPersistence) y decorator global de Storybook que envuelve cada story en
  `<bip-theme-provider>` leyendo los globals del toolbar.
- Foundations (Bloque 1): hoja global `@bip-design-systems/angular/styles/bip.css` (tokens,
  primitives, themes, density, rtl, fonts, base) publicada vía ng-packagr `assets`; utilidades
  `contrastRatio()`/`pickReadableText()` y `BREAKPOINTS`/`breakpointQuery()` en `core/utils`; tipos
  `BipSize`/`BipSizeExtended`/tipos de theme en `core/types`; guards de estilos en `testing/`
  (spacing, on-text, rtl, tokens, contrast-tokens, css-comment-balance, breakpoints) que escanean
  `*.component.css`; Storybook Foundations (Colors, Radius, Spacing, Typography, Motion,
  Breakpoints) parseando `tokens.css` en runtime.
- Bootstrap del workspace (Bloque 0): Angular CLI + pnpm, librería `@bip-design-systems/angular`
  con secondary entry point `core` de plantilla, Vitest + Testing Library + jest-dom + axe,
  ESLint (`angular-eslint`, prefijo `bip`) + Prettier, Storybook con `addon-a11y`/`addon-docs`,
  Changesets y CI mínima de validación de PRs.
