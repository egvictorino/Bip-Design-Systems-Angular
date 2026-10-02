# Bloque 11 — Revisión de arquitectura Angular y de seguridad

Hallazgos de la revisión de buenas prácticas de Angular/arquitectura limpia y de la revisión
de seguridad sobre `projects/bip-angular`, con su estado al cerrar el bloque. Ningún hallazgo
queda en estado "abierto" — cada uno está **corregido** o **aceptado** con su motivo.

## Bugs corregidos

| # | Hallazgo | Archivo | Estado |
|---|---|---|---|
| 1 | `inject(DestroyRef)` dentro del callback de `afterNextRender` (fuera de contexto de inyección, NG0203 en navegador real; no detectado porque jsdom no implementa `ResizeObserver`) | `toast/toast-item.component.ts` | ✅ Corregido + spec de regresión |
| 2 | SSR: `document` global en vez de `inject(DOCUMENT)` (crash en `ngOnDestroy` en servidor) | `calendar/calendar.component.ts` | ✅ Corregido |
| 3 | SSR: overlay creado y `requestAnimationFrame` llamado durante SSR si `open`/`model` era `true` en el primer render | `modal/modal.component.ts`, `drawer-panel/drawer-panel.component.ts` | ✅ Corregido (`isPlatformBrowser`) |
| 4 | SSR: medición de layout (`getBoundingClientRect`/`scrollHeight`) sin guard de browser | `tabs/tab-list.component.ts`, `textarea/textarea.component.ts` | ✅ Corregido |
| 5 | Overlay sin `dispose()` si el componente se destruye abierto | `modal`, `drawer-panel`, `odontogram/tooth-detail.component.ts` | ✅ Corregido (`DestroyRef.onDestroy`) |
| 6 | `setTimeout` sin limpiar si el componente se destruye en esa ventana | `navbar/navbar.component.ts` | ✅ Corregido |
| 7 | `BipOverlay`: el effect de sync de tema se destruía en el primer `detachments()`, rompiendo la sincronización si el mismo `OverlayRef` se reutilizaba (Modal/Drawer entre `show()`/`hide()`) | `core/src/overlay/bip-overlay.service.ts` | ✅ Corregido (se destruye en `dispose()`) |
| 8 | `BipOverlay`: las CSS vars que dejaban de estar presentes en el tema no se removían del pane | `core/src/overlay/bip-overlay.service.ts` | ✅ Corregido |
| 9 | `BipFormControlBase.hasError` no reaccionaba a cambios de validez/touched del control sin blur propio (p. ej. `form.markAllAsTouched()` al enviar) | `core/src/forms/form-control-base.ts` | ✅ Corregido (`control.events` + `ngOnInit`) + spec de regresión |

## Duplicación resuelta

- `startOfDay` (4 copias) → una sola vez en `core/src/utils/date-helpers.ts`; `calendar`,
  `date-picker`, `date-range-picker` y `calendar-grid` la importan.
- `isSameDay` reimplementado localmente en `date-picker`/`date-range-picker` → usan el de core.
- `new Intl.DateTimeFormat(...).format(...)` inline en `calendar`, `date-picker`,
  `date-range-picker` → usan el `formatDate()` de `core/utils` que ya existía.
- `formatFileSize` duplicado entre `file-upload` y el nuevo validador de
  `odontogram/image-popover` → una sola vez en `core/src/utils/file-size.ts`.

## Naming (tabla de traducción React→Angular, CLAUDE.md)

Renombrados sin dejar alias (librería en `0.0.0`, sin publicar):
`BipToastItemComponent`→`BipToastItem`, `BipThemeDirective`→`BipTheme`,
`BipClickOutsideDirective`→`BipClickOutside`,
`BipBreadcrumbSeparatorDirective`→`BipBreadcrumbSeparator`,
`BipDataTableHeaderDirective`→`BipDataTableHeader`,
`BipDataTableCellDirective`→`BipDataTableCell`.

## Overlays — límite único con `BipOverlay`

- `BipOverlay` reexpone `position()` y `scrollStrategies` del `Overlay` del CDK — los 8
  componentes que solo lo inyectaban para eso (`dropdown`, `tooltip`, `calendar`,
  `date-picker`, `date-range-picker`, `time-picker`, `multi-select`, `popover`) ya no importan
  `Overlay` directo.
- Guard nuevo `testing/no-direct-overlay.spec.ts`: falla si `inject(Overlay)` o el import de
  valor aparece fuera de `bip-overlay.service.ts`.

## Límites entre secondary entries

- No se encontraron imports relativos cruzados entre entries (todos los cruces existentes —
  `confirm-dialog`→`button`/`modal`, `toast`→`alert`, `data-table`→`table`/`pagination`/…,
  `sidebar`→`tooltip`, `card`→`skeleton`, `file-upload`→`spinner` — ya usaban el alias de
  paquete `@bip-design-systems/angular/x`, que es la forma correcta).
- Guard nuevo `testing/entry-boundaries.spec.ts`: falla si aparece un import relativo que
  escape del propio directorio de un entry (protección contra regresión futura).

