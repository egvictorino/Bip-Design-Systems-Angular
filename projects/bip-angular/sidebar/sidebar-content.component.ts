import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { injectBipLocale } from '@bip-design-systems/angular/core';
import { BIP_SIDEBAR_CONTEXT } from './sidebar-context';

/**
 * `role="navigation"` propio — distinto del `<bip-sidebar>` que lo contiene (también
 * `role="navigation"`), igual que la referencia React (dos landmarks: el aside y su nav
 * interno).
 */
@Component({
  selector: 'bip-sidebar-content',
  standalone: true,
  template: `<ng-content />`,
  styleUrl: './sidebar-content.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'bip-sidebar-content',
    role: 'navigation',
    '[attr.aria-label]': 'locale().sidebar.navLandmark',
  },
})
export class BipSidebarContent {
  protected readonly locale = injectBipLocale();

  constructor() {
    if (!inject(BIP_SIDEBAR_CONTEXT, { optional: true })) {
      throw new Error('<bip-sidebar-content> debe usarse dentro de <bip-sidebar>');
    }
  }
}
