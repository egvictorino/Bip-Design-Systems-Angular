import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Puerto de `<VisuallyHidden>` (React) — contenido accesible a lectores de pantalla pero
 * recortado visualmente. Vive en `core/a11y` (no como secondary entry propio del Bloque 4)
 * porque otras primitivas transversales lo consumen antes de que ese bloque exista.
 */
@Component({
  selector: 'bip-visually-hidden',
  template: `<ng-content />`,
  styleUrl: './visually-hidden.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BipVisuallyHidden {}
