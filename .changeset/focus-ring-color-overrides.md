---
'@bip-design-systems/angular': patch
---

El foco de teclado de los botones `danger` y de los estados de error (input, textarea, select,
search-input, number-input, checkbox, radio, toggle) ahora sale en `--color-danger`: los overrides
locales de `--focus-ring-color` no llegaban a `--focus-ring`. `base.css` lo resuelve en cada
elemento (`base.css`, que carga `bip.css`: quien importe hojas sueltas debe incluirlo). Un
`--focus-ring` completo declarado en un ancestro ya no se hereda; usa `--focus-ring-width`,
`--focus-ring-offset` o `--focus-ring-color`.
