import {
  type ComponentRef,
  Directive,
  ElementRef,
  Injector,
  OnDestroy,
  effect,
  inject,
  input,
  numberAttribute,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Overlay, type ConnectedPosition, type OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { BipIdGenerator, BipOverlay } from '@bip-design-systems/angular/core';
import { BipTooltipPanel } from './tooltip-panel.component';
import type { BipTooltipAlign, BipTooltipPosition, BipTooltipVariant } from './tooltip.types';

const GAP_PX = 8;

/**
 * `[bipTooltip]` — directiva de atributo (no un wrapper, a diferencia de React que clona el
 * `children`: Angular no tiene equivalente a `cloneElement`, así que el trigger es cualquier
 * elemento nativo con el atributo puesto encima). El valor del propio atributo es el contenido
 * (`bipTooltip="Texto"` = `content`), igual que `matTooltip` de Angular Material.
 *
 * Sin modo controlado (`open`/`onOpenChange` de React): un `model()` no puede distinguir
 * "el consumidor lo enlazó" de "quedó en su default", así que replicar ese prop exigiría una
 * señal extra sin beneficio real aquí — hover/focus/Escape ya cubren el caso de uso principal.
 *
 * Posicionamiento vía `BipOverlay` + `FlexibleConnectedPositionStrategy` (CDK), nunca CSS
 * absoluto dentro de un wrapper — regla del CLAUDE.md para todos los overlays de la librería.
 * El eje principal de `position` (física) se fuerza a `ltr` cuando es `left`/`right` para que
 * "izquierda" signifique siempre el lado físico, sin importar `dir`; `align` (lógico) se deja
 * resolver por la `Directionality` real del árbol.
 */
@Directive({
  selector: '[bipTooltip]',
  standalone: true,
  exportAs: 'bipTooltip',
  host: {
    '[attr.aria-describedby]': 'tooltipId',
    '(mouseenter)': 'scheduleOpen()',
    '(mouseleave)': 'scheduleClose()',
    '(focus)': 'scheduleOpen()',
    '(blur)': 'scheduleClose()',
  },
})
export class BipTooltip implements OnDestroy {
  readonly content = input.required<string>({ alias: 'bipTooltip' });
  readonly position = input<BipTooltipPosition>('top', { alias: 'bipTooltipPosition' });
  readonly align = input<BipTooltipAlign>('center', { alias: 'bipTooltipAlign' });
  readonly variant = input<BipTooltipVariant>('default', { alias: 'bipTooltipVariant' });
  readonly delay = input(0, { alias: 'bipTooltipDelay', transform: numberAttribute });
  readonly closeDelay = input(0, { alias: 'bipTooltipCloseDelay', transform: numberAttribute });

  readonly tooltipId = inject(BipIdGenerator).next('bip-tooltip');

  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly bipOverlay = inject(BipOverlay);
  private readonly cdkOverlay = inject(Overlay);
  private readonly injector = inject(Injector);
  private readonly document = inject(DOCUMENT);

  private overlayRef: OverlayRef | null = null;
  private panelRef: ComponentRef<BipTooltipPanel> | null = null;
  private openTimer: ReturnType<typeof setTimeout> | null = null;
  private closeTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly onEscape = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      this.clearTimers();
      this.close();
    }
  };

  constructor() {
    effect(() => {
      // Mantiene la burbuja abierta sincronizada si content/variant cambian mientras está visible.
      const content = this.content();
      const variant = this.variant();
      this.panelRef?.setInput('content', content);
      this.panelRef?.setInput('variant', variant);
    });
  }

  ngOnDestroy(): void {
    this.clearTimers();
    this.destroyOverlay();
  }

  protected scheduleOpen(): void {
    this.clearTimer('closeTimer');
    const delay = this.delay();
    if (delay > 0) {
      this.openTimer = setTimeout(() => this.open(), delay);
    } else {
      this.open();
    }
  }

  protected scheduleClose(): void {
    this.clearTimer('openTimer');
    const closeDelay = this.closeDelay();
    if (closeDelay > 0) {
      this.closeTimer = setTimeout(() => this.close(), closeDelay);
    } else {
      this.close();
    }
  }

  private open(): void {
    if (this.overlayRef) return;

    const isPhysicalAxis = this.position() === 'left' || this.position() === 'right';
    const overlayRef = this.bipOverlay.create(
      {
        positionStrategy: this.buildPositionStrategy(),
        scrollStrategy: this.cdkOverlay.scrollStrategies.reposition(),
        hasBackdrop: false,
        // Fuerza semántica física en el eje principal cuando position es left/right — 'start'
        // siempre es la izquierda real, sin importar la Directionality del árbol (OverlayConfig.direction
        // es lo único que controla esto; FlexibleConnectedPositionStrategy no tiene un método propio).
        ...(isPhysicalAxis ? { direction: 'ltr' as const } : {}),
      },
      this.injector
    );
    const panelRef = overlayRef.attach(new ComponentPortal(BipTooltipPanel, null, this.injector));
    panelRef.setInput('content', this.content());
    panelRef.setInput('variant', this.variant());
    panelRef.setInput('position', this.position());
    panelRef.setInput('tooltipId', this.tooltipId);
    panelRef.instance.show();

    this.overlayRef = overlayRef;
    this.panelRef = panelRef;
    this.document.addEventListener('keydown', this.onEscape);
  }

  private close(): void {
    this.destroyOverlay();
  }

  private destroyOverlay(): void {
    this.document.removeEventListener('keydown', this.onEscape);
    this.overlayRef?.dispose();
    this.overlayRef = null;
    this.panelRef = null;
  }

  private clearTimer(which: 'openTimer' | 'closeTimer'): void {
    const timer = this[which];
    if (timer) {
      clearTimeout(timer);
      this[which] = null;
    }
  }

  private clearTimers(): void {
    this.clearTimer('openTimer');
    this.clearTimer('closeTimer');
  }

  private buildPositionStrategy() {
    return this.cdkOverlay
      .position()
      .flexibleConnectedTo(this.elementRef)
      .withPositions([this.computeConnectedPosition()])
      .withPush(true);
  }

  private computeConnectedPosition(): ConnectedPosition {
    const position = this.position();
    const align = this.align();

    if (position === 'top' || position === 'bottom') {
      return position === 'top'
        ? { originX: align, originY: 'top', overlayX: align, overlayY: 'bottom', offsetY: -GAP_PX }
        : { originX: align, originY: 'bottom', overlayX: align, overlayY: 'top', offsetY: GAP_PX };
    }

    const crossY = align === 'start' ? 'top' : align === 'end' ? 'bottom' : 'center';
    return position === 'left'
      ? { originX: 'start', originY: crossY, overlayX: 'end', overlayY: crossY, offsetX: -GAP_PX }
      : { originX: 'end', originY: crossY, overlayX: 'start', overlayY: crossY, offsetX: GAP_PX };
  }
}
