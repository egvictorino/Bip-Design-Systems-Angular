---
'@bip-design-systems/angular': patch
---

`BipSelect` y `BipMultiSelect`: correcciones tras revisar la búsqueda remota y el buscador en el
trigger. Select conserva el label elegido aunque el consumidor restaure `options()` de forma
síncrona, el Escape que limpia ya no cierra un Modal/Drawer contenedor y el botón limpiar mide
24×24. MultiSelect mantiene la opción activa tras Enter, Backspace quita el último chip real
(saltando deshabilitados) y, con `externalFilter`, los chips siguen el orden de `value()`; Enter
sobre los botones de chip vuelve a funcionar. En ambos, la región de carga vive fuera del overlay
y deshabilitar el control con el panel abierto lo cierra.
Además, el texto activo de `BipTabs`, `BipNavbar` y `BipSidebar` (y el label enfocado y la opción
elegida de `BipSelect`) usa `--color-primary-text`: en dark no alcanzaba contraste AA.
