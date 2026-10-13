---
'@bip-design-systems/angular': patch
---

El anillo de foco (`--focus-ring`, `--focus-ring-color`) resuelve los colores con el esquema del
propio elemento: en un wrapper `data-color-scheme='dark'` ya no hereda el hueco y la banda de light.

Un override de `focusRing.width`/`offset`/`color` en el wrapper del ThemeProvider ahora también
afecta a `--focus-ring` (antes quedaba congelado en `:root`).
