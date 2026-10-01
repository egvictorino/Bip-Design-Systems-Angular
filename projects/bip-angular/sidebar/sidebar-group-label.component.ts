import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BIP_SIDEBAR_CONTEXT } from './sidebar-context';

/** No renderiza nada cuando el sidebar está colapsado — igual que `BipSidebarBrand`. */
@Component({
  selector: 'bip-sidebar-group-label',
  standalone: true,
  template: `
    @if (!context.isCollapsed()) {
      <p class="bip-sidebar-group-label"><ng-content /></p>
    }
  `,
  styleUrl: './sidebar-group-label.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BipSidebarGroupLabel {
  protected readonly context = (() => {
    const ctx = inject(BIP_SIDEBAR_CONTEXT, { optional: true });
    if (!ctx) {
      throw new Error('<bip-sidebar-group-label> debe usarse dentro de <bip-sidebar>');
    }
    return ctx;
  })();
}
