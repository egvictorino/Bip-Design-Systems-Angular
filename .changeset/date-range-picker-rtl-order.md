---
'@bip-design-systems/angular': patch
---

`BipDateRangePicker`: en un layout RTL el rango ya no se pinta invertido ("20/01/2026 – 15/01/2026"):
el valor se aísla con la dirección del idioma del locale. Nuevo `localeDirection()` en `core/utils`.
