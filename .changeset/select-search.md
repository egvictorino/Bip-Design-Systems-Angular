---
'@bip-design-systems/angular': minor
---

`search` en `BipSelect` y `BipMultiSelect`. En `BipSelect` (`search`, default `false`) el campo
pasa a ser un combobox editable: se escribe en el propio campo y la lista se filtra, sin otro
input aparte. En `BipMultiSelect` (`search`, default `true`) permite ocultar el buscador del
panel con `search="false"`. Nuevo helper `matchesSearch()`/`foldSearchText()` en `core/utils`,
y llaves i18n `select.options`/`select.noResults`.
