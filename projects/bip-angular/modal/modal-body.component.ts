import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'bip-modal-body',
  standalone: true,
  template: `<ng-content />`,
  styleUrl: './modal-body.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'bip-modal-body' },
})
export class BipModalBody {}
