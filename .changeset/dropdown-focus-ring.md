---
'@bip-design-systems/angular': patch
---

`BipDropdown`: los items se pintaban como botones nativos (sus estilos no coincidían con el elemento
host bajo `Emulated`) y su foco de teclado solo cambiaba el fondo (1.24:1). Ahora llevan sus
estilos y un anillo de foco inset; el buscador usa `var(--focus-ring)`.
