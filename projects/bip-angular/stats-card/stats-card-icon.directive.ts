import { Directive } from '@angular/core';

/**
 * Marca el elemento proyectado como el ícono de `<bip-stats-card>`
 * (`<svg bipStatsCardIcon>`). `<bip-stats-card>` lo detecta vía `contentChild()` para decidir
 * si renderiza el slot del ícono (con `display: none` cuando no hay ninguno) — equivalente al
 * `icon && (...)` condicional de la referencia React.
 */
@Directive({
  selector: '[bipStatsCardIcon]',
})
export class BipStatsCardIcon {}
