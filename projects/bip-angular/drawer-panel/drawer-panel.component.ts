import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  PLATFORM_ID,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  booleanAttribute,
  contentChild,
  effect,
  inject,
  input as ngInput,
  model,
  output,
  signal,
  untracked,
} from '@angular/core';
import { A11yModule } from '@angular/cdk/a11y';
import { ScrollStrategyOptions, type OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { BipOverlay, injectBipLocale, type BipSize } from '@bip-design-systems/angular/core';
import { BipDrawerPanelFooter, BipDrawerPanelHeaderActions } from './drawer-panel-slots';

export type BipDrawerPanelPlacement = 'left' | 'right';

/** Debe calzar con `--duration-slow` (drawer-panel.component.css). */
const ANIMATION_DURATION = 300;

const SIZE_CLASS: Record<BipSize, string> = {
  sm: 'bip-drawer-panel--sm',
  md: 'bip-drawer-panel--md',
  lg: 'bip-drawer-panel--lg',
};

const PLACEMENT_CLASS: Record<BipDrawerPanelPlacement, string> = {
  left: 'bip-drawer-panel--left',
  right: 'bip-drawer-panel--right',
};

/**
 * Panel lateral vía `BipOverlay` + `TemplatePortal` (mismo patrón que `BipModal`). `placement`
 * es físico a propósito (como en React) — quien pide `right` quiere el borde derecho físico de
 * la pantalla sin importar `dir`, igual que `position` en Toast/Tooltip.
 *
 * Sin compound components separados para header/footer (a diferencia de Modal): React expone
 * `title`/`headerActions`/`footer` como props sueltas, así que aquí son un input de texto
 * (`title`) + dos slots de `<ng-content select>` (`[bipDrawerPanelHeaderActions]`,
 * `[bipDrawerPanelFooter]`) — no hacen falta subcomponentes ni contexto inyectado.
 */
@Component({
  selector: 'bip-drawer-panel',
  standalone: true,
  imports: [A11yModule],
  templateUrl: './drawer-panel.component.html',
  styleUrl: './drawer-panel.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BipDrawerPanel {
  protected readonly locale = injectBipLocale();

  readonly open = model(false);
  readonly title = ngInput<string | undefined>(undefined);
  readonly size = ngInput<BipSize>('md');
  readonly placement = ngInput<BipDrawerPanelPlacement>('right');
  readonly closeOnBackdrop = ngInput(true, { transform: booleanAttribute });
  readonly closed = output<void>();

  protected readonly footerContent = contentChild(BipDrawerPanelFooter);
  protected readonly headerActionsContent = contentChild(BipDrawerPanelHeaderActions);

  protected readonly visible = signal(false);
  protected readonly sizeClass = SIZE_CLASS;
  protected readonly placementClass = PLACEMENT_CLASS;

  @ViewChild('portalTemplate', { static: true })
  private readonly portalTemplate!: TemplateRef<unknown>;

  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly bipOverlay = inject(BipOverlay);
  private readonly injector = inject(Injector);
  private readonly scrollStrategies = inject(ScrollStrategyOptions);
  private readonly document = inject(DOCUMENT);
  // Mismo criterio que BipModal: el overlay solo existe en el navegador.
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private overlayRef: OverlayRef | null = null;
  private previouslyFocusedElement: HTMLElement | null = null;

  constructor() {
    effect(() => {
      const isOpen = this.open();
      untracked(() => {
        if (!this.isBrowser) return;
        if (isOpen) {
          this.show();
        } else {
          this.hide();
        }
      });
    });

    inject(DestroyRef).onDestroy(() => {
      this.overlayRef?.dispose();
      this.overlayRef = null;
    });
  }

  private show(): void {
    if (this.overlayRef) return;

    this.previouslyFocusedElement = (this.document.activeElement as HTMLElement) ?? null;
    const overlayRef = this.bipOverlay.create(
      { scrollStrategy: this.scrollStrategies.block(), hasBackdrop: false },
      this.injector
    );
    overlayRef.attach(new TemplatePortal(this.portalTemplate, this.viewContainerRef));
    overlayRef.keydownEvents().subscribe((event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        this.requestClose();
      }
    });
    this.overlayRef = overlayRef;
    requestAnimationFrame(() => this.visible.set(true));
  }

  private hide(): void {
    const overlayRef = this.overlayRef;
    if (!overlayRef) return;

    this.overlayRef = null;
    this.visible.set(false);
    setTimeout(() => {
      overlayRef.detach();
      overlayRef.dispose();
    }, ANIMATION_DURATION);
    this.previouslyFocusedElement?.focus();
    this.previouslyFocusedElement = null;
  }

  protected onBackdropClick(): void {
    if (this.closeOnBackdrop()) {
      this.requestClose();
    }
  }

  protected requestClose(): void {
    this.open.set(false);
    this.closed.emit();
  }
}
