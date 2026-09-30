# CLAUDE.md — BipUI Angular (`@bip-design-systems/angular`)

Guía para Claude Code en este repositorio. Este archivo es **el plan maestro**: la librería se
construye por bloques, en orden, y cada bloque tiene un criterio de terminado explícito.
Al terminar un bloque, marca su casilla en § Estado de bloques y actualiza este archivo si
alguna decisión cambió.

## Qué es esto

Design system BipUI reescrito **desde cero para Angular**. Existe una versión React
(`@bip-design-systems/ui-components` v1.1.0) que es la **referencia funcional y visual**, no una
dependencia:

- Local (solo lectura): `../bip-design-system/packages/ui-components/`
- GitHub: https://github.com/egvictorino/Bip-Design-Systems (público)

**Reglas sobre la referencia React:**

- Se LEE para copiar comportamiento, API de props, estados, estilos, textos i18n, casos de test
  y decisiones de a11y. Por cada componente: leer `X.tsx`, `X.module.css`, `X.test.tsx`,
  `X.stories.tsx` antes de escribir la versión Angular.
- **Nunca** se importa código, paquetes ni rutas del repo React. Nada de `../bip-design-system`
  en imports, `package.json` ni tsconfig paths.
- Los archivos CSS de tokens (`tokens.css`, `primitives.css`, `themes.css`, `density.css`,
  `rtl.css`, `fonts.css`) y los diccionarios i18n **sí se copian** como punto de partida (son
  agnósticos al framework); a partir de ahí viven y evolucionan aquí.
- No se copian: React hooks, `cn()`/clsx, CSS Modules, `use-client`, Storybook React.

## Stack

