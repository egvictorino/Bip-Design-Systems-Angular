---
'@bip-design-systems/angular': minor
---

Selección avanzada y fechas (Bloque 8): 5 componentes. `BipMultiSelect` (combobox
multiselección con búsqueda, chips con overflow, agrupación, "Seleccionar todo"; foco real
movido entre `<li role="option">`, sin `aria-activedescendant`, igual que la referencia).
`BipDatePicker` y `BipDateRangePicker` sobre una nueva cuadrícula compartida
`BipCalendarGrid` (`core`, unifica `CalendarGrid`/`RangeCalendarGrid` de la referencia React,
casi idénticas): drill-down días→meses→años, navegación de teclado sin wrap (←→↑↓, Home/End,
PageUp/PageDown), roving focus vía signals. `BipDateRangePicker` replica la máquina de
estados de selección exacta de la referencia (primer click fija `from`, segundo
completa/intercambia/limpia) con preview en vivo del rango al hacer hover. `BipTimePicker`
(columnas de horas/minutos con patrón `aria-activedescendant`, columna AM/PM, modo texto,
auto-ajuste a `minTime`/`maxTime`; nueva clave `timePicker.now` — la referencia React
hardcodea "Ahora"). `BipCalendar` (4 vistas controladas mes/semana/día/agenda, selección de
rango por arrastre en vista mes con popover de confirmación vía `BipOverlay`, TimeGrid
compartido semana/día con columnas por doctor, filtros de estado en agenda). Helpers de
fechas puros portados a `core/utils` (`isSameDay`, `addDays`, `getDaysInMonth`,
`getMondayOffset`, `monthIndex`, `dateKey`), sin librerías de fechas externas.
