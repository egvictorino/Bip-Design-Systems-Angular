export type BipToastPosition =
  'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

export type BipToastVariant = 'info' | 'success' | 'warning' | 'danger';

export interface BipToastConfig {
  variant?: BipToastVariant;
  title?: string;
  message: string;
  /** Auto-dismiss en ms. `0` deshabilita el auto-dismiss (persiste hasta que el usuario lo cierra). Default: 5000. */
  duration?: number;
}

/** @internal — `BipToastConfig` + metadata que solo necesita el servicio/región, no el consumidor de `show()`. */
export interface BipToastItem extends BipToastConfig {
  readonly id: number;
  readonly exiting: boolean;
}
