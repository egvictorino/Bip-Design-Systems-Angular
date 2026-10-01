import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'bip-sidebar-footer',
  template: `<ng-content />`,
  styleUrl: './sidebar-footer.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'bip-sidebar-footer' },
})
export class BipSidebarFooter {}