## Sinks inseguros

- No se encontró `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `bypassSecurityTrust*`,
  `[attr.href]`/`[attr.src]` sin sanitizar, `eval` ni `new Function` en código publicado.
- Guard nuevo `testing/no-unsafe-sinks.spec.ts` protege contra que aparezcan en el futuro
  (excluye `*.spec.ts`: `theme-init-script.spec.ts` ejecuta a propósito el script generado
  con `new Function` para verificar su comportamiento).

## Vulnerabilidades corregidas

| # | Hallazgo | Severidad | Estado |
|---|---|---|---|
| 1 | `getThemeInitScript()` interpolaba `storageKey`/`defaultTheme`/`defaultColorScheme` con `JSON.stringify` directo en un `<script>` inline — no escapa `</script>`, permitiendo escapar del bloque e inyectar markup/script arbitrario en el `<head>` | Alta | ✅ Corregido (`toInlineJs()` + allowlist de valores + validación de lo leído de `localStorage`) |
| 2 | `cssVars` (escape hatch de `<bip-theme-provider>`) aceptaba cualquier clave en un `[style]` que Angular no sanitiza — una clave no-custom-property (`background-image`, etc.) con datos externos no confiables habilitaría una petición saliente arbitraria | Media | ✅ Corregido (`sanitizeCssVars()`, solo acepta `--algo`) |
| 3 | `BipImagePopover.handleFileChange()` leía cualquier archivo elegido (sin validar tipo ni tamaño) a un data URL — `accept="image/*"` es solo una pista para el picker, no una validación | Baja/Media | ✅ Corregido (`maxImageSize` + validación de `file.type`, output `rejectedImage`) |
| 4 | `pr-validation.yml` interpolaba `github.head_ref`/`base_ref` directo en un script de `run` — un nombre de rama con `$(...)` se ejecutaría como parte del script generado | Media (CI) | ✅ Corregido (vía `env:`) |
| 5 | `pr-validation.yml` sin `permissions:` explícito | Baja | ✅ Corregido (`contents: read`) |
| 6 | `pnpm audit`: `piscina` <5.3.2 (crítica, RCE) y `uuid` <11.1.1 (moderada), ambas transitivas del toolchain de build, no del paquete publicado | Crítica/Moderada (dev-only) | ✅ Corregido (`pnpm.overrides`) |

**`pnpm audit` final: 0 vulnerabilidades.**

## Hallazgos aceptados (sin corregir, con motivo)

| Hallazgo | Motivo |
|---|---|
| `EventEmitter` en `core/src/theme/theme-base.ts` en vez de `output()` | Implementa el contrato de CDK `Directionality.change`, que el CDK tipa como `EventEmitter`/`Observable` — no es un patrón pre-signal propio, es la superficie que exige extender esa clase. |
| `@ViewChild`/`@ViewChild` decorator (13 archivos: dropdown-menu, dropdown-submenu, calendar, note-popover, image-popover, tooth-detail, date-range-picker, date-picker, time-picker, multi-select, drawer-panel, popover-content, modal) en vez de `viewChild()`/`viewChild.required()` | Cosmético — ambos son APIs soportadas y correctas en Angular 21; es un rename mecánico sin impacto funcional. Se migrará en una pasada dedicada (`feature/deps-viewchild-signals` o similar) para no mezclar un refactor de estilo de ~13 archivos con los fixes de este bloque. |
| Efecto `explicitError` repetido en 13 controles de formulario (`this.explicitError.set(this.error() ? this.errorMessage() || 'error' : null)`) | Correcto tal como está; centralizarlo en `BipFormControlBase` como `computed()` es una simplificación válida pero de bajo riesgo/bajo beneficio inmediato — queda para la misma pasada de limpieza de Angular 21 que el punto anterior. |
| Algunos `effect()` que solo copian un input a un signal (candidatos a `linkedSignal()`): `sidebar-submenu:50`, `time-picker:159`, `number-input:167`, `data-table:207`, `toast-region:80` | Mismo criterio — correctos, candidatos a una limpieza de estilo futura, no bugs. |
| `data-table.component.ts:215`: el effect de `selectionChange` emite una vez en init con selección vacía | Comportamiento ya cubierto por los tests existentes de `DataTable` (emite `[]` al montar, que es el estado real); no se tocó para no cambiar el contrato observado por los specs portados del Bloque 9 sin una decisión explícita de producto. |
| URLs de imagen de consumidor (`avatar`, `card-media`, `odontogram` imágenes) cargan cualquier URL que se les pase | Es responsabilidad del consumidor de la librería, igual que `<img src>` en HTML plano — no hay sink de la librería que lo agrave (property binding, sanitizado por Angular). |

## Verificación

`pnpm lint && pnpm typecheck && pnpm test && pnpm build` en verde (1082 tests), incluidos los
3 guards nuevos (`entry-boundaries`, `no-direct-overlay`, `no-unsafe-sinks`) y los specs de
regresión de cada bug/fix de seguridad. `pnpm audit` en 0 vulnerabilidades.
