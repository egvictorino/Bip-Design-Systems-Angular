# Changelog

Todos los cambios notables de `@bip-design-systems/angular` se documentan en este archivo.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/), y el proyecto
usa [Semantic Versioning](https://semver.org/lang/es/) (`0.x` mientras haya bloques del plan
pendientes; `1.0.0` cuando los Bloques 0-12 de `CLAUDE.md` estén completos).

## [Unreleased]

### Added

- `BipSelect`: input `search` (boolean, default `false`). Convierte el `<select>` nativo en un
  combobox editable (patrón WAI-ARIA "editable combobox with list autocomplete"): se escribe en
  el propio campo y las opciones y grupos se filtran en el panel (`BipOverlay`); ↓↑ Enter Escape,
  `aria-activedescendant`, "Sin resultados" localizado, compatible con `[(value)]` y Forms. Sin
  `search` el DOM y el comportamiento son idénticos a los anteriores.
- `BipMultiSelect`: input `search` (boolean, default `true`) para ocultar el buscador del panel.
- `core/utils`: `matchesSearch()` y `foldSearchText()` (búsqueda sin distinguir mayúsculas ni
  acentos). Textos i18n `select.options` y `select.noResults` en `esMX` y `enUS`.
- `BipSelect`: búsqueda remota con `externalFilter` (no filtra internamente; el consumidor
  reemplaza `options()`), salida `searchQuery` (emite lo escrito y `''` al cerrar) e input
  `loading` (oculta las opciones, `aria-busy` en el campo y región `aria-live="polite"` con
  "Cargando..."). La opción elegida conserva su label aunque ya no esté en `options()` (se recuerda
  la última elegida; un valor inicial debe venir en la primera carga).
- `BipSelect`: input `clearable` (default `false`, solo con `search`). Botón con `aria-label`
  localizado, visible con valor y sin `disabled`; limpia a `''`, emite el cambio y devuelve el foco.
  Escape con el panel cerrado también limpia.
- `core/utils`: `firstEnabledIndex()` y `nextEnabledIndex()`. i18n `select.loading`,
  `select.loadingText` y `select.clear` en `esMX` y `enUS`.
- `BipMultiSelect`: input `searchPlacement` (`'panel'` | `'trigger'`, default `'panel'`: sin
  cambios para quien ya lo usa). Con `'trigger'` el buscador es un `<input role="combobox">` junto
  a los chips (patrón "tags input", `aria-activedescendant`, foco real siempre en el input):
  ↓↑ Enter (alterna sin cerrar) Escape Tab, Backspace con el campo vacío quita el último chip;
  "Seleccionar todo" es la primera entrada navegable.

### Changed

- `BipMultiSelect`: el filtro del buscador ahora ignora acentos ("mexico" encuentra "México").

### Fixed

- `BipSelect`: padding del campo con propiedades lógicas; en RTL el texto se montaba sobre el
  chevron.
- `BipMultiSelect`: con `externalFilter` los chips elegidos ya no desaparecen cuando el consumidor
  reemplaza `options()` (se recuerdan; un valor que nunca estuvo en `options()` sigue sin label).
- `BipMultiSelect`: el estado de carga usa una región `role="status"` `aria-live="polite"` siempre
  montada en el panel (antes se montaba junto con su texto y no se anunciaba de forma fiable).

## [0.1.0] - 2026-10-02

### Added

- CI/CD y publicación (Bloque 12): workflows `dev.yml`, `qa.yml`, `production.yml` (publica en
  npm con provenance desde `dist/bip-angular`, Storybook a GitHub Pages, GitHub Release con el
  cuerpo extraído de este CHANGELOG), `codeql.yml` y `dependency-review.yml`;
  `pr-validation.yml` suma `typecheck`, el job `visual-regression` (container Playwright) y
  `security-audit` hacia `qa`. `CONTRIBUTING.md` (incluye el proceso de release),
  `SECURITY.md`, `CODE_OF_CONDUCT.md`, `CODEOWNERS`, plantillas de PR e issues, README raíz y
  README de consumo del paquete. Sin Dependabot, por decisión del dueño del repo.
