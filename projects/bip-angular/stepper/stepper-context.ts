import type { Signal } from '@angular/core';
import { InjectionToken } from '@angular/core';
import type { BipSize } from '@bip-design-systems/angular/core';
import type { BipStepperOrientation, BipStepperVariant } from './stepper.component';

/**
 * Contrato que `<bip-stepper-step>` necesita de su `<bip-stepper>` ancestro — token en vez de
 * la clase directa (mismo motivo que `dropdown-context.ts`). `totalSteps` se deriva contando
 * `contentChildren(BipStepperStep)` en la raíz (puerto de `React.Children.count()`).
 */
export interface BipStepperContext {
  readonly activeValue: Signal<number>;
  readonly variant: Signal<BipStepperVariant>;
  readonly size: Signal<BipSize>;
  readonly orientation: Signal<BipStepperOrientation>;
  readonly totalSteps: Signal<number>;
  setValue(value: number): void;
}

export const BIP_STEPPER_CONTEXT = new InjectionToken<BipStepperContext>('BIP_STEPPER_CONTEXT');
