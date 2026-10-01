---
'@bip-design-systems/angular': minor
---

Navegación y disclosure (Bloque 7): 8 componentes. `BipTimeline` + `BipTimelineItem`
(presentacional, marcador decorativo). `BipBreadcrumb` (último item siempre texto no
interactivo con `aria-current="page"`, soporta `routerLink` además de `href`, separador
reemplazable vía `<ng-template bipBreadcrumbSeparator>`). `BipPagination` (totalmente
controlado, `getPageRange()` portado 1:1). `BipTabs` + `BipTabList`/`BipTab`/`BipTabPanel`
(contexto plano, `FocusKeyManager` para las flechas con activación manual — clic/Enter/Espacio
activa —, indicador animado posicionado con `inset-inline-start` según `Directionality`).
`BipAccordion` + `BipAccordionItem`/`BipAccordionTrigger`/`BipAccordionContent` (contexto
anidado, `value` cuya forma pública depende de `type` single/multiple, contenido siempre en el
DOM con transición de `grid-template-rows`). `BipStepper` + `BipStepperStep` (totalmente
controlado, un `variant` de estado explícito desplaza al indicador activo/completado, paso
activo no interactivo). `BipNavbar` + `BipNavbarBrand`/`BipNavbarNav`/`BipNavbarItem`/
`BipNavbarActions` (panel único proyectado una vez, cuyo layout cambia por CSS entre barra
horizontal y dropdown móvil — en vez de duplicar árboles como la referencia React —, `inert`
decidido vía `BreakpointObserver`). `BipSidebar` + 9 subpartes (ejes `open`/`collapsed`
independientes, drawer móvil con `cdkTrapFocus`, modo colapsado con tooltips, flechas con
clamp en los extremos vía `navigateSidebarItems()`). Nueva clave de locale
`sidebar.badgeCount()` (fix de un hardcodeo en español de la referencia React).
