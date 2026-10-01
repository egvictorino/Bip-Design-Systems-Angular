import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'bip-navbar-actions',
  standalone: true,
  template: `<ng-content />`,
  styleUrl: './navbar-actions.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'bip-navbar-actions' },
})
export class BipNavbarActions {}
