---
'@bip-design-systems/angular': minor
---

`BipSelect`: búsqueda remota (`externalFilter`, `loading` y la salida `searchQuery`) y botón para
limpiar (`clearable`, solo con `search`). Con `externalFilter` la opción elegida conserva su label
aunque salga de `options()`. Nuevos helpers `firstEnabledIndex()`/`nextEnabledIndex()` en
`core/utils` y llaves i18n `select.loading`, `select.loadingText` y `select.clear`. Corrige el
padding del campo en RTL (el texto se montaba sobre el chevron).