- Calidad end-to-end (Bloque 11, bloque completo): regresión visual real contra Docker
  (`visual/component-matrix.spec.ts` + `visual/theme-matrix.spec.ts`, 78 baselines Linux de las
  50 secondary entries en LTR y las 20 con geometría direccional también en RTL) y a11y en
  navegador real con axe-core y `color-contrast` activado (`visual/a11y-browser.spec.ts`, 100
  combinaciones componente×esquema de color, 0 violaciones) — `pnpm test:visual:docker`. Smoke
  test del tarball publicado con SSR real de un consumidor Angular independiente fuera del
  workspace (`e2e/consumer-app`, `pnpm-workspace.yaml` con `packages: []` para instalar el
  tarball empaquetado en vez de un link de workspace) — `pnpm test:e2e`. `publint` +
  `@arethetypeswrong/cli` + `size-limit` por entry point — `pnpm lint:package` / `pnpm size`
  (`scripts/generate-size-limit.cjs` genera los límites a partir de `dist/` real). Nuevos guards
  en `testing/`: `entry-boundaries` (sin imports relativos cruzados entre secondary entries),
  `no-direct-overlay` (`inject(Overlay)` del CDK solo permitido en `bip-overlay.service.ts`) y
  `no-unsafe-sinks` (sin `innerHTML`/`bypassSecurityTrust*`/`eval`/`new Function`). Registro
  completo de hallazgos de arquitectura y seguridad del bloque en `docs/reviews/bloque-11.md`.

### Changed

- `package.json` del paquete: `repository`, `homepage`, `bugs`, `keywords` y
  `publishConfig.access: public` (`repository` es requisito de `npm publish --provenance`).
  `pnpm build` copia el `LICENSE` a `dist/bip-angular` (`scripts/copy-license.cjs`: ng-packagr
  no permite assets fuera de la raíz del proyecto).
- `release/*` pasa a ser un origen válido hacia `dev` y queda exento de `changeset-check`.
- `package.json#exports` agrega `"./styles/*": "./styles/*"` y `sideEffects` pasa de `false` a
  `["**/*.css"]` — sin esto, `"@bip-design-systems/angular/styles/bip.css"` en el `angular.json`
  de un consumidor (especificador de paquete, no ruta relativa a `node_modules`) no resolvía.
- `BipOverlay` (`core/overlay`) reexpone `position()` y `scrollStrategies` del `Overlay` del CDK
  — los 8 componentes que lo inyectaban solo para eso (Dropdown, Tooltip, Calendar, DatePicker,
  DateRangePicker, TimePicker, MultiSelect, Popover) ya no importan `Overlay` directo.
- Renombres sin alias de compatibilidad (librería en `0.0.0`, sin publicar aún):
  `BipToastItemComponent` → `BipToastItem`, `BipThemeDirective` → `BipTheme`,
  `BipClickOutsideDirective` → `BipClickOutside`, `BipBreadcrumbSeparatorDirective` →
  `BipBreadcrumbSeparator`, `BipDataTableHeaderDirective` → `BipDataTableHeader`,
  `BipDataTableCellDirective` → `BipDataTableCell` (tabla de traducción React→Angular de
  CLAUDE.md: sin sufijo `Component`/`Directive`).
- `formatFileSize()` se mueve de `file-upload` a `core/utils` (compartido también por
  `odontogram/ImagePopover`, ver Fixed).

### Fixed

- **Estilos de componente nunca aplicados bajo `ViewEncapsulation.Emulated`** en 44 componentes
  (Accordion, Badge, Button, Container, DataTable, Dropdown*, Grid, Heading, Link, Modal*,
  Navbar*, Sidebar*, Spinner, Stack, Stepper*, Table*, Tabs*, Timeline*, Toast — lista completa
  en `docs/reviews/bloque-11.md`): su CSS estilaba la clase que el componente aplica a su propio
  elemento host con un selector plano (`.bip-x { }`), que Angular reescribe a
  `.bip-x[_ngcontent-xxx]` — un atributo que solo llevan los elementos renderizados POR el
  template del componente, nunca su host (que lleva `_nghost-xxx`). Esas reglas nunca aplicaron,
  en ningún navegador, desde que se escribió cada componente. Corregido a `:host { }` /
  `:host(.bip-x--variant) { }`.
- `.storybook/preview.ts` nunca importó `styles/bip.css` — ninguna `var(--color-*)`/
  `var(--space-*)`/`var(--radius-*)` resolvía en ninguna story, de ningún Bloque, hasta este
  bloque.
- 6 violaciones reales de accesibilidad detectadas por `visual/a11y-browser.spec.ts` contra
  Chromium real: contraste insuficiente en los días de "otro mes" y en los chips de status de
  Calendar y en una story de DataTable; nombre accesible faltante en el trigger de MultiSelect
  (`<label for>` no asocia accesiblemente un `<div role="combobox">`); estructura `<ul>/<li>`
  inválida en Navbar y Sidebar (el propio componente se interpone entre la lista y su wrapper).
