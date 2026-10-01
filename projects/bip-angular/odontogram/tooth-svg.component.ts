import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { injectBipLocale } from '@bip-design-systems/angular/core';
import {
  LOWER_POINTS,
  SURFACES,
  TOOTH_SIZE,
  UPPER_POINTS,
  conditionFillClass,
  type BipToothSvgSize,
  type ToothData,
  type ToothSurface,
} from './odontogram.types';

/**
 * Representación visual de un diente — puerto de `ToothSVG` (React). Puramente presentacional:
 * no decide si es interactivo (eso lo decide el padre vía `interactive()`), solo pinta las 5
 * superficies como polígonos y emite `surfaceClick` cuando corresponde. Usado dos veces: sin
 * interacción en la cuadrícula principal de `<bip-odontogram>` (tamaño sm/md/lg) y de forma
 * interactiva en `<bip-tooth-detail>` (tamaño xl=120px).
 */
@Component({
  selector: 'bip-tooth-svg',
  standalone: true,
  template: `
    <svg
      viewBox="0 0 100 100"
      [attr.width]="toothSize()"
      [attr.height]="toothSize()"
      role="img"
      [attr.aria-label]="toothLabel()"
      class="bip-tooth-svg"
    >
      @for (s of surfaceStates(); track s.surface) {
        <polygon
          [attr.points]="s.points"
          [class]="s.fillClass"
          class="bip-tooth-surface"
          [class.bip-tooth-surface--interactive]="interactive()"
          stroke-width="2"
          [attr.aria-label]="surfaceLabel(s.surface)"
          [attr.role]="interactive() ? 'button' : 'graphics-symbol'"
          [attr.tabindex]="interactive() ? 0 : null"
          [attr.aria-pressed]="interactive() ? s.isActive : null"
          (click)="onSurfaceActivate(s.surface)"
          (keydown)="onSurfaceKeydown($event, s.surface)"
        />
      }

      @if (isMissing()) {
        <g aria-hidden="true">
          <line
            x1="20"
            y1="20"
            x2="80"
            y2="80"
            stroke-width="6"
            stroke-linecap="round"
            class="bip-tooth-missing-x"
          />
          <line
            x1="80"
            y1="20"
            x2="20"
            y2="80"
            stroke-width="6"
            stroke-linecap="round"
            class="bip-tooth-missing-x"
          />
        </g>
      }
    </svg>
  `,
  styleUrl: './tooth-svg.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BipToothSvg {
  readonly toothNumber = input.required<number>();
  readonly arch = input.required<'upper' | 'lower'>();
  readonly data = input.required<ToothData>();
  readonly size = input.required<BipToothSvgSize>();
  readonly interactive = input(false);

  readonly surfaceClick = output<ToothSurface>();

  private readonly locale = injectBipLocale();

  protected readonly toothSize = computed(() => TOOTH_SIZE[this.size()]);
  protected readonly isMissing = computed(() => this.data().condition === 'missing');

  protected readonly toothLabel = computed(() => {
    const locale = this.locale();
    const name = locale.odontogram.toothNames[this.toothNumber()] ?? '';
    return locale.odontogram.toothLabel(this.toothNumber(), this.isMissing(), name);
  });

  protected readonly surfaceStates = computed(() => {
    const data = this.data();
    const hasToothCondition = data.condition != null;
    const points = this.arch() === 'upper' ? UPPER_POINTS : LOWER_POINTS;

    return SURFACES.map((surface) => {
      const condition = hasToothCondition
        ? data.condition!
        : (data.surfaces?.[surface] ?? 'healthy');
      return {
        surface,
        points: points[surface],
        isActive: condition !== 'healthy',
        fillClass: conditionFillClass(condition),
      };
    });
  });

  protected surfaceLabel(surface: ToothSurface): string {
    return this.locale().odontogram.surfaceLabels[surface];
  }

  protected onSurfaceActivate(surface: ToothSurface): void {
    if (!this.interactive()) return;
    this.surfaceClick.emit(surface);
  }

  protected onSurfaceKeydown(event: KeyboardEvent, surface: ToothSurface): void {
    if (!this.interactive()) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.surfaceClick.emit(surface);
    }
  }
}
