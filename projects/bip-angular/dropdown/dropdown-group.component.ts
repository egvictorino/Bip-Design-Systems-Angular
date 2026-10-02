import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { BipIdGenerator } from '@bip-design-systems/angular/core';

@Component({
  selector: 'bip-dropdown-group',
  template: `
    <div class="bip-dropdown-group-label" [id]="labelId">{{ label() }}</div>
    <ng-content />
  `,
  styleUrl: './dropdown-group.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'bip-dropdown-group',
    '[attr.role]': '"group"',
    '[attr.aria-labelledby]': 'labelId',
  },
})
export class BipDropdownGroup {
  readonly label = input.required<string>();
  protected readonly labelId = inject(BipIdGenerator).next('bip-dropdown-group-label');
}
