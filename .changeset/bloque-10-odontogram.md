---
'@bip-design-systems/angular': minor
---

Odontogram (Bloque 10): `BipOdontogram` (cuadrícula FDI permanente de 32 piezas o primaria de
20, `[(value)]` como `model()` en vez de `value`+`onChange` controlado/no controlado de la
referencia React), `BipToothSvg` (SVG de 5 superficies por diente, reutilizado sin interacción
en la cuadrícula y de forma interactiva en el panel de detalle), `BipToothDetail` (toolbar de
condiciones, acciones de nota/imágenes) y `BipNotePopover`/`BipImagePopover` (auto-contenidos,
vía `BipOverlay`, con `cdkTrapFocus` y backdrop propio). Dominio dental completo: 9 condiciones,
5 superficies, 3 tipos de imagen.
