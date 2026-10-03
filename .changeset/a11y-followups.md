---
'@bip-design-systems/angular': patch
---

`BipOdontogram`: el diente interactivo del detalle se expone como `role="group"` (antes `img` con
superficies `button` anidadas: `nested-interactive`); en la cuadrícula no cambia. `BipButton`
`bare`/`soul`: en dark, hover y press ya no quedan más oscuros que el reposo (tokens nuevos
`--color-primary-text-hover`/`--color-primary-text-press`); en light no cambia.
