import { ChangeDetectionStrategy, Component, booleanAttribute, inject, input, model } from '@angular/core';
import type { BipSize } from '@bip-design-systems/angular/core';
import { BipIdGenerator } from '@bip-design-systems/angular/core';
import { BIP_TABS_CONTEXT, type BipTabsContext } from './tabs-context';

export type BipTabsVariant = 'line' | 'pill' | 'boxed';
export type BipTabsOrientation = 'horizontal' | 'vertical';

/**
 * Compound component (solo contexto, sin markup propio más que `<ng-content>`) — mismo
 * esqueleto que `BipDropdown`. `value` es `model()`: sin `value`/`defaultValue` separados
 * como en React, Angular ya resuelve controlado/no-controlado con un solo `model()`.
 */
@Component({
  selector: 'bip-tabs',
  template: `<ng-content />`,
  styleUrl: './tabs.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: BIP_TABS_CONTEXT, useExisting: BipTabs }],
  host: {
    class: 'bip-tabs',
    '[class.bip-tabs--vertical]': "orientation() === 'vertical'",
  },
})
export class BipTabs implements BipTabsContext {
  readonly value = model('');
  readonly activeValue = this.value;

  readonly variant = input<BipTabsVariant>('line');
  readonly size = input<BipSize>('md');
  readonly orientation = input<BipTabsOrientation>('horizontal');
  readonly animated = input(false, { transform: booleanAttribute });

  readonly instanceId = inject(BipIdGenerator).next('bip-tabs');

  setActive(value: string): void {
    this.value.set(value);
  }
}
