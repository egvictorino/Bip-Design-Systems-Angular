import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'bip-sidebar-header',
  template: `<ng-content />`,
  styleUrl: './sidebar-header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'bip-sidebar-header' },
})
export class BipSidebarHeader {}
