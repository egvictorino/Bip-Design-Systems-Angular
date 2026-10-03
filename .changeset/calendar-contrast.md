---
'@bip-design-systems/angular': patch
---

`BipCalendar`: contraste AA en la vista mes (fechas de otro mes dentro de un rango, y el día de hoy
en otro mes) y en la agenda (filtros y badges de estado, filtro inactivo y evento cancelado ya no
usan `opacity`). El hover de los botones de vista ya no pisa al activo. En la cuadrícula del
DatePicker, el hover de un día seleccionado de otro mes conserva el texto de marca.
