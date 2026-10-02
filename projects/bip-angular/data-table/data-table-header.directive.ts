import { Directive, TemplateRef, inject, input } from '@angular/core';

/** Marca un `<ng-template bipHeader="key">` proyectado como el encabezado custom de esa columna. */
@Directive({ selector: 'ng-template[bipHeader]' })
export class BipDataTableHeader {
  readonly key = input.required<string>({ alias: 'bipHeader' });
  readonly templateRef = inject(TemplateRef<void>);
}
