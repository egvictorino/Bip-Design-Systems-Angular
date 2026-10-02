# CLAUDE.md — BipUI Angular (`@bip-design-systems/angular`)

Guía para Claude Code en este repositorio: solo reglas vigentes. Reglas de revisión, refactor y
seguridad: @AGENTS.md. Historial del plan por bloques y decisiones pasadas:
[docs/plan-maestro.md](docs/plan-maestro.md) (no se carga solo; consúltalo cuando haga falta).

## Qué es esto

Design system BipUI reescrito **desde cero para Angular**. La versión React
(`@bip-design-systems/ui-components` v1.1.0) es la **referencia funcional y visual**, no una
dependencia: local `../bip-design-system/packages/ui-components/` (solo lectura) o
https://github.com/egvictorino/Bip-Design-Systems.

- Se LEE para copiar comportamiento, API de props, estados, estilos, textos i18n, casos de test y
  decisiones de a11y: por componente, `X.tsx`, `X.module.css`, `X.test.tsx`, `X.stories.tsx`.
- **Nunca** se importa código, paquetes ni rutas de ese repo (ni en imports, `package.json` ni
  tsconfig paths).
- Los CSS de tokens y los diccionarios i18n ya se copiaron y evolucionan aquí.
- No se copian: React hooks, `cn()`/clsx, CSS Modules, `use-client`, Storybook React.

## Stack

- **Angular 21** (`^21.2.0`), fijado por decisión del dueño. No subir de major sin decisión
  explícita: es trabajo de un `feature/deps-*` aparte.
- pnpm ≥ 9 y Node **22 LTS** (`.nvmrc`, `engines`, `engine-strict=true`; con nvm:
  `nvm install 22 && nvm alias default 22`).
- Build: Angular CLI + **ng-packagr** (APF, ES2022, FESM). Un **secondary entry point por
  componente** (`@bip-design-systems/angular/button`); el entry primario re-exporta todo.
- Componentes: standalone, `OnPush`, signals, control flow `@if/@for/@switch`, sin NgModules;
  deben funcionar con y sin zone.js.
- **@angular/cdk**: Overlay, Portal, A11y, Bidi, Layout, ScrollStrategies.
- Todo control de formulario implementa **ControlValueAccessor**.
- CSS plano por componente (`styleUrl`), `ViewEncapsulation.Emulated`, tokens vía CSS custom
  properties. Sin Tailwind, sin SCSS.
- Tests: Vitest (`@angular/build:unit-test`) + Testing Library + jest-dom + user-event + axe.
- Docs: Storybook Angular (`@storybook/angular`), CSF3.
- Visual y a11y real: Playwright + `@axe-core/playwright`, **solo en Docker**.
- Lint: `angular-eslint` (prefijo `bip` en selectores), ESLint flat config, Prettier.
- Versionado: Changesets + `CHANGELOG.md` curado a mano (Keep a Changelog).

## Estructura

```
projects/bip-angular/      # la librería
  core/                    # entry @bip-design-systems/angular/core: theme, i18n, a11y, overlay, utils, types, forms
  <componente>/            # un entry por componente: ng-package.json, index.ts, public-api.ts,
                           # *.component.{ts,html,css,spec.ts}, *.stories.ts
  styles/                  # CSS global publicado (bip.css importa tokens, primitives, themes, density, rtl, fonts, base)
  foundations/             # stories de Foundations (no se publica)
  testing/                 # guards globales (a11y, spacing, rtl, on-text, tokens, boundaries…)
  src/public-api.ts        # entry primario
visual/                    # Playwright: theme-matrix, component-matrix, a11y-browser
e2e/                       # smoke test del tarball publicado (consumer-app + SSR)
scripts/  docs/  .storybook/  .changeset/  .github/workflows/
```

## Traducción de patrones React → Angular (obligatoria)

- `React.FC`/`forwardRef` → componente standalone. Si mejora un elemento nativo, **selector de
  atributo** (`button[bipButton], a[bipButton]`, `a[bipLink]`); si encapsula estructura
  (label+input+helper), **selector de elemento** (`bip-input`).
- props → `input()`/`input.required()`; booleanas con `transform: booleanAttribute`, numéricas
  con `numberAttribute`.
- `onX` callbacks → `output()`.
- controlado/no controlado → `model()` (two-way `[(value)]`) + ControlValueAccessor para forms.
- `children` → `<ng-content>`/`<ng-content select="...">`; slots con `<ng-template bipXxx>` +
  `contentChild()`.
- Compound components + Context con guard `null` → el padre se inyecta en los hijos con
  `inject(BipTabs, { optional: true })` y si es `null` →
  `throw new Error('<bip-tab> debe usarse dentro de <bip-tabs>')`. **Nunca** defaults silenciosos.
- `useId()` → `inject(BipIdGenerator).next('bip-input')` (`core/a11y`, estable en SSR). Nunca IDs
  derivados del label.
- `cn()`/CSS Modules → `host: { '[class]': 'hostClasses()' }` con `computed()`; clases dentro del
  CSS encapsulado.
