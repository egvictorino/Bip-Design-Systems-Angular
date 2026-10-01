---
'@bip-design-systems/angular': minor
---

Datos (Bloque 9): `BipTable` + subpartes (`BipTableHead`, `BipTableBody`, `BipTableRow`,
`BipTableHeader`, `BipTableCell`, `BipTableEmpty`) y `BipDataTable` (búsqueda, ordenamiento,
selección con acciones masivas, visibilidad de columnas, paginación, modo `serverSide`;
columnas con `<ng-template bipCell="key">`/`<ng-template bipHeader="key">` proyectados).
Añadido `ariaLabel` a `BipCheckbox`. Fix de accesibilidad en `BipTableHeader`: un binding de
host que evaluaba a `false` cancelaba silenciosamente el click en controles proyectados dentro
de encabezados no ordenables.