| Área               | Elección                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework          | **Angular 21** (`^21.2.0`). Decisión explícita del dueño del repo (2026-09-30): se fija esta major, en vez de seguir siempre "última estable", para que este repo y el resto de sus proyectos Angular queden en el mismo canal de versión. No actualizar a Angular 22+ sin decisión explícita — actualizar es trabajo de un `feature/deps-*` aparte, no un efecto colateral de tocar un bloque                                           |
| Package manager    | pnpm (≥ 9), Node **22 LTS** (Angular 21 exige `^20.19.0 \|\| ^22.12.0 \|\| >=24.0.0`; usar [nvm](https://github.com/nvm-sh/nvm) — `nvm install 22 && nvm alias default 22` — si el Node del sistema es v21.x u otro no soportado). Fijado en `.nvmrc` y `engines` (`package.json`) + `engine-strict=true` (`.npmrc`), así `pnpm install` falla con un mensaje claro en un Node no soportado en vez de un error críptico a mitad de build |
| Build librería     | Angular CLI + **ng-packagr** (Angular Package Format), ES2022, FESM                                                                                                                                                                                                                                                                                                                                                                      |
| Componentes        | **Standalone**, `ChangeDetectionStrategy.OnPush`, **signals** (`input()`, `input.required()`, `output()`, `model()`, `computed()`, `effect()`), control flow `@if/@for/@switch`. Sin NgModules. Deben funcionar **con y sin zone.js** (zoneless)                                                                                                                                                                                         |
| Primitivas         | **@angular/cdk**: Overlay, Portal, A11y (FocusTrap, ListKeyManager, FocusMonitor, LiveAnnouncer), Bidi (Directionality), Layout (BreakpointObserver), ScrollStrategies                                                                                                                                                                                                                                                                   |
| Formularios        | Todo control de formulario implementa **ControlValueAccessor** (Reactive Forms + Template-driven + signal forms si están estables)                                                                                                                                                                                                                                                                                                       |
| Estilos            | CSS plano por componente (`styleUrl`), `ViewEncapsulation.Emulated` (equivalente a CSS Modules). Tokens vía CSS custom properties. **Sin Tailwind, sin SCSS**                                                                                                                                                                                                                                                                            |
| Tests unitarios    | Vitest vía `@angular/build:unit-test` + `@testing-library/angular` + `@testing-library/user-event` + `@testing-library/jest-dom` + `axe-core` (vitest-axe o jest-axe)                                                                                                                                                                                                                                                                    |
| Docs               | Storybook para Angular (`@storybook/angular`), CSF3                                                                                                                                                                                                                                                                                                                                                                                      |
| Visual / a11y real | Playwright + `@axe-core/playwright`, **solo en Docker** (imagen `mcr.microsoft.com/playwright:vX-jammy` fijada a la versión de `@playwright/test`)                                                                                                                                                                                                                                                                                       |
| Lint               | `angular-eslint` (prefijo `bip` obligatorio en selectores), ESLint flat config, Prettier                                                                                                                                                                                                                                                                                                                                                 |
| Versionado         | Changesets + `CHANGELOG.md` curado a mano (Keep a Changelog)                                                                                                                                                                                                                                                                                                                                                                             |

## Estructura objetivo

```
bip-design-system-angular/
├── CLAUDE.md
├── package.json                 # workspace root (scripts agregados)
├── pnpm-workspace.yaml
├── angular.json
├── projects/
│   ├── bip-angular/             # LA librería → @bip-design-systems/angular
│   │   ├── ng-package.json
│   │   ├── package.json
│   │   ├── src/public-api.ts    # entry primario: core (theme, i18n, utils, tokens helpers) + re-export de todo
│   │   ├── styles/              # CSS global publicado: bip.css (importa los de abajo)
│   │   │   ├── tokens.css  primitives.css  themes.css  density.css  rtl.css  fonts.css  base.css
│   │   ├── core/                # secondary entry: @bip-design-systems/angular/core
│   │   │   ├── theme/  i18n/  a11y/  overlay/  utils/  types/
│   │   ├── button/              # secondary entry por componente: @bip-design-systems/angular/button
│   │   │   ├── ng-package.json  index.ts  public-api.ts
│   │   │   ├── button.component.ts  button.component.html  button.component.css
│   │   │   ├── button.component.spec.ts  button.stories.ts
│   │   ├── input/ ... (uno por componente)
│   │   ├── foundations/         # stories de Foundations (no se publica)
│   │   └── testing/             # guards globales (a11y registry, spacing, rtl, on-text, tokens…)
│   └── showcase/                # (opcional) app Angular de demo/SSR smoke
├── visual/                      # Playwright: theme-matrix, component-matrix, a11y-browser
├── e2e/                         # consumer smoke test del tarball publicado
├── scripts/                     # visual-docker.sh, e2e-consumer.sh
├── .storybook/
├── .changeset/
└── .github/workflows/
```

Un **secondary entry point por componente** (igual que Angular Material) → tree-shaking real y
el equivalente al export `./*` del paquete React. El entry primario re-exporta todo por comodidad.

## Traducción de patrones React → Angular (obligatoria)

| React (referencia)                                           | Angular (este repo)                                                                                                                                                                                                   |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `React.FC` / `forwardRef`                                    | Componente standalone. Si mejora un elemento nativo, **selector de atributo** (`button[bipButton], a[bipButton]`, `a[bipLink]`); si encapsula estructura (label+input+helper), **selector de elemento** (`bip-input`) |
| props                                                        | `input()` / `input.required()`; props booleanas con `transform: booleanAttribute`; numéricas con `numberAttribute`                                                                                                    |
| `onX` callbacks                                              | `output()`                                                                                                                                                                                                            |
| controlado/no controlado (`value`+`onChange`+`defaultValue`) | `model()` (two-way `[(value)]`) + ControlValueAccessor para forms                                                                                                                                                     |
| `children`                                                   | `<ng-content>` / `<ng-content select="...">`; slots con templates vía `<ng-template bipXxx>` + `contentChild()`                                                                                                       |
| Compound components + Context con guard `null`               | El padre se inyecta en los hijos: `inject(BipTabs, { optional: true })` y si es `null` → `throw new Error('<bip-tab> debe usarse dentro de <bip-tabs>')`. **Nunca** defaults silenciosos                              |
| `useId()`                                                    | `BipIdGenerator` en `core/a11y`: `inject(BipIdGenerator).next('bip-input')` (contador por app + `APP_ID`, estable en SSR). Nunca IDs derivados del label                                                              |
| `cn()` / CSS Modules                                         | `host: { '[class]': 'hostClasses()' }` con `computed()`; clases dentro del CSS encapsulado del componente                                                                                                             |
| `className` prop                                             | No hace falta: el consumidor pone `class` en el host                                                                                                                                                                  |
| `createPortal`                                               | CDK Overlay/Portal a través de `BipOverlay` (ver Bloque 2) para heredar theme                                                                                                                                         |
| `useFocusTrap`                                               | `cdkTrapFocus` / `FocusTrapFactory`                                                                                                                                                                                   |
| `useClickOutside`                                            | `overlayRef.outsidePointerEvents()` o directiva `bipClickOutside`                                                                                                                                                     |
| `useDisclosure`                                              | helper `disclosure()` basado en signals (`isOpen`, `open`, `close`, `toggle`)                                                                                                                                         |
| `useMediaQuery`                                              | `mediaQuery(query)` → `Signal<boolean>` sobre `BreakpointObserver`                                                                                                                                                    |
| `useScrollLock`                                              | `ScrollStrategyOptions.block()` del CDK                                                                                                                                                                               |
| `displayName`                                                | No aplica; en su lugar nombres de clase `BipButton`, `BipInput`… (prefijo `Bip`, sin sufijo `Component`)                                                                                                              |
| Provider + hook (Toast)                                      | Servicio + `provideBipToast()` (`BipToast.show({...})`)                                                                                                                                                               |
| `useBipLocale()`                                             | `injectBipLocale()` → `Signal<BipLocale>`                                                                                                                                                                             |

## Reglas de código (aplican a todos los bloques)

- `strict: true`, `noUnusedLocals`, `noUnusedParameters`, `strictTemplates`, `strictInjectionParameters`.
- Todos los componentes: standalone, OnPush, signals. Nada de `@Input()`/`@Output()` decorators ni `NgModule`.
- **Nunca hex en CSS de componentes**: solo `var(--color-*)`. Spacing solo `var(--space-*)`. Radius solo tokens semánticos (`--radius-field`, `--radius-control`, `--radius-surface`, `--radius-container`, `--radius-container-lg`, `--radius-marker`, `--radius-pill`, `--radius-circle`). Transiciones con `var(--duration-*)`/`var(--ease-*)`. Foco con `box-shadow: var(--focus-ring)`.
- Texto sobre relleno de marca: `--color-txt-on-{primary|danger|success|warning|info|unique}`. `--color-txt-white` solo en la allowlist (sidebar dark, spinner white, avatar fallbacks).
- **Propiedades lógicas** (`margin-inline-start`, `inset-inline-*`, `text-align: start`). `translateX` direccional con `calc(var(--rtl-x) * Npx)`. Excepciones físicas por diseño: DrawerPanel `placement`, Toast `position`, Tooltip `position` (pero `align` es lógico).
- **Sin strings hardcodeadas** visibles/ARIA en componentes: todo sale del diccionario i18n.
- a11y: `aria-invalid` solo cuando hay error (`error() || null`), `aria-describedby` al helper/error, `role="alert"` en mensajes de error, `for`/`id` en labels. Radio **no** lleva `aria-invalid`. Skeleton/Spinner `aria-hidden="true"`.
- SSR-safe: nada de `window`/`document`/`localStorage`/`matchMedia` fuera de `afterNextRender`, `isPlatformBrowser` o `inject(DOCUMENT)`.
- Tamaños: `BipSize = 'sm'|'md'|'lg'`, `BipSizeExtended = 'xs'|'sm'|'md'|'lg'|'xl'` (en `core/types`).

## Definición de terminado (DoD) — por componente

Un componente está terminado solo si tiene **todo** esto:

1. `*.component.ts/.html/.css` con la misma API funcional que la versión React (props → inputs/outputs, mismos variantes/tamaños/estados).
2. `*.spec.ts` que porta los casos del `X.test.tsx` de React (mínimo: render, variantes, interacción teclado/mouse, ARIA, CVA si es form).
3. `*.stories.ts` (CSF3, `tags: ['autodocs']`, `layout: 'centered'` o `'padded'`), sin clases utilitarias inexistentes — layout de stories con `style` inline.
4. Entrada en el registro de a11y (`testing/a11y.spec.ts`) y en `visual/component-matrix.ts` (con `rtl: true` si tiene geometría direccional).
5. Textos en `esMX` y `enUS`.
6. Exportado en su `public-api.ts` y en el entry primario.
7. Changeset + entrada en `CHANGELOG.md` bajo `## [Unreleased]`.
8. `pnpm lint && pnpm test && pnpm build` en verde.

## Estrategia de ramas

`main` (producción) ← `qa` ← `dev` ← `feature/xxx`. Un bloque = una o varias ramas
`feature/bloque-N-descripcion` → PR a `dev`. Hotfixes desde `main`, cherry-pick a `qa` y `dev`.

---

## BLOQUES

Orden obligatorio: 0 → 1 → 2 → 3 van en serie (son la base). Del 4 al 10 son componentes y
pueden hacerse en el orden listado (cada uno depende de los anteriores). 11 y 12 cierran calidad
y release, aunque su infraestructura mínima se arranca antes (ver cada bloque).

### Bloque 0 — Bootstrap del workspace y tooling

**Objetivo:** repo que compila, testea, lintea y levanta Storybook vacío, con CI mínima.

- Workspace Angular CLI sin app (`ng new bip-design-system-angular --no-create-application --package-manager pnpm`) y librería `ng g library bip-angular` → renombrar paquete a `@bip-design-systems/angular`, versión `0.0.0`.
- tsconfig estricto (ver Reglas). `angular-eslint` + prefijo `bip` (component-selector/directive-selector), Prettier (`printWidth 100`, `singleQuote`, `semi`, `trailingComma es5`).
- Unit tests con Vitest (`@angular/build:unit-test`), `@testing-library/angular`, jest-dom, user-event, axe. Un test dummy en verde.
- Storybook Angular en `:6006` con addon-a11y, addon-docs. Toolbar globals preparados (vacíos por ahora): `theme`, `colorScheme`, `density`, `dir`, `brand`.
- Estructura de secondary entry points: plantilla de un entry vacío (`core`) que compile con ng-packagr.
- Scripts raíz: `build`, `test`, `test:watch`, `lint`, `typecheck`, `storybook`, `build-storybook`, `changeset`, `format`.
- Changesets init (`"changelog": false`, igual que React — el CHANGELOG es a mano), `CHANGELOG.md` con `## [Unreleased]`.
- CI mínima: `.github/workflows/pr-validation.yml` (branch check → install `--frozen-lockfile` → lint → test → build) y `changeset-check` para PRs a `dev`.
- **Terminado cuando:** `pnpm install && pnpm lint && pnpm test && pnpm build && pnpm storybook` funcionan limpio; el PR de este bloque pasa CI.
- Referencia: `../bip-design-system/package.json`, `.changeset/config.json`, `.github/workflows/pr-validation.yml`.

### Bloque 1 — Foundations: tokens, estilos globales y guards

**Objetivo:** la capa de diseño completa, sin componentes aún.

- Copiar a `projects/bip-angular/styles/`: `tokens.css` (seeds + derivados `color-mix()`, light/dark con selectores dobles `:root,[data-color-scheme=…]`), `primitives.css` (tipografía, motion, focus-ring, `--space-*`, z-index), `themes.css` (square/rounded), `density.css` (comfortable/compact → `--space-control-*`), `rtl.css` (`--rtl-x`), `fonts.css` (Inter/Figtree variable vía `@fontsource-variable`), `base.css` (reset + `prefers-reduced-motion` → `--duration-*: 0ms`). Un `bip.css` que los importa en orden fijo.
- Publicar `styles/` con ng-packagr `assets` → consumidor: `"styles": ["@bip-design-systems/angular/styles/bip.css"]` en `angular.json`.
- `core/utils`: `contrastRatio()`, `pickReadableText()` (portar `src/lib/contrast.ts`), `BREAKPOINTS` + `breakpointQuery()` string helper (portar `styles/breakpoints.ts`; renombrado desde `mediaQuery()` en el Bloque 3 para liberar ese nombre al `mediaQuery(query)` reactivo de `core/a11y`).
- `core/types`: `BipSize`, `BipSizeExtended`, tipos de theme.
- **Guards como tests** (portar de `src/styles/*.test.ts`): `spacing` (sin longitudes literales en padding/margin/gap; `OUTLIER_VALUES`), `on-text` (allowlist de `--color-txt-white`), `rtl` (sin `left/right` físicos; `PHYSICAL_BY_DESIGN_ALLOWLIST`), `tokens` (cada entrada de los VAR_MAP apunta a un token real), `contrast-tokens` (AA de defaults en ambos esquemas), `css-comment-balance`, `breakpoints`. Deben escanear `projects/bip-angular/**/*.component.css`.
- Storybook Foundations: Introduction, Colors (parseando `tokens.css` con `?raw`, clasificando seed/derived — nunca lista duplicada a mano), Radius, Spacing, Typography, Motion, Breakpoints.
- **Terminado cuando:** guards en verde, Foundations visibles en Storybook en light/dark.
- Referencia: `src/tokens.css`, `src/styles/*`, `src/lib/contrast.ts`, `src/foundations/*`.

### Bloque 2 — Theming (`bipTheme`) y puente de overlays

**Objetivo:** paridad total con `ThemeProvider` React (`src/components/ThemeProvider/ThemeProvider.tsx`, 648 líneas + 614 de tests).

- Componente `<bip-theme-provider>` **y** directiva `[bipTheme]` (misma lógica; el componente es un wrapper `display: contents`/div). `provideBipTheme(config)` para defaults a nivel app.
- Ejes: `theme` (`square|rounded`), `colorScheme` (`light|dark|system` → nunca se estampa `system`, siempre el resuelto vía `matchMedia` en signal), `density` (`comfortable|compact`), `dir` (`ltr|rtl`, integrado con CDK `Directionality` proveyendo un `Directionality` propio), `tokens` (flat + `light`/`dark` anidados), `radius`, `focusRing`, `motion`, `spacing`, `cssVars` (escape hatch, gana a todo).
- Mapas exportados: `TOKEN_VAR_MAP`, `RADIUS_VAR_MAP`, `ON_TEXT_VAR_MAP`, `FOCUS_RING_VAR_MAP`, `MOTION_VAR_MAP`, `SPACING_VAR_MAP`, y **un único** `resolveVarMap(overrides, VAR_MAP)` + `resolveTokenVars()`.
- Contraste automático: override de `colorPrimary|Danger|Success|Warning|Info|Unique` recalcula `--color-txt-on-*` con `pickReadableText()`; `console.warn` en dev (`isDevMode()`) si queda < 4.5:1.
- Controlado/no controlado: `theme`/`colorScheme` como `model()` + `defaultTheme`/`defaultColorScheme`; `storageKey` persiste en `localStorage` (try/catch, solo el eje no controlado, solo en browser).
- **Anidación:** el provider hijo inyecta al padre (`inject(BipThemeContext, { optional: true, skipSelf: true })`) y hace merge; `density`/`dir` se heredan si no se declaran.
- API pública: `BipThemeContext` (signals `theme`, `colorScheme`, `resolvedColorScheme`, `density`, `dir`, `attributes`), `injectThemeControls()` → `{ setTheme, setColorScheme, toggleColorScheme }` (no-op en eje controlado), `getThemeInitScript({ storageKey })` (IIFE para `<head>`, anti-FOUC), `THEME_RESET_STYLE`.
- **`BipOverlay`** (`core/overlay`): wrapper del CDK `Overlay` que al crear un overlay estampa en el pane `data-theme`, `data-color-scheme`, `data-density`, `dir` y las CSS vars inline del contexto de theme más cercano (equivalente a `useThemeAttributes()`), y las mantiene sincronizadas con un `effect()`. **Todos** los overlays de la librería (Modal, Drawer, Toast, Dropdown, Popover, Tooltip, Select, pickers, Odontogram) deben usar `BipOverlay`, nunca `Overlay` directo.
- Storybook: decorator global que envuelve cada story en `<bip-theme-provider>` leyendo los globals; `brandPresets.ts` (incluye `canary` `#ffe066`); story `Foundations/Theming` (playground con `<input type=color>`, panel de contraste, snippet copiable); stories `SideBySide`, `PortalTheming`, `SystemColorScheme`, `UncontrolledWithPersistence`.
- **Terminado cuando:** se portan los casos de `ThemeProvider.test.tsx` y pasan; overlay de prueba hereda theme/dark/tokens.

### Bloque 3 — i18n, utilidades y primitivas de a11y

**Objetivo:** todo lo transversal que necesitan los componentes.

- `core/i18n`: interfaz `BipLocale` (copiar la forma exacta de `src/i18n/types.ts`), diccionarios `esMX` (default) y `enUS`, `mergeLocale()`, `PartialBipLocale`, `provideBipLocale(locale | Signal<BipLocale>)`, `injectBipLocale()`. `locale.locale` alimenta todos los `Intl.*`.
- Test guard `no-hardcoded-strings` (portar `src/i18n/no-hardcoded-strings.test.ts` escaneando `.html` y `.ts` de componentes) + `dictionaries` (ambos diccionarios con las mismas llaves).
- `core/utils` (reemplaza `shared-utils`): `formatCurrency(amount, { locale?, currency? })`, `formatDate()`, `validateRFC()` (regex `/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/`, sin normalizar) + versiones Angular: pipes `bipCurrency`, `bipDate`, validator `bipRfcValidator` para Reactive Forms. Portar los 21 tests.
- `core/a11y`: `BipIdGenerator`, `disclosure()`, `mediaQuery()` signal, directiva `bipClickOutside`, `BipVisuallyHidden` (va aquí porque la usan otros).
- `core/forms`: clase base/helper para CVA (`BipFormControlBase`: `value` model, `disabled` desde forms, `touched`, derivar `error` de `NgControl` inválido+tocado **o** del input `error` explícito, ids de label/helper/error).
- Registro de a11y (`testing/a11y.spec.ts`) con **coverage guard**: falla si un directorio de componente no tiene entrada (SKIP_LIST solo `theme`). `color-contrast` deshabilitado aquí (se cubre en Bloque 11).
- Story `Foundations/I18n`.
- **Terminado cuando:** guards en verde, `provideBipLocale(enUS)` cambia textos en una story de prueba.

### Bloque 4 — Componentes de layout, tipografía y display

Sin estado complejo; validan el patrón base. (Orden sugerido = orden de la lista.)
`Container`, `Stack`, `Grid`, `Text`, `Heading`, `Divider`, `Link` (`a[bipLink]`), `Spinner`, `Skeleton`, `Badge`, `Avatar` + `AvatarGroup` (overflow i18n), `ProgressBar`, `EmptyState`, `Card` + `CardHeader/CardBody/CardFooter/CardMedia`, `StatsCard`, `Alert` (`role=status` para info/success, `role=alert` para warning/error; botón cerrar i18n).

- **Terminado cuando:** los 17 cumplen la DoD.

### Bloque 5 — Formularios básicos (todos con ControlValueAccessor)

`Button` (`button[bipButton], a[bipButton]`, variantes, tamaños, loading, `--color-txt-on-*`), `Input`, `Textarea`, `Checkbox` + `CheckboxGroup`, `Radio` + `RadioGroup` (group = CVA; radio sin `aria-invalid`), `Toggle` (thumb con `--rtl-x`), `Select` (nativo o custom según React — replicar exactamente; opciones y grupos), `NumberInput`, `SearchInput`, `Slider`, `FileUpload` (drag&drop, rechazados `RejectedFile`).

- Cada uno probado con `FormControl`, `ngModel` y `[(value)]`; `disabled` desde el form.
- Story extra por componente: "Reactive Forms" con validación y error visible.
- **Terminado cuando:** los 13 cumplen la DoD.

### Bloque 6 — Overlays y feedback (todos vía `BipOverlay`)

`Modal` + `ModalHeader/Body/Footer` (declarativo `[(open)]` con template portal; focus trap, restaura foco, Escape, primer focusable; scroll lock), `ConfirmDialog` (textos i18n), `DrawerPanel` (`placement` left/right físico por diseño), `Toast` (`BipToast` service + `provideBipToast({ position })`, región `role=region` con label i18n, `duration: 0` persistente, default 5000ms, barra de progreso, reusa `bip-alert`), `Tooltip` (`[bipTooltip]` directiva; `position` físico, `align` lógico; burbuja `--color-surface-inverse`), `Popover` + trigger/content, `Dropdown` (patrón WAI-ARIA Menu Button con `ListKeyManager`: ↑↓ Home End, Escape devuelve foco, `role=menuitem`, separadores).

- **Terminado cuando:** los 7 cumplen la DoD y la story `PortalTheming` muestra Modal/Toast heredando dark + brand.

### Bloque 7 — Navegación y disclosure

`Tabs` + `TabList/Tab/TabPanel` (variantes, tamaños, orientación, flechas con `ListKeyManager`), `Accordion` + `AccordionItem/Trigger/Content` (variantes), `Breadcrumb` (nav label i18n), `Pagination`, `Stepper` + `StepperStep`, `Navbar` + `NavbarBrand/Nav/Item/Actions` (landmark, hamburguesa con disclosure, panel móvil renderizado condicional, Escape/click fuera, `aria-current`), `Sidebar` + subpartes (aside + nav, colapsado con tooltip, trigger `aria-expanded/controls`, overlay móvil con `--rtl-x`, variantes `dark`/`primary`), `Timeline` + `TimelineItem`.

- Integración opcional con Router: `NavbarItem`/`SidebarItem`/`Breadcrumb` aceptan `routerLink` y calculan `aria-current` con `routerLinkActive`.
- **Terminado cuando:** los 8 cumplen la DoD.

### Bloque 8 — Selección avanzada y fechas

`MultiSelect` (706 líneas React: búsqueda, chips, teclado), `Calendar` (1413 líneas: vistas `CalendarView`, eventos con `CalendarEventStatus`, popovers — el más grande; dividir en subcomponentes internos), `DatePicker` (vistas día/mes/año, navegación por teclado en las 4 direcciones), `DateRangePicker`, `TimePicker`.

- Helpers de fechas compartidos en `core/utils/date` (portar `src/lib/dateHelpers.ts`), todo formateo vía `Intl` con `locale.locale`. Sin librerías de fechas externas.
- Todos CVA (`Date | null`, `{ start, end }`, string de hora).
- **Terminado cuando:** los 5 cumplen la DoD; tests de teclado portados completos (año/mes/día).

### Bloque 9 — Datos

`Table` + `TableHead/Body/Row/Header/Cell/Empty` (`selected` → `aria-selected`; header `sortable` con `tabindex=0` + Enter/Space), `DataTable` (búsqueda, ordenamiento, selección con conteo, visibilidad de columnas, resumen — todos los textos i18n; columnas definidas con `<ng-template bipCell="key">` y `bipHeader`).

- **Terminado cuando:** los 2 cumplen la DoD.

### Bloque 10 — Odontogram (dominio dental)

`Odontogram`, `ToothSVG`, `ToothDetail`, `NotePopover`, `ImagePopover` + `types.ts` (`ToothCondition`, `ToothImageType`, `ToothSurface`). Popovers vía `BipOverlay`. Portar los 976 líneas de tests.

- **Terminado cuando:** cumple la DoD.

### Bloque 11 — Calidad end-to-end

(La infraestructura se puede arrancar desde el Bloque 4 para ir agregando baselines; se **cierra** aquí.)

- `visual/theme-matrix.spec.ts`: square/rounded × light/dark, brand custom, Foundations/Colors (timeout 15s en ese screenshot), Radius, SideBySide, PortalTheming, SystemColorScheme, SideBySide con `&globals=dir:rtl`. No screenshotear UncontrolledWithPersistence.
- `visual/component-matrix.ts` (manifiesto único; storyIds sacados de `http://localhost:6006/index.json`, nunca calculados a mano) + `component-matrix.spec.ts` (screenshot de `#storybook-root`, + RTL para los marcados) con coverage guard.
- `visual/a11y-browser.spec.ts`: mismo manifiesto, `AxeBuilder` con reglas default (incluye `color-contrast`) en light y dark.
- `scripts/visual-docker.sh` + `pnpm test:visual:docker [--update-snapshots]`: imagen Playwright fijada a la versión exacta de `@playwright/test` (el script aborta si difieren), `--platform linux/amd64`, `node_modules` como volúmenes anónimos. Baselines **solo Linux** (`-chromium-linux.png`), nunca generar nativo en macOS.
- `e2e/`: `scripts/e2e-consumer.sh` → build librería → `pnpm pack` (desde `dist/bip-angular`) → app Angular limpia en `e2e/consumer-app` (fuera del workspace, `pnpm-workspace.yaml` con `packages: []`) que instala el **tarball** → `ng build` → servir → Playwright verifica: background de `bipButton` = hex de `--color-primary`, `border-radius` distinto entre square/rounded, overlay hereda theme, sin errores de consola. Además un build **SSR** del consumer para verificar que nada toca `window` en servidor.
- `publint`, `@arethetypeswrong/cli`, `size-limit` por entry point.
- **Terminado cuando:** `pnpm test:visual:docker` y `pnpm test:e2e` en verde y ya sin violaciones de contraste.

### Bloque 12 — CI/CD, versionado y publicación

- Workflows (mismo diseño que React):
  | Workflow                              | Trigger             | Pasos                                                                                                                                                                                                                                      |
  | ------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
  | `pr-validation.yml`                   | PR a cualquier rama | branch check → lint → test → build → visual-regression (job paralelo en container Playwright) → changeset-check (solo PR a `dev`)                                                                                                          |
  | `dev.yml`                             | push/PR a `dev`     | lint → test → build → storybook preview                                                                                                                                                                                                    |
  | `qa.yml`                              | push/PR a `qa`      | audit ∥ lint → test → build → e2e-consumer → storybook QA                                                                                                                                                                                  |
  | `production.yml`                      | push/PR a `main`    | security + lint + test + typecheck → build → e2e-consumer → publish npm (`needs: e2e-consumer`, publica desde `dist/bip-angular`) → Storybook a GitHub Pages → GitHub Release (cuerpo extraído de `CHANGELOG.md` con awk por `## [x.y.z]`) |
  | `codeql.yml`, `dependency-review.yml` | estándar            | —                                                                                                                                                                                                                                          |
- Siempre `pnpm install --frozen-lockfile`. Tests antes de build.
- El repo es **público** → GitHub Actions sin costo; todos los pipelines de arriba se mantienen.
- **NO usar Dependabot** (ni Renovate u otro bot que abra PRs `chore(deps)` periódicos): no se
  crea `.github/dependabot.yml`. Decisión explícita del dueño del repo. Las dependencias se
  actualizan a mano, en ramas `feature/deps-*`, cuando se decida. `dependency-review.yml` (revisa
  solo los PRs que ya existen) y `codeql.yml` sí se mantienen.
- Sí se portan de `../bip-design-system/.github/`: `PULL_REQUEST_TEMPLATE.md`, `ISSUE_TEMPLATE/`,
  `CODEOWNERS`, y `CONTRIBUTING.md`/`CODE_OF_CONDUCT.md`/`SECURITY.md` en la raíz (adaptados a Angular).
- Versionado: Changesets calcula el número; CHANGELOG a mano. Al liberar: renombrar `## [Unreleased]` → `## [x.y.z] - YYYY-MM-DD`, agregar `## [Unreleased]` nuevo, **después** `pnpm exec changeset version`.
- Versiones: `0.x` mientras haya bloques pendientes; **`1.0.0`** cuando los Bloques 0–12 estén completos.
- README de consumo: instalación, `bip.css` en `angular.json`, `provideBipTheme()`, `provideBipLocale()`, `getThemeInitScript` para SSR, ejemplos.
- Secret `NPM_TOKEN` en GitHub; GitHub Pages habilitado.
- **Terminado cuando:** una release de prueba `0.x` se publica en npm desde `main` y Storybook queda en Pages.

---

## Estado de bloques

- [x] Bloque 0 — Bootstrap del workspace y tooling
- [x] Bloque 1 — Foundations: tokens, estilos globales y guards
- [x] Bloque 2 — Theming y puente de overlays
- [x] Bloque 3 — i18n, utilidades y primitivas de a11y
- [x] Bloque 4 — Layout, tipografía y display (17)
- [ ] Bloque 5 — Formularios básicos (13)
- [ ] Bloque 6 — Overlays y feedback (7)
- [ ] Bloque 7 — Navegación y disclosure (8)
- [ ] Bloque 8 — Selección avanzada y fechas (5)
- [ ] Bloque 9 — Datos (2)
- [ ] Bloque 10 — Odontogram
- [ ] Bloque 11 — Calidad end-to-end
- [ ] Bloque 12 — CI/CD, versionado y publicación

## Inventario completo de la referencia (checklist de paridad)

**Componentes (52 directorios React):** Accordion, Alert, Avatar(+Group), Badge, Breadcrumb, Button,
Calendar, Card(+Header/Body/Footer/Media), Checkbox(+Group), ConfirmDialog, Container, DataTable,
DatePicker, DateRangePicker, Divider, DrawerPanel, Dropdown, EmptyState, FileUpload, Grid, Heading,
Input, Link, Modal(+Header/Body/Footer), MultiSelect, Navbar(+Brand/Nav/Item/Actions), NumberInput,
Odontogram(+ToothSVG/ToothDetail/NotePopover/ImagePopover), Pagination, Popover(+Trigger/Content),
ProgressBar, Radio(+Group), SearchInput, Select, Sidebar(+subpartes), Skeleton, Slider, Spinner,
Stack, StatsCard, Stepper(+Step), Table(+Head/Body/Row/Header/Cell/Empty), Tabs(+List/Tab/Panel),
Text, Textarea, ThemeProvider, TimePicker, Timeline(+Item), Toast, Toggle, Tooltip, VisuallyHidden.

**Transversal:** tokens/primitives/themes/density/rtl/fonts CSS · contrast lib · breakpoints ·
i18n (esMX/enUS, mergeLocale) · hooks (clickOutside, disclosure, focusTrap, mediaQuery, scrollLock) ·
shared-utils (formatCurrency, formatDate, validateRFC) · Foundations docs (Colors, Radius, Spacing,
Typography, Motion, Breakpoints, Theming, I18n) · guards (spacing, on-text, rtl, tokens,
contrast-tokens, css-comment-balance, no-hardcoded-strings, a11y coverage, component-matrix coverage) ·
visual Docker · a11y en navegador · e2e del tarball · Changesets · 6 workflows
(**sin** `dependabot.yml` — excluido a propósito, ver Bloque 12).

## Comandos

```bash
pnpm install
pnpm build             # ng-packagr → dist/bip-angular
pnpm test               # vitest run (una vez); pnpm test:watch para watch
pnpm lint
pnpm typecheck
pnpm format / pnpm format:check
pnpm storybook          # http://localhost:6006
pnpm build-storybook
pnpm changeset
pnpm test:visual:docker [--update-snapshots]   # nunca test:visual nativo — llega en el Bloque 11
pnpm test:e2e                                   # llega en el Bloque 11
```