- `BipToastItem`: `inject(DestroyRef)` se capturaba dentro del callback de `afterNextRender`,
  fuera de contexto de inyección (NG0203 en cualquier navegador con `ResizeObserver`; no
  detectado antes porque jsdom no lo implementa).
- SSR: Calendar usaba el `document` global en vez de `inject(DOCUMENT)` (crash en `ngOnDestroy`
  en servidor); Modal/DrawerPanel creaban su overlay y llamaban `requestAnimationFrame` durante
  SSR si `open` era `true` en el primer render.
- Modal, DrawerPanel y `odontogram/ToothDetail` no llamaban `dispose()` en su `OverlayRef` si el
  componente se destruía abierto.
- `BipFormControlBase.hasError` no reaccionaba a cambios de validez/touched del control sin un
  `blur` propio (p. ej. `form.markAllAsTouched()` al enviar un formulario).
- `BipOverlay`: el `effect()` de sincronización de tema se destruía en el primer `detachments()`
  en vez de en `dispose()`, rompiendo la sincronización si Modal/DrawerPanel reutilizaban el
  mismo `OverlayRef` entre `show()`/`hide()`; las CSS vars que dejaban de estar presentes en el
  tema no se removían del pane del overlay.
- Seguridad: `getThemeInitScript()` permitía escapar de `</script>` e inyectar markup/script
  arbitrario en el `<head>` (ahora escapa y valida los valores contra un allowlist); `cssVars`
  (escape hatch de `<bip-theme-provider>`) aceptaba cualquier propiedad CSS, no solo custom
  properties, en un `[style]` sin sanitizar; `odontogram/ImagePopover` leía cualquier archivo
  elegido a un data URL sin validar tipo ni tamaño; `pr-validation.yml` interpolaba
  `github.head_ref` directo en un script de `run` (inyección de script); 2 vulnerabilidades de
  `pnpm audit` (`piscina`, `uuid`, transitivas del toolchain de build) resueltas con
  `pnpm.overrides`.
- Deduplicado `startOfDay`/`isSameDay`/`formatDate` entre Calendar, DatePicker, DateRangePicker
  y el `calendar-grid` interno de `core` (vivían copiados en cada uno).

### Added (bloques anteriores)

- Odontogram (Bloque 10, bloque completo): `BipOdontogram` (cuadrícula de odontograma FDI,
  permanente de 32 piezas 11-48 o primaria de 20 piezas 51-85 vía `dentition`; `[(value)]` como
  `model()` de Angular — a diferencia de la referencia React, que exigía además un `onChange`
  no-nulo para decidir interactividad, gating sin sentido con un `model()` siempre
  bidireccional; la interactividad depende solo de `disabled()`), `BipToothSvg` (SVG de las 5
  superficies de un diente — bucal/lingual/mesial/distal/oclusal —, usado sin interacción en la
  cuadrícula principal y de forma interactiva, en tamaño xl, dentro del panel de detalle;
  marcador en X para piezas ausentes), `BipToothDetail` (panel con toolbar de las 9 condiciones
  —sano/caries/restauración/corona/ausente/implante/fractura/endodoncia/extracción
  planeada—, badge de solo lectura cuando `disabled`, y acciones de nota/imágenes),
  `BipNotePopover`/`BipImagePopover` (auto-contenidos: backdrop propio + diálogo con
  `cdkTrapFocus`, montados/desmontados por `BipToothDetail` vía `BipOverlay`, igual que el resto
  de overlays de la librería; galería de imágenes con miniaturas, vista previa y alta vía
  `<input type="file">` oculto con `<bip-visually-hidden>`). Textos/ARIA del dominio dental
  (nombres anatómicos FDI, condiciones, superficies, tipos de imagen) ya vivían en `BipLocale`
  desde el Bloque 3 (preparados junto con los tipos `ToothCondition`/`ToothSurface`/
  `ToothImageType` en `core/types`); este bloque solo los consume.

