import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * `data-navbar-items-container` delimita el alcance de la navegación por flechas de
 * `<bip-navbar-item>` (no cruza hacia `<bip-navbar-actions>`).
 */
@Component({
  selector: 'bip-navbar-nav',
  template: `<ul class="bip-navbar-nav-list"><ng-content /></ul>`,
  styleUrl: './navbar-nav.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'bip-navbar-nav',
    'data-navbar-items-container': '',
  },
})
export class BipNavbarNav {}
