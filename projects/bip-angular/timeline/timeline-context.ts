import type { Signal } from '@angular/core';
import { InjectionToken } from '@angular/core';
import type { BipTimelineOrientation } from './timeline.component';

/**
 * Único dato que `<bip-timeline-item>` necesita de su `<bip-timeline>` ancestro: la
 * orientación, que decide si el item se dibuja en columna (vertical) o en fila (horizontal).
 * Token en vez de la clase directa, mismo motivo que `dropdown-context.ts` (evita imports
 * circulares).
 */
export interface BipTimelineContext {
  readonly orientation: Signal<BipTimelineOrientation>;
}

export const BIP_TIMELINE_CONTEXT = new InjectionToken<BipTimelineContext>('BIP_TIMELINE_CONTEXT');
