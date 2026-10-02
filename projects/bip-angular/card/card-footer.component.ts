import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'bip-card-footer',
  template: `<ng-content />`,
  styleUrl: './card-footer.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'bip-card-footer' },
})
export class BipCardFooter {}
