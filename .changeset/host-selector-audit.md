---
'@bip-design-systems/angular': patch
---

`BipText`, `BipCard`, `BipCardMedia`, `BipStatsCard`, `BipEmptyState`, `BipAlert`, `BipAvatar` y las
celdas y cabeceras de tabla: sus variantes nunca se aplicaban (selectores planos sobre su propio host
bajo `Emulated`). Ahora usan `:host(...)` y se ven con su diseño. Las clases por defecto le ganan a
una clase propia del consumidor en el host: usa los inputs del componente.