- Datos (Bloque 9): 2 componentes. `BipTable` + subpartes (`BipTableHead`, `BipTableBody`,
  `BipTableRow`, `BipTableHeader`, `BipTableCell`, `BipTableEmpty`), todas mejorando elementos
  nativos de tabla (`thead[bipTableHead]`, `tr[bipTableRow]`, `th[bipTableHeader]`,
  `td[bipTableCell]`, `tr[bipTableEmpty]`) en vez de envolverlos, para conservar la semántica de
  tabla intacta; contexto compartido vía `BIP_TABLE_CONTEXT` (striped/compact/stickyHeader) +
  un token aparte `BIP_TABLE_IN_HEAD` para que las filas sepan si están dentro de `<thead>` (sin
  `aria-selected` ni hover/zebra ahí). `align` usa las palabras clave lógicas de `text-align`
  (`start`/`center`/`end`) en vez de `left`/`right` de la referencia React. `BipDataTable`
  (búsqueda, ordenamiento, selección con conteo y acciones masivas, visibilidad de columnas,
  resumen de resultados anunciado vía `aria-live`, paginación, modo `serverSide`); columnas
  definidas con `<ng-template bipCell="key">`/`<ng-template bipHeader="key">` proyectados en vez
  del `render`/`header` por función de la referencia React. Añadido `ariaLabel` a `BipCheckbox`
  (Bloque 5) para los checkboxes de selección de `BipDataTable`, que no tienen label visible.
  **Fix de accesibilidad en `BipTableHeader`:** el binding de host `'(click)': 'sortable() &&
sort.emit()'` evaluaba a `false` en encabezados no ordenables, y Angular interpreta que un
  listener de evento que evalúa a `false` pide `preventDefault()` — cancelando silenciosamente
  el toggle nativo de cualquier checkbox/control interactivo proyectado dentro (como el
  checkbox de "seleccionar todo" de `BipDataTable`). Reemplazado por un método que no retorna
  nada.

- Selección avanzada y fechas (Bloque 8): 5 componentes. `BipMultiSelect` (combobox
  multiselección con búsqueda, chips con overflow configurable vía `maxVisibleChips`,
  agrupación por `group`, "Seleccionar todo"/"Seleccionar visibles" según haya búsqueda activa;
  foco real movido entre `<li role="option">` vía `querySelectorAll` sobre el panel — sin
  `aria-activedescendant` —, igual que la referencia React; panel vía `BipOverlay` +
  `TemplatePortal`). Nueva cuadrícula compartida `BipCalendarGrid` en `core` (unifica
  `CalendarGrid`/`RangeCalendarGrid` de la referencia, que son casi idénticas salvo el
  resaltado de selección): drill-down días→meses→años, navegación de teclado sin wrap en
  días/años (←→↑↓, Home/End, PageUp/PageDown saltan mes/década), roving focus basado en
  signals; vive en `core` porque la comparten dos secondary entries distintos
  (`date-picker`/`date-range-picker`), que no pueden importarse entre sí directamente.
  `BipDatePicker` (trigger con ícono final de 3 estados carga/limpiar/calendario, botón "Hoy").
  `BipDateRangePicker` (replica la máquina de estados de selección exacta de la referencia:
  primer click fija `from`, segundo click completa el rango o lo intercambia si es anterior a
  `from` o lo limpia si repite el mismo día; preview en vivo del rango mientras se hace hover
  sobre el segundo día, vía un input `previewTo` alimentado por el hover de la grilla). Ambos
  pickers de fecha con `min`/`max`/`disabledDates`, popover `role="dialog"` vía `BipOverlay`,
  Escape cierra y devuelve el foco al trigger. `BipTimePicker` (columnas de horas/minutos con
  patrón `aria-activedescendant` — foco DOM real en el `listbox`, opciones solo resaltadas
  visualmente, a diferencia del resto de la librería —, columna AM/PM solo-click, modo
  `inputMode="text"` con validación en vivo, auto-ajuste cuando el valor cae fuera de
  `minTime`/`maxTime`; nueva clave de locale `timePicker.now` — la referencia React hardcodea
  el botón "Ahora" como literal, aquí pasa por el diccionario). `BipCalendar` (4 vistas
  totalmente controladas — mes/semana/día/agenda, sin estado interno —: vista mes con
  selección de rango por arrastre que abre un popover de confirmación vía `BipOverlay` — la
  referencia usa `createPortal` directo —, sin navegación por flechas en la grilla, gap
  conocido replicado a propósito; semana/día comparten un TimeGrid con columnas por doctor
  cuando se proveen `resources`; agenda con filtros de estado `role="checkbox"`). Helpers de
  fechas puros portados 1:1 a `core/utils` (`isSameDay`, `addDays`, `getDaysInMonth`,
  `getMondayOffset`, `monthIndex`, `dateKey`), sin librerías de fechas externas, usados por
  `BipCalendarGrid`, `BipCalendar` y ambos pickers de rango/fecha.