- `className` → no hace falta: el consumidor pone `class` en el host.
- `createPortal` → CDK Overlay/Portal **siempre** vía `BipOverlay` (hereda theme).
- `useFocusTrap` → `cdkTrapFocus`/`FocusTrapFactory`.
- `useClickOutside` → `overlayRef.outsidePointerEvents()` o directiva `bipClickOutside`.
- `useDisclosure` → helper `disclosure()` (`isOpen`, `open`, `close`, `toggle`).
- `useMediaQuery` → `mediaQuery(query)` → `Signal<boolean>`.
- `useScrollLock` → `ScrollStrategyOptions.block()`.
- `displayName` → no aplica; clases `BipButton`, `BipInput`… (prefijo `Bip`, sin sufijo
  `Component`).
- Provider + hook (Toast) → servicio + `provideBipToast()` (`BipToast.show({...})`).
- `useBipLocale()` → `injectBipLocale()` → `Signal<BipLocale>`.

## Reglas de código

Seguridad, arquitectura limpia y reglas de revisión/refactor: ver [AGENTS.md](AGENTS.md).

- `strict: true`, `noUnusedLocals`, `noUnusedParameters`, `strictTemplates`, `strictInjectionParameters`.
- Todos los componentes: standalone, OnPush, signals. Nada de `@Input()`/`@Output()` decorators ni `NgModule`.
- **Nunca hex en CSS de componentes**: solo `var(--color-*)`. Spacing solo `var(--space-*)`. Radius solo tokens semánticos (`--radius-field`, `--radius-control`, `--radius-surface`, `--radius-container`, `--radius-container-lg`, `--radius-marker`, `--radius-pill`, `--radius-circle`). Transiciones con `var(--duration-*)`/`var(--ease-*)`. Foco con `box-shadow: var(--focus-ring)`.
- Texto sobre relleno de marca: `--color-txt-on-{primary|danger|success|warning|info|unique}`. `--color-txt-white` solo en la allowlist (sidebar dark, spinner white, avatar fallbacks).
- **Propiedades lógicas** (`margin-inline-start`, `inset-inline-*`, `text-align: start`). `translateX` direccional con `calc(var(--rtl-x) * Npx)`. Excepciones físicas por diseño: DrawerPanel `placement`, Toast `position`, Tooltip `position` (pero `align` es lógico).
- **CSS de host con `:host` / `:host(.bip-x--variant)`**: bajo `Emulated`, un selector plano (`.bip-x`) nunca matchea el propio elemento host.
- **Sin strings hardcodeadas** visibles/ARIA en componentes: todo sale del diccionario i18n (`esMX` y `enUS`).
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

## Ramas, versionado y release

- `main` (producción) ← `qa` ← `dev` ← `feature/xxx`. Hotfixes desde `main`, cherry-pick a `qa` y
  `dev`. `release/x.y.z → dev` es el único otro origen permitido hacia `dev` (exento de
  `changeset-check`).
- Changesets calcula el número; el CHANGELOG se escribe a mano. Al liberar: renombrar
  `## [Unreleased]` → `## [x.y.z] - YYYY-MM-DD`, agregar `## [Unreleased]` nuevo y **después**
  `pnpm exec changeset version`.
- `0.x` hasta decisión de `1.0.0`. Detalle del flujo: [CONTRIBUTING.md](CONTRIBUTING.md).
- **NO usar Dependabot** (ni Renovate u otro bot de PRs `chore(deps)`): no existe
  `.github/dependabot.yml`, decisión del dueño. Dependencias a mano en `feature/deps-*`.

## Gotchas vigentes

- Baselines visuales **solo Linux, solo Docker** (`pnpm test:visual:docker`); nunca nativo en macOS.
- `storyId` de `visual/component-matrix.ts` sale de `storybook-static/index.json`, nunca a mano.
- `.storybook/preview.ts` debe importar `styles/bip.css`; sin eso ninguna `var(--color-*)` resuelve.
- jsdom no aplica cascada CSS ni `ResizeObserver`: lo visual/layout se verifica en Storybook o Docker.
- Paquete publicado: `exports["./styles/*"]` y `sideEffects: ["**/*.css"]` van a mano en
  `projects/bip-angular/package.json`; `LICENSE` se copia con `scripts/copy-license.cjs`.
- Publicar a npm: token **granular** con _Bypass 2FA_ y _Read and write_ sobre `@bip-design-systems`;
  `publish-npm` usa `package-manager-cache: false`; el registro tarda minutos en servir el paquete.
- SSR en el consumer smoke test: sin `security.allowedHosts` Angular cae en silencio a un shell vacío.

## Estado

Bloques 0–12 completos; `0.1.0` publicada en npm (provenance), Storybook en Pages. Detalle,
checklist de paridad con React y hallazgos de calidad: [docs/plan-maestro.md](docs/plan-maestro.md)
y `docs/reviews/bloque-11.md`.

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
pnpm test:visual:docker [--update-snapshots]   # nunca test:visual nativo
pnpm test:e2e                                   # build + pack + consumer-app + SSR + Playwright
pnpm lint:package                               # publint + attw sobre dist/bip-angular (tras pnpm build)
pnpm size                                       # size-limit — node scripts/generate-size-limit.cjs para regenerar límites
```
