import type { ElementRef, Signal } from '@angular/core';
import { InjectionToken } from '@angular/core';

/**
 * Contrato que `[bipPopoverTrigger]` y `<bip-popover-content>` necesitan de su `<bip-popover>`
 * ancestro. Un token (en vez de inyectar la clase `BipPopover` directamente) evita un import
 * circular entre los tres archivos — `BipPopover` se provee a sí mismo vía `useExisting`.
 */
export interface BipPopoverContext {
  readonly isOpen: Signal<boolean>;
  readonly contentId: string;
  readonly triggerId: string;
  /** Lo registra `[bipPopoverTrigger]` en su `ngOnInit` — `<bip-popover-content>` lo necesita para anclar el overlay. */
  readonly triggerElementRef: ElementRef<HTMLElement> | null;
  toggle(): void;
  close(): void;
  registerTrigger(elementRef: ElementRef<HTMLElement>): void;
}

export const BIP_POPOVER_CONTEXT = new InjectionToken<BipPopoverContext>('BIP_POPOVER_CONTEXT');
