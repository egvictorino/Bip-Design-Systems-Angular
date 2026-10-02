import { InjectionToken } from '@angular/core';

/**
 * Contrato mínimo que `<bip-modal-header>` necesita de su `<bip-modal>` ancestro. Un token
 * (en vez de inyectar la clase `BipModal` directamente) evita un import circular entre
 * `modal.component.ts` y `modal-header.component.ts` — `BipModal` se provee a sí mismo vía
 * `useExisting`, así que implementar esta interfaz le basta.
 */
export interface BipModalContext {
  readonly titleId: string;
  requestClose(): void;
}

export const BIP_MODAL_CONTEXT = new InjectionToken<BipModalContext>('BIP_MODAL_CONTEXT');
