---
'@bip-design-systems/angular': patch
---

`BipDatePicker` y `BipDateRangePicker`: con el botón de limpiar como hermano del trigger, tabular
del trigger al botón ya no marca el control como touched antes de tiempo (ahora solo al salir del
wrapper completo), y pulsar la "×" con el panel abierto no lo cierra (igual que en la referencia React).
