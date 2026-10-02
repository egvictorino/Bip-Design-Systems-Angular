import { ChangeDetectionStrategy, Component, computed, contentChildren, input, model } from '@angular/core';
import type { BipSize } from '@bip-design-systems/angular/core';
import { injectBipLocale } from '@bip-design-systems/angular/core';
import { BIP_STEPPER_CONTEXT, type BipStepperContext } from './stepper-context';
import { BipStepperStep } from './stepper-step.component';

export type BipStepperVariant = 'circle' | 'dot';
export type BipStepperOrientation = 'horizontal' | 'vertical';

/**
 * Totalmente controlado (sin modelo no-controlado, como la referencia React: `value`/`onChange`
 * son obligatorios) — `value` es un `model.required()` para seguir pudiendo usar `[(value)]`.
 * `totalSteps` cuenta los `<bip-stepper-step>` proyectados (puerto de `React.Children.count()`).
 */
@Component({
  selector: 'bip-stepper',
  template: `<ng-content />`,
  styleUrl: './stepper.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: BIP_STEPPER_CONTEXT, useExisting: BipStepper }],
  host: {
    class: 'bip-stepper',
    '[class.bip-stepper--vertical]': "orientation() === 'vertical'",
    role: 'list',
    '[attr.aria-label]': 'locale().stepper.nav',
  },
})
export class BipStepper implements BipStepperContext {
  protected readonly locale = injectBipLocale();

  readonly value = model.required<number>();
  readonly activeValue = this.value;

  readonly variant = input<BipStepperVariant>('circle');
  readonly size = input<BipSize>('md');
  readonly orientation = input<BipStepperOrientation>('horizontal');

  private readonly steps = contentChildren(BipStepperStep);
  readonly totalSteps = computed(() => this.steps().length);

  setValue(value: number): void {
    this.value.set(value);
  }
}
