import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { BIP_SIDEBAR_CONTEXT } from './sidebar-context';
import { BipSidebarGroupLabel } from './sidebar-group-label.component';

/**
 * `label` es un atajo de texto plano equivalente a proyectar un `<bip-sidebar-group-label>` —
 * ambas formas conviven (la referencia React también acepta un `label` directo en el grupo).
 */
@Component({
  selector: 'bip-sidebar-group',
  imports: [BipSidebarGroupLabel],
  template: `
    @if (label()) {
      <bip-sidebar-group-label>{{ label() }}</bip-sidebar-group-label>
    }
    <ul class="bip-sidebar-group-list"><ng-content /></ul>
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
