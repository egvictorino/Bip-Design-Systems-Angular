---
'@bip-design-systems/angular': patch
---

`BipCalendar` (título semanal y hora de la agenda) y el selector de años de `BipDatePicker`/
`BipDateRangePicker`: los rangos "inicio – fin" se aíslan con la dirección del idioma, así que en un
layout RTL ya no se reordenan los extremos.
