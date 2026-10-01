---
'@bip-design-systems/angular': minor
---

Formularios básicos (Bloque 5): 13 componentes, todos con `ControlValueAccessor` (probados con
`FormControl`, `ngModel` y `[(value)]`). `BipButton` (`button[bipButton], a[bipButton]`,
variantes/tamaños/loading/fullWidth; en `<a>` el `disabled` se emula con
`aria-disabled`+`tabindex=-1`+`pointer-events:none`, ya que los anchors no tienen `disabled`
nativo). `BipInput` (`variant`/`size`/`type` con toggle de contraseña, `clearable`, icon slots
proyectados). `BipTextarea` (mismo patrón que `BipInput`, `resize`, `autoGrow`, contador de
caracteres). `BipCheckbox` + `BipCheckboxGroup` (`<fieldset>` puramente contextual — `size`/
`disabled`/`error` cascadean vía `inject(BipCheckboxGroup, { optional: true })`, cada checkbox
mantiene su propio valor booleano, igual que la referencia React; `indeterminate` seteado como
propiedad DOM vía `viewChild`). `BipRadio` + `BipRadioGroup` (a diferencia de Checkbox, el
grupo SÍ es `ControlValueAccessor` — el valor seleccionado vive en el grupo, no en cada radio;
mismo `name` nativo compartido para exclusividad + flechas de teclado gratis del navegador;
`BipRadio` no lleva `aria-invalid` por diseño y lanza si se usa fuera de `<bip-radio-group>`).
`BipToggle` (`role="switch"`, thumb con `--rtl-x`). `BipSelect` (`<select>` nativo, no un
listbox custom — opciones/grupos vía inputs, `placeholder` como `<option disabled>` real).
`BipNumberInput` (`role="spinbutton"`, botones +/- con `tabindex=-1`, `min`/`max`/`step`/
`decimals`, prefix/suffix de texto). `BipSearchInput` (`role="search"`, outputs `searched`
debounced/`searchOnEnter` y `cleared` — renombrados desde `search`/`clear` de la referencia
React porque `@angular-eslint/no-output-native` prohíbe nombrar un output igual que un evento
DOM). `BipSlider` (`<input type="range">` nativo). `BipFileUpload` (`<label>` como zona de
drop + disparador del `<input type="file">` oculto con el patrón clip-rect de
`BipVisuallyHidden`; `multiple`/`accept`/`maxSize`/`maxFiles` con rechazo vía output
`rejected: BipRejectedFile[]`; `loading` con `BipSpinner` + `aria-busy`).