- Navegación y disclosure (Bloque 7): 8 componentes. `BipTimeline` + `BipTimelineItem`
  (puramente presentacional, sin teclado; contexto plano solo para `orientation`; marcador
  punto+conector decorativo `aria-hidden`; sin `aria-label` por defecto, fiel a React).
  `BipBreadcrumb` (sin partes compuestas; el último item es siempre texto no interactivo con
  `aria-current="page"` aunque tenga `href`/`routerLink`; items intermedios navegan con
  `RouterLink` de Angular o `href` nativo; separador reemplazable vía
  `<ng-template bipBreadcrumbSeparator>` — no `<ng-content>` directo, porque se repite una vez
  por item; chevron por defecto espejado en RTL con `--rtl-x`). `BipPagination` (totalmente
  controlado, sin modelo propio; `getPageRange()` portado 1:1; no renderiza nada si
  `totalPages<=1`; flechas espejadas en RTL). `BipTabs` + `BipTabList`/`BipTab`/`BipTabPanel`
  (contexto plano, `value` como `model()`; `BipTabList` usa `FocusKeyManager` del CDK para las
  flechas según `orientation` — con wrap, Home/End, salta disabled — pero con activación
  manual: las flechas solo mueven el foco, clic/Enter/Espacio activa, igual que React; indicador
  animado mide con `getBoundingClientRect()` pero posiciona con `inset-inline-start` invertido
  según `Directionality`, no con `left` físico). `BipAccordion` +
  `BipAccordionItem`/`BipAccordionTrigger`/`BipAccordionContent` (contexto anidado raíz+item;
  `value` es un único `model()` cuya forma pública, string o string[], depende de
  `type="single"|"multiple"`, normalizado internamente a `Set<string>`; sin navegación por
  flechas entre encabezados, solo tabulación nativa; `BipAccordionContent` siempre en el DOM,
  abre/cierra con transición de `grid-template-rows` en vez de medir altura en JS). `BipStepper`
  - `BipStepperStep` (totalmente controlado, `value` como `model.required()`; un `variant` de
    estado explícito — danger/success/warning/loading — desplaza al indicador activo/completado
    con prioridad loading>error>warning>success>completado>número; el paso activo es un `<div
aria-current="step">` no interactivo, los demás son `<button>` cuyas flechas saltan el valor
    activo ±1 directamente, no es roving focus; fix de a11y: el marcador siempre lleva
    `aria-label` para no quedar sin nombre accesible cuando muestra un icono en vez del número).
    `BipNavbar` + `BipNavbarBrand`/`BipNavbarNav`/`BipNavbarItem`/`BipNavbarActions` (apertura del
    panel móvil puramente interna, sin input/output, como React; a diferencia de la referencia,
    que mantiene dos árboles de nav/actions duplicados por un efecto para alimentar un panel móvil
    separado, aquí se proyecta una sola vez dentro de un panel cuyo layout cambia por CSS — barra
    horizontal en desktop, dropdown vertical en mobile; `inert` solo se activa bajo el breakpoint
    `md` y con el panel cerrado, decidido vía `BreakpointObserver`, nunca solo CSS; `BipNavbarItem`
    decide `<a routerLink>`/`<a href>`/`<button>` según props, flechas ←→/Home/End navegan dentro
    del mismo `<bip-navbar-nav>`). `BipSidebar` + `BipSidebarHeader`/`BipSidebarBrand`/
    `BipSidebarContent`/`BipSidebarGroup`/`BipSidebarGroupLabel`/`BipSidebarItem`/
    `BipSidebarSubMenu`/`BipSidebarFooter`/`BipSidebarTrigger` (ejes `open` drawer móvil y
    `collapsed` riel de iconos independientes, ambos `model()`; drawer móvil con overlay +
    `cdkTrapFocus` solo mientras `open` — mejora sobre React, que no atrapaba foco ahí — + Escape;
    slide-in con `--rtl-x`; `BipSidebarContent` es un landmark de navegación propio, separado del
    aside; `BipSidebarItem` recibe `label` como input explícito — Angular no puede leer texto
    proyectado como string — que sirve de nombre accesible, tooltip y texto visible a la vez, con
    `aria-label` que incluye el conteo del badge colapsado vía la nueva clave de locale
    `sidebar.badgeCount()` (fix de un hardcodeo en español de la referencia React);
    `BipSidebarSubMenu` colapsado muestra solo el ícono con tooltip, sin flyout, y se auto-cierra
    si el sidebar colapsa; flechas ↑↓/Home/End navegan por todo el sidebar recortando en los
    extremos — clamp, no wrap — fiel a `navigateSidebarItems()` de React).
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
  - `provideBipToast({ max, position })` opcional — sin `<ToastProvider>` envolviendo el árbol;
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
