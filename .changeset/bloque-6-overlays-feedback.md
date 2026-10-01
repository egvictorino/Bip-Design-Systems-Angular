---
'@bip-design-systems/angular': minor
---

Overlays y feedback (Bloque 6): 7 componentes, todos vía `BipOverlay` (nunca `Overlay`
directo). `BipModal` + `BipModalHeader`/`BipModalBody`/`BipModalFooter` (`BipOverlay.create()`
+ `TemplatePortal`, `cdkTrapFocus` con autocapture y restauración de foco, `closeOnBackdrop`/
`closeOnEscape` configurables, scroll lock). `BipConfirmDialog` (composición sobre `<bip-modal>`,
`closeOnBackdrop` fijo en `false`). `BipDrawerPanel` (`placement` físico left/right, slots
`[bipDrawerPanelHeaderActions]`/`[bipDrawerPanelFooter]`). `BipToast` (servicio
`providedIn: 'root'` + `provideBipToast()` opcional, stacking con peek/hover-expand, barra de
progreso, `duration: 0` persistente). `[bipTooltip]` (directiva de atributo, posiciona vía
`FlexibleConnectedPositionStrategy` del CDK; `position` físico, `align` lógico). `BipPopover` +
`BipPopoverTrigger`/`BipPopoverContent` (compound component, posiciona anclado al trigger,
cierra con Escape/clic fuera). `BipDropdown` + `BipDropdownTrigger`/`BipDropdownMenu`/
`BipDropdownItem`/`BipDropdownItemCheckbox`/`BipDropdownDivider`/`BipDropdownGroup`/
`BipDropdownSearch` (patrón WAI-ARIA Menu Button, navegación con `FocusKeyManager` del CDK).
`DropdownSubmenu` queda fuera de este bloque (follow-up explícito).
