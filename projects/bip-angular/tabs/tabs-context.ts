import type { Signal } from '@angular/core';
import { InjectionToken } from '@angular/core';
import type { BipSize } from '@bip-design-systems/angular/core';
import type { BipTabsOrientation, BipTabsVariant } from './tabs.component';

/**
 * Contrato que `<bip-tab-list>`/`button[bipTab]`/`<bip-tab-panel>` necesitan de su
 * `<bip-tabs>` ancestro — token en vez de la clase directa (mismo motivo que
 * `dropdown-context.ts`). `instanceId` deriva ids estables de tab/panel sin registrar nada
 * (ver `tab.component.ts`/`tab-panel.component.ts`: ambos calculan el mismo id a partir de
 * `instanceId` + `value`, nunca del label).
 */
export interface BipTabsContext {
  readonly activeValue: Signal<string>;
  readonly variant: Signal<BipTabsVariant>;
  readonly size: Signal<BipSize>;
  readonly orientation: Signal<BipTabsOrientation>;
  readonly animated: Signal<boolean>;
  readonly instanceId: string;
  setActive(value: string): void;
}

export const BIP_TABS_CONTEXT = new InjectionToken<BipTabsContext>('BIP_TABS_CONTEXT');
