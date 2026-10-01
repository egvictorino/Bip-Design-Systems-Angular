import type { Signal } from '@angular/core';
import { InjectionToken } from '@angular/core';
import type { BipNavbarVariant } from './navbar.component';

/**
 * Contrato que `<bip-navbar-brand>`/`<bip-navbar-item>` necesitan de su `<bip-navbar>`
 * ancestro — token en vez de la clase directa (mismo motivo que `dropdown-context.ts`).
 */
export interface BipNavbarContext {
  readonly isMobileOpen: Signal<boolean>;
  readonly variant: Signal<BipNavbarVariant>;
  closeMobile(): void;
}

export const BIP_NAVBAR_CONTEXT = new InjectionToken<BipNavbarContext>('BIP_NAVBAR_CONTEXT');
