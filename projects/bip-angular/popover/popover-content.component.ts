import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnDestroy,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  effect,
  inject,
  input,
  untracked,
} from '@angular/core';
import { A11yModule } from '@angular/cdk/a11y';
import { type ConnectedPosition, type OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { BipOverlay } from '@bip-design-systems/angular/core';
import { BIP_POPOVER_CONTEXT } from './popover-context';

export type BipPopoverPlacement = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';

/** Debe calzar con `--space-1` (popover-content.component.css: gap entre trigger y burbuja). */
const GAP_PX = 4;

const PLACEMENT_POSITION: Record<BipPopoverPlacement, ConnectedPosition> = {
  'bottom-start': {
    originX: 'start',
    originY: 'bottom',
    overlayX: 'start',
    overlayY: 'top',
    offsetY: GAP_PX,
  },
  'bottom-end': {
    originX: 'end',
    originY: 'bottom',
    overlayX: 'end',
    overlayY: 'top',
    offsetY: GAP_PX,
  },
  'top-start': {
    originX: 'start',
    originY: 'top',
    overlayX: 'start',
    overlayY: 'bottom',
    offsetY: -GAP_PX,
  },
  'top-end': {
    originX: 'end',
    originY: 'top',
    overlayX: 'end',
    overlayY: 'bottom',
    offsetY: -GAP_PX,
  },
};

/**
 * Debe usarse dentro de `<bip-popover>`. Posiciona vía `BipOverlay` + `FlexibleConnectedPositionStrategy`
 * anclada al elemento que registró `[bipPopoverTrigger]` — a diferencia de la referencia React
 * (CSS absoluto dentro de un `.container` con `position: relative`), por la regla del CLAUDE.md
 * de que todo overlay de la librería pasa por `BipOverlay`. `placement` es lógico (`start`/`end`,
 * no `left`/`right`) — a diferencia de `position` en Tooltip/DrawerPanel/Toast, aquí no hay
 * ninguna nota de "físico a propósito" en la referencia, así que sigue la `Directionality` real.
 */
@Component({
  selector: 'bip-popover-content',
  imports: [A11yModule],
  templateUrl: './popover-content.component.html',
  styleUrl: './popover-content.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BipPopoverContent implements OnDestroy {
  readonly placement = input<BipPopoverPlacement>('bottom-start');

  protected readonly context = (() => {
    const ctx = inject(BIP_POPOVER_CONTEXT, { optional: true });
    if (!ctx) {
      throw new Error('<bip-popover-content> debe usarse dentro de <bip-popover>');
    }
    return ctx;
  })();

  @ViewChild('portalTemplate', { static: true })
  private readonly portalTemplate!: TemplateRef<unknown>;

  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly bipOverlay = inject(BipOverlay);
  private readonly injector = inject(Injector);

  private overlayRef: OverlayRef | null = null;

  constructor() {
    effect(() => {
      const isOpen = this.context.isOpen();
      untracked(() => {
        if (isOpen) {
          this.show();
        } else {
          this.hide();
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.hide();
  }

  private show(): void {
    if (this.overlayRef) return;
    const triggerElementRef = this.context.triggerElementRef;
    if (!triggerElementRef) return;

    const overlayRef = this.bipOverlay.create(
      {
        positionStrategy: this.bipOverlay
          .position()
          .flexibleConnectedTo(triggerElementRef)
          .withPositions([PLACEMENT_POSITION[this.placement()]])
          .withPush(true),
        scrollStrategy: this.bipOverlay.scrollStrategies.reposition(),
        hasBackdrop: false,
      },
      this.injector
    );
    overlayRef.attach(new TemplatePortal(this.portalTemplate, this.viewContainerRef));
    overlayRef.keydownEvents().subscribe((event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        this.context.close();
      }
    });
    overlayRef.outsidePointerEvents().subscribe((event) => {
      const trigger = this.context.triggerElementRef?.nativeElement;
      if (trigger && event.target instanceof Node && trigger.contains(event.target)) {
        return; // el propio trigger ya togglea al hacer clic — evita cerrar y reabrir en el mismo clic
      }
      this.context.close();
    });

    this.overlayRef = overlayRef;
  }

  private hide(): void {
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }
}
