import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import type { BipTooltipPosition, BipTooltipVariant } from './tooltip.types';

const POSITION_CLASS: Record<BipTooltipPosition, string> = {
  top: 'bip-tooltip--top',
  bottom: 'bip-tooltip--bottom',
  left: 'bip-tooltip--left',
  right: 'bip-tooltip--right',
};

const VARIANT_CLASS: Record<BipTooltipVariant, string> = {
  default: '',
  light: 'bip-tooltip--light',
  info: 'bip-tooltip--info',
  success: 'bip-tooltip--success',
  warning: 'bip-tooltip--warning',
  error: 'bip-tooltip--error',
};

/**
 * Burbuja interna, instanciada por `BipTooltip` vía `ComponentPortal` + `BipOverlay` — el
 * posicionamiento absoluto (x/y respecto al trigger) lo resuelve el `FlexibleConnectedPositionStrategy`
 * del CDK, no CSS; este componente solo aporta el look (color por variant, flecha) y el fade de
 * entrada. Sus inputs se actualizan desde la directiva vía `ComponentRef.setInput()`.
 */
@Component({
  selector: 'bip-tooltip-panel',
  standalone: true,
  template: `
    <span
      [id]="tooltipId()"
      role="tooltip"
      class="bip-tooltip"
      [class]="[positionClass(), variantClass()]"
      [class.bip-tooltip--visible]="visible()"
    >
      {{ content() }}
      <span aria-hidden="true" class="bip-tooltip-arrow"></span>
    </span>
  `,
  styleUrl: './tooltip-panel.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BipTooltipPanel {
  readonly content = input('');
  readonly variant = input<BipTooltipVariant>('default');
  readonly position = input<BipTooltipPosition>('top');
  readonly tooltipId = input('');

  protected readonly visible = signal(false);
  protected readonly positionClass = computed(() => POSITION_CLASS[this.position()]);
  protected readonly variantClass = computed(() => VARIANT_CLASS[this.variant()]);

  show(): void {
    requestAnimationFrame(() => this.visible.set(true));
  }
}
