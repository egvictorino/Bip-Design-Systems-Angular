import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'bip-card-body',
  template: `<ng-content />`,
  styleUrl: './card-body.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'bip-card-body' },
})
export class BipCardBody {}
