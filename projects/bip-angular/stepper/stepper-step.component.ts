import { ChangeDetectionStrategy, Component, booleanAttribute, computed, inject, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { BipIdGenerator } from '@bip-design-systems/angular/core';
import { BIP_STEPPER_CONTEXT } from './stepper-context';

export type BipStepperStepVariant = 'danger' | 'success' | 'warning' | 'loading';

type BipStepperStepIconState = 'loading' | 'error' | 'warning' | 'success' | 'number';

/**
 * Un `variant` de estado explícito (`danger`/`success`/`warning`/`loading`) desplaza por
 * completo al indicador activo/completado — prioridad `loading > error > warning > success >
 * completado > número`, igual que la referencia React. El paso activo se renderiza como un
 * `<div aria-current="step">` no interactivo (no es un `<button>`, no se puede enfocar ni
 * hacer clic en sí mismo); los demás son `<button>` reales. Las flechas sobre un paso NO
 * activo saltan el valor activo en ±1 directamente (no es roving focus/FocusKeyManager como
 * Tabs — es fiel 1:1 a `handleKeyDown` de React).
 */
@Component({
  selector: 'bip-stepper-step',
  imports: [NgTemplateOutlet],
  templateUrl: './stepper-step.component.html',
  styleUrl: './stepper-step.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'bip-stepper-step',
    '[class]': 'hostClasses()',
    role: 'listitem',
  },
})
export class BipStepperStep {
  protected readonly context = (() => {
    const ctx = inject(BIP_STEPPER_CONTEXT, { optional: true });
    if (!ctx) {
      throw new Error('<bip-stepper-step> debe usarse dentro de <bip-stepper>');
    }
    return ctx;
  })();

  readonly value = input.required<number>();
  readonly label = input.required<string>();
  readonly description = input<string | undefined>(undefined);
  readonly variant = input<BipStepperStepVariant | undefined>(undefined);
  readonly disabled = input(false, { transform: booleanAttribute });

  private readonly generatedDescId = inject(BipIdGenerator).next('bip-stepper-step-desc');
  protected readonly descId = computed(() => (this.description() ? this.generatedDescId : null));

  protected readonly hasStatus = computed(() => this.variant() !== undefined);
  protected readonly isActive = computed(() => !this.hasStatus() && this.value() === this.context.activeValue());
  protected readonly isCompleted = computed(() => !this.hasStatus() && this.value() < this.context.activeValue());
  protected readonly isLast = computed(() => this.value() === this.context.totalSteps() - 1);

  protected readonly iconState = computed<BipStepperStepIconState>(() => {
    const variant = this.variant();
    if (variant === 'loading') return 'loading';
    if (variant === 'danger') return 'error';
    if (variant === 'warning') return 'warning';
    if (variant === 'success' || this.isCompleted()) return 'success';
    return 'number';
  });

  protected readonly hostClasses = computed(() => {
    const classes: string[] = [
      `bip-stepper-step--${this.context.variant()}`,
      `bip-stepper-step--${this.context.size()}`,
    ];
    if (this.context.orientation() === 'vertical') classes.push('bip-stepper-step--vertical');
    if (this.isActive()) classes.push('bip-stepper-step--active');
    if (this.isCompleted()) classes.push('bip-stepper-step--completed');
    if (this.hasStatus()) classes.push(`bip-stepper-step--${this.variant()}`);
    if (this.isLast()) classes.push('bip-stepper-step--last');
    return classes.join(' ');
  });

  protected activate(): void {
    if (this.disabled() || this.isActive()) return;
    this.context.setValue(this.value());
  }

  protected onKeydown(event: KeyboardEvent): void {
    const isVertical = this.context.orientation() === 'vertical';
    const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight';
    const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft';
    const value = this.value();
    const totalSteps = this.context.totalSteps();

    if (event.key === nextKey && value < totalSteps - 1) {
      event.preventDefault();
      this.context.setValue(value + 1);
    } else if (event.key === prevKey && value > 0) {
      event.preventDefault();
      this.context.setValue(value - 1);
    }
  }
}
