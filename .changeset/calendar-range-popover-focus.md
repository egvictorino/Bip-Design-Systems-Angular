---
'@bip-design-systems/angular': patch
---

`BipCalendar`: el popover de rango recibe el foco al abrir, lo atrapa (`cdkTrapFocus`) y lo devuelve
a la celda al cerrar; Escape ahora lo cierra.
