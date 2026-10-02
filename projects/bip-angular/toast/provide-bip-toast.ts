import { InjectionToken, type Provider } from '@angular/core';
import type { BipToastPosition } from './toast.types';

export interface BipToastProviderConfig {
  /** Máximo de toasts visibles simultáneamente. Default: 3. */
  max?: number;
  /** Posición del stack en pantalla. Default: 'top-right'. */
  position?: BipToastPosition;
}

export interface BipResolvedToastConfig {
  max: number;
  position: BipToastPosition;
}

export const BIP_TOAST_CONFIG = new InjectionToken<BipResolvedToastConfig>('BIP_TOAST_CONFIG', {
  providedIn: 'root',
  factory: (): BipResolvedToastConfig => ({ max: 3, position: 'top-right' }),
});

/** `providers: [provideBipToast({ position: 'bottom-right' })]` a nivel app (o de un subárbol). */
export function provideBipToast(config: BipToastProviderConfig): Provider {
  return {
    provide: BIP_TOAST_CONFIG,
    useValue: { max: config.max ?? 3, position: config.position ?? 'top-right' },
  };
}
