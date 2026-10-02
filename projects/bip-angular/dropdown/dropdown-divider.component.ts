import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'bip-dropdown-divider',
  template: '',
  styleUrl: './dropdown-divider.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'bip-dropdown-divider',
    '[attr.role]': '"separator"',
    '[attr.aria-orientation]': '"horizontal"',
  },
})
export class BipDropdownDivider {}
