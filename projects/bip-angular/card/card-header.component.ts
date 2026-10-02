import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'bip-card-header',
  template: `<ng-content />`,
  styleUrl: './card-header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'bip-card-header' },
})
export class BipCardHeader {}
