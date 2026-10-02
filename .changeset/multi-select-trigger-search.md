---
'@bip-design-systems/angular': minor
---

`BipMultiSelect`: input `searchPlacement` (`'panel'` por defecto | `'trigger'`). Con `'trigger'` se
escribe directamente junto a los chips ("tags input"): el foco queda en un `<input role="combobox">`
con `aria-activedescendant`, ↓↑ Enter Escape, Backspace sobre el campo vacío quita el último chip.
Corrige que, con `externalFilter`, los chips elegidos desaparecían cuando el consumidor reemplazaba
`options()`; y que el estado de carga se montaba junto con su texto (ahora la región `aria-live`
está siempre montada).
