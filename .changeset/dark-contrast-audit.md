---
'@bip-design-systems/angular': patch
---

Contraste en dark: el texto que usaba `--color-primary` (3.3–4.0:1, bajo AA) pasa a
`--color-primary-text` en `BipButton` `bare`/`soul`, botones Hoy/Limpiar/Ahora de los pickers,
cabecera de "hoy" del `BipCalendar`, marcador activo de `BipStepper` y acción activa del detalle de
`BipOdontogram`. En `BipCalendar` (semana/día) los bloques de evento ignoraban el `--color-txt-on-*`
de su estado (blanco sobre amarillo/verde/gris, 1.5–2.3:1). En `BipMultiSelect` `filled` los chips
tenían el mismo fondo que el campo.
