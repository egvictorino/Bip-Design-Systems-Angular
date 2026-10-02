import type { Signal } from '@angular/core';
import { InjectionToken } from '@angular/core';
import type { BipSidebarVariant } from './sidebar.component';

/**
 * Contrato que todas las subpartes necesitan de su `<bip-sidebar>` ancestro — token en vez de
 * la clase directa (mismo motivo que `dropdown-context.ts`).
 */
export interface BipSidebarContext {
  readonly isCollapsed: Signal<boolean>;
  readonly isMobileOpen: Signal<boolean>;
  readonly variant: Signal<BipSidebarVariant>;
  readonly sidebarId: string;
  toggleCollapsed(): void;
  closeMobile(): void;
}

export const BIP_SIDEBAR_CONTEXT = new InjectionToken<BipSidebarContext>('BIP_SIDEBAR_CONTEXT');
