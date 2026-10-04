---
'@bip-design-systems/angular': patch
---

`BipDatePicker` y `BipDateRangePicker`: el botón de limpiar ya no está anidado dentro del trigger
(`<span role="button">` en un `<button>`, regla `nested-interactive` de axe). Ahora es un `<button>`
nativo hermano del trigger, con Enter/Espacio nativos; al limpiar, el foco vuelve al trigger. El
aspecto no cambia.
