---
'@bip-design-systems/angular': patch
---

Contraste AA del hover/press de primary en dark: `--color-primary-hover` y `--color-primary-press`
oscurecen en vez de aclarar (el texto blanco sobre ellos pasa de 3.56:1 y 2.77:1 a 6.05:1 y
7.89:1). Los bordes y el foco de marca en hover usan el nuevo `--color-edge-primary-hover` (sin
cambio visual). Light no cambia.
