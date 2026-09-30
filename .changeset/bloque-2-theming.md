---
'@bip-design-systems/angular': minor
---

Theming (Bloque 2): `<bip-theme-provider>` y `[bipTheme]` (theme/colorScheme/density/dir/
tokens/radius/focusRing/motion/spacing/cssVars), `provideBipTheme()`, `injectThemeControls()`,
`getThemeInitScript()`/`THEME_RESET_STYLE`, mapas de tokens (`TOKEN_VAR_MAP`,
`RADIUS_VAR_MAP`, `ON_TEXT_VAR_MAP`, `FOCUS_RING_VAR_MAP`, `MOTION_VAR_MAP`,
`SPACING_VAR_MAP`) y `resolveTokenVars()`/`resolveVarMap()` en `core/theme`; `BipOverlay` en
`core/overlay` como puente hacia `@angular/cdk/overlay` que hereda el theme del
`<bip-theme-provider>` más cercano al llamador; `@angular/cdk` agregado como dependencia de
workspace y peer dependency de la librería; stories `Foundations/Theming`.
