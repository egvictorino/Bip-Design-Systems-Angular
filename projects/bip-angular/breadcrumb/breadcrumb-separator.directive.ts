import { Directive } from '@angular/core';

/**
 * Marca un `<ng-template bipBreadcrumbSeparator>` proyectado como separador custom — así
 * `contentChild()` en `BipBreadcrumb` puede distinguirlo de cualquier otro `<ng-template>` que
 * el consumidor proyecte dentro de `<bip-breadcrumb>`.
 */
@Directive({
  selector: 'ng-template[bipBreadcrumbSeparator]',
})
export class BipBreadcrumbSeparator {}
