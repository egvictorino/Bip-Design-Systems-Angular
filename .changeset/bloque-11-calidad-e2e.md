---
'@bip-design-systems/angular': minor
---

Calidad end-to-end (Bloque 11): regresión visual real contra Docker (`visual/component-matrix.spec.ts`,
`visual/theme-matrix.spec.ts`, 78 baselines Linux) y a11y en navegador real con axe-core y
`color-contrast` activado (`visual/a11y-browser.spec.ts`, 100 combinaciones componente×esquema,
0 violaciones) — `pnpm test:visual:docker`. Smoke test del tarball publicado con SSR real de un
consumidor Angular independiente (`e2e/consumer-app`, fuera del workspace) — `pnpm test:e2e`.
`publint`/`@arethetypeswrong/cli`/`size-limit` por entry point — `pnpm lint:package` / `pnpm size`.

Corregidos en el camino, todos verificados en navegador real por primera vez:

- **Crítico:** 44 componentes nunca aplicaban su propio CSS de host bajo
  `ViewEncapsulation.Emulated` (selector plano en vez de `:host`/`:host(.variant)`) y Storybook
  nunca cargó `bip.css` — ninguna story de los Bloques 4-10 se había visto con estilos reales
  hasta este bloque.
- 6 violaciones reales de a11y: contraste en Calendar (texto de "otro mes" y chips de status) y
  en una story de DataTable; nombre accesible faltante en MultiSelect; estructura `<ul>/<li>`
  inválida entre componente y wrapper en Navbar y Sidebar.
- Seguridad: escape de `getThemeInitScript()` (permitía escapar de `</script>`), `cssVars` sin
  sanitizar en un `[style]`, validación de tipo/tamaño de archivo en `odontogram/ImagePopover`,
  inyección de script en `pr-validation.yml` vía `head_ref` interpolado, 2 vulnerabilidades de
  `pnpm audit`.
- Arquitectura: `BipOverlay` ahora reexpone `position()`/`scrollStrategies` (8 componentes
  dejaron de inyectar `Overlay` del CDK directo), `hasError()` de formularios reacciona a
  `markAllAsTouched()` sin blur propio, 2 crashes de SSR (Calendar, Modal/Drawer), overlays sin
  `dispose()` al destruirse abiertos, deduplicación de `startOfDay`/`isSameDay`/`formatDate`
  entre calendar/date-pickers.
- Renombres (sin alias — librería en `0.0.0`, sin publicar): `BipToastItemComponent` →
  `BipToastItem`, `BipThemeDirective` → `BipTheme`, `BipClickOutsideDirective` →
  `BipClickOutside`, `BipBreadcrumbSeparatorDirective` → `BipBreadcrumbSeparator`,
  `BipDataTableHeaderDirective` → `BipDataTableHeader`, `BipDataTableCellDirective` →
  `BipDataTableCell`.

`package.json#exports` agrega `"./styles/*"` y `sideEffects` pasa de `false` a `["**/*.css"]` —
necesario para que `"@bip-design-systems/angular/styles/bip.css"` resuelva en el `angular.json`
de un consumidor (antes solo funcionaba como ruta relativa a `node_modules`, nunca como
especificador de paquete).

Hallazgos completos de la revisión de arquitectura y de seguridad del bloque, con su estado
(corregido o aceptado con motivo): `docs/reviews/bloque-11.md`.
