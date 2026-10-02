import type { ElementRef, Signal } from '@angular/core';
import { InjectionToken } from '@angular/core';

/**
 * Contrato que trigger/menu/item necesitan de su `<bip-dropdown>` ancestro — token en vez de
 * la clase directa para evitar imports circulares (mismo patrón que Modal/Popover).
 */
export interface BipDropdownContext {
  readonly isOpen: Signal<boolean>;
  readonly menuId: string;
  readonly triggerId: string;
  readonly triggerElementRef: ElementRef<HTMLElement> | null;
  toggle(): void;
  close(): void;
  registerTrigger(elementRef: ElementRef<HTMLElement>): void;
}

export const BIP_DROPDOWN_CONTEXT = new InjectionToken<BipDropdownContext>('BIP_DROPDOWN_CONTEXT');
