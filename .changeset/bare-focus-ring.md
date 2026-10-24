---
'@bip-design-systems/angular': patch
---

Variantes `bare` de input, select, textarea, number-input y multi-select: el foco de teclado usa el
anillo completo (`var(--focus-ring)`), en `--color-danger` con error. Antes solo cambiaba el tono
del subrayado (1.37:1) y con error no cambiaba nada. `BipMultiSelect` con error pinta también en
danger el anillo de las variantes outlined y filled, como el resto de campos.
