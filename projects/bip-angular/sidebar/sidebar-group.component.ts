import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { BIP_SIDEBAR_CONTEXT } from './sidebar-context';
import { BipSidebarGroupLabel } from './sidebar-group-label.component';

/**
 * `label` es un atajo de texto plano equivalente a proyectar un `<bip-sidebar-group-label>` —
 * ambas formas conviven (la referencia React también acepta un `label` directo en el grupo).
 *
 * El contenedor de items es un `<div>` plano, sin `role="list"` ni `<ul>` real: a diferencia
 * de Navbar (una sola lista plana), un item de Sidebar puede vivir dentro de un
 * `<bip-sidebar-group>` o directo en `<bip-sidebar-content>` (ver `sidebar.stories.ts`), así
 * que no hay un único ancestro `role="list"` consistente al que apuntar — `role="listitem"`
 * sin un `role="list"` como padre inmediato es justamente otra violación de axe
 * (`aria-required-parent`). `<bip-sidebar-content>` ya aporta el landmark `role="navigation"`
 * (ver ese componente) que es suficiente para la semántica de navegación.
 */
@Component({
  selector: 'bip-sidebar-group',
  imports: [BipSidebarGroupLabel],
  template: `
    @if (label()) {
      <bip-sidebar-group-label>{{ label() }}</bip-sidebar-group-label>
    }
    <div class="bip-sidebar-group-list"><ng-content /></div>
  `,
  styleUrl: './sidebar-group.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'bip-sidebar-group' },
})
export class BipSidebarGroup {
  readonly label = input<string | undefined>(undefined);

  constructor() {
    if (!inject(BIP_SIDEBAR_CONTEXT, { optional: true })) {
      throw new Error('<bip-sidebar-group> debe usarse dentro de <bip-sidebar>');
    }
  }
}
