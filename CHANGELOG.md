# Changelog

Todos los cambios notables de `@bip-design-systems/angular` se documentan en este archivo.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/), y el proyecto
usa [Semantic Versioning](https://semver.org/lang/es/) (`0.x` mientras haya bloques del plan
pendientes; `1.0.0` cuando los Bloques 0-12 de `CLAUDE.md` estén completos).

## [Unreleased]

### Added

- Overlays y feedback (Bloque 6): 7 componentes, todos vía `BipOverlay` (nunca `Overlay`
  directo). `BipModal` + `BipModalHeader`/`BipModalBody`/`BipModalFooter` (primer componente
  de overlay real de la librería: `BipOverlay.create()` + `TemplatePortal`; `cdkTrapFocus` con
  autocapture del primer focusable y restauración de foco al cerrar; `closeOnBackdrop`/
  `closeOnEscape` configurables; scroll lock con `ScrollStrategyOptions.block()`;
  `BipModalHeader` inyecta un token `BIP_MODAL_CONTEXT` — no la clase `BipModal` — para evitar
  un import circular, y lanza si se usa fuera de `<bip-modal>`). `BipConfirmDialog`
  (composición declarativa sobre `<bip-modal>`, `closeOnBackdrop` fijo en `false`; `variant`
  danger reutiliza `BipButton` `variant="danger"`, warning aplica un override de color propio).
  `BipDrawerPanel` (mismo patrón de overlay que Modal; `placement` físico left/right a
  propósito, en el allowlist de `rtl.spec.ts`; slots `[bipDrawerPanelHeaderActions]`/
  `[bipDrawerPanelFooter]` con directivas marcador sin comportamiento para que el componente
  sepa vía `contentChild()` si hay algo proyectado). `BipToast` (servicio `providedIn: 'root'`
  + `provideBipToast({ max, position })` opcional — sin `<ToastProvider>` envolviendo el árbol;
  overlay creado perezosamente en el primer `show()`; reusa `<bip-alert>` por toast; puerto
  completo de la lógica de stacking de React — colapsado con peek de los de atrás, hover
  expande todo verticalmente; barra de progreso solo si `duration > 0`, `duration: 0` es
  persistente). `[bipTooltip]` (directiva de atributo, no un wrapper — Angular no tiene
  `cloneElement`; posiciona vía `FlexibleConnectedPositionStrategy` del CDK en vez del CSS
  absoluto de la referencia, por la regla de Bloque 2; `position` físico fuerza
  `OverlayConfig.direction: 'ltr'` para left/right, `align` lógico sigue la `Directionality`
  real; sin modo controlado `open`/`onOpenChange` de React — un `model()` no distingue
  "enlazado" de "en su default"). `BipPopover` + `BipPopoverTrigger`/`BipPopoverContent`
  (compound component — contexto vía token `BIP_POPOVER_CONTEXT`; `BipPopoverContent`
  posiciona vía `BipOverlay` anclada al elemento que registró el trigger; cierra con Escape o
  `overlayRef.outsidePointerEvents()`, ignorando clics en el propio trigger). `BipDropdown` +
  `BipDropdownTrigger`/`BipDropdownMenu`/`BipDropdownItem`/`BipDropdownItemCheckbox`/
  `BipDropdownDivider`/`BipDropdownGroup`/`BipDropdownSearch`/`BipDropdownSubmenu` (patrón
  WAI-ARIA Menu Button; navegación de teclado con `FocusKeyManager` del CDK — ↑↓ con wrap,
  Home/End, se saltan los items disabled — en vez del recorrido manual de `querySelector` de
  React; Escape cierra y devuelve el foco al trigger, Tab cierra sin bloquear el avance
  natural del foco. `BipDropdownSubmenu` se registra como un item más del menú padre vía un
  token `BIP_DROPDOWN_MENU_SCOPE` — necesario porque `contentChildren(..., { descendants:
  true })` también encuentra los items anidados dentro de su propio panel, y sin ese filtro
  el `FocusKeyManager` del menú raíz navegaría por ellos aunque el submenú esté cerrado;
  `ArrowRight` en el trigger abre y enfoca el primer item anidado, `ArrowLeft`/`Escape` dentro
  del panel cierran solo el submenú — no todo el dropdown — y devuelven el foco al trigger).
- Formularios básicos (Bloque 5): 13 componentes, todos con `ControlValueAccessor` (probados
  con `FormControl`, `ngModel` y `[(value)]`). `BipButton` (`button[bipButton], a[bipButton]`,
  variantes primary/secondary/bare/soul/danger, tamaños, `loading` con spinner+`aria-busy`,
  `fullWidth`; en `<a>` el `disabled` se emula con `aria-disabled`+`tabindex=-1`+
  `pointer-events:none`, ya que los anchors no tienen `disabled` nativo). `BipInput`
  (`<bip-input>`, `variant` outlined/filled/bare, `type` con toggle de contraseña,
  `clearable`, icon slots proyectados vía `[bipInputStartIcon]`/`[bipInputEndIcon]`).
  `BipTextarea` (mismo patrón label+control+footer que `BipInput`, `resize`, `autoGrow`
  ajustando `scrollHeight` vía `viewChild`, contador de caracteres con `maxLength`).
  `BipCheckbox` + `BipCheckboxGroup` (el grupo es un `<fieldset>` puramente contextual, no
  CVA — `size`/`disabled`/`error` cascadean a los checkboxes hijos vía
  `inject(BipCheckboxGroup, { optional: true })`, cada checkbox mantiene su propio valor
  booleano independiente, igual que la referencia React; `indeterminate` seteado como
  propiedad DOM vía `viewChild`, no como atributo). `BipRadio` + `BipRadioGroup` (a diferencia
  de Checkbox, `BipRadioGroup` SÍ es `ControlValueAccessor` — el valor seleccionado vive en el
  grupo, no en cada radio, reflejando la exclusividad mutua; todos los `<bip-radio>` de un
  grupo comparten el mismo `name` nativo, dando exclusividad y navegación con flechas de
  teclado gratis del navegador; `BipRadio` no lleva `aria-invalid` por diseño y lanza un error
  explícito si se usa fuera de `<bip-radio-group>`). `BipToggle` (`role="switch"` sobre un
  checkbox nativo, thumb desplazado con `--rtl-x`). `BipSelect` (envuelve un `<select>` nativo
  — no un listbox custom, misma decisión que la referencia React; opciones/grupos vía inputs
  `options`/`groups`, `placeholder` como `<option disabled>` real). `BipNumberInput`
  (`role="spinbutton"`, botones +/- con `tabindex=-1` y `aria-label` localizado, `min`/`max`/
  `step`/`decimals`, prefix/suffix de texto; el valor se edita internamente como texto para no
  perder estados intermedios de tecleo). `BipSearchInput` (wrapper `role="search"`, outputs
  `searched` (debounced o solo en `Enter` vía `searchOnEnter`) y `cleared` — renombrados desde
  `search`/`clear` de la referencia React porque `@angular-eslint/no-output-native` prohíbe
  nombrar un output igual que un evento DOM nativo). `BipSlider` (envuelve un
  `<input type="range">` nativo, sin reimplementar el thumb con CDK drag). `BipFileUpload`
  (`<label>` como zona de drop y disparador del `<input type="file">` oculto con el mismo
  patrón clip-rect que `BipVisuallyHidden`, no `display:none` — mantiene foco/teclado nativos;
  `multiple`/`accept`/`maxSize`/`maxFiles` con rechazo de archivos vía output
  `rejected: BipRejectedFile[]`; `loading` con `BipSpinner`+`aria-busy`).
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
