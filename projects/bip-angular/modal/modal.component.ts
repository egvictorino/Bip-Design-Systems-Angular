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
import { BipIdGenerator, BipOverlay } from '@bip-design-systems/angular/core';
import { BIP_MODAL_CONTEXT, type BipModalContext } from './modal-context';
import { BipModalHeader } from './modal-header.component';

export type BipModalSize = 'sm' | 'md' | 'lg' | 'xl';

/** Duración de la transición de entrada/salida — debe calzar con `--duration-fast` (modal.component.css). */
const ANIMATION_DURATION = 150;

const SIZE_CLASS: Record<BipModalSize, string> = {
  sm: 'bip-modal-dialog--sm',
  md: 'bip-modal-dialog--md',
  lg: 'bip-modal-dialog--lg',
  xl: 'bip-modal-dialog--xl',
};

/**
 * Diálogo modal vía `BipOverlay` con `TemplatePortal`: el `<ng-template>` del propio
 * `bip-modal` se adjunta al pane del overlay, así que `<ng-content>` resuelve igual que en
 * cualquier otro componente (la proyección se fija en la vista de `BipModal`, no en dónde el
 * CDK mueve esa vista en el DOM) y los hijos proyectados (`<bip-modal-header>`, etc.) pueden
 * seguir inyectando `BipModal` vía el árbol de injectors de componentes, que sigue la jerarquía
 * de vistas y no el DOM físico.
 *
 * `[(open)]` en vez de `open`+`onClose` (React): el eje abierto/cerrado es un `model()`,
 * `closed` es la señal de "se cerró" para consumidores que prefieren un output explícito.
 */
@Component({
  selector: 'bip-modal',
  imports: [A11yModule, BipModalHeader],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: BIP_MODAL_CONTEXT, useExisting: BipModal }],
})
export class BipModal implements BipModalContext {
  readonly open = model(false);
  readonly title = ngInput<string | undefined>(undefined);
  readonly size = ngInput<BipModalSize>('md');
  readonly closeOnBackdrop = ngInput(true, { transform: booleanAttribute });
  readonly closeOnEscape = ngInput(true, { transform: booleanAttribute });
  readonly closed = output<void>();

  readonly titleId = inject(BipIdGenerator).next('bip-modal-title');
  protected readonly animating = signal(false);
  protected readonly sizeClass = SIZE_CLASS;

  @ViewChild('portalTemplate', { static: true })
  private readonly portalTemplate!: TemplateRef<unknown>;

  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly bipOverlay = inject(BipOverlay);
  private readonly injector = inject(Injector);
  private readonly scrollStrategies = inject(ScrollStrategyOptions);
  private readonly document = inject(DOCUMENT);
  // El overlay (CDK, requestAnimationFrame) solo existe en el navegador — en el servidor el
  // modal no se adjunta: el contenido del portal aparece tras la hidratación, como cualquier
  // overlay (no es contenido indexable, así que no hace falta en el HTML inicial).
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private overlayRef: OverlayRef | null = null;
  private previouslyFocusedElement: HTMLElement | null = null;

  constructor() {
    effect(() => {
      // `BipOverlay.create()` crea a su vez un `effect()` interno (sync de theming) — sin
      // `untracked()` Angular lanza NG0602 ("effect() cannot be called from within a reactive
      // context") porque seguiríamos dentro de la ejecución de este mismo effect.
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

    // Si el componente se destruye mientras el modal está abierto (p. ej. un cambio de ruta),
    // nadie más va a llamar a hide()/dispose() — sin esto el overlay y su effect de sync de
    // theming (ver BipOverlay) quedan vivos huérfanos.
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
      if (event.key === 'Escape' && this.closeOnEscape()) {
        event.preventDefault();
        this.requestClose();
      }
    });
    this.overlayRef = overlayRef;
    requestAnimationFrame(() => this.animating.set(true));
  }

  private hide(): void {
    const overlayRef = this.overlayRef;
    if (!overlayRef) return;

    this.overlayRef = null;
    this.animating.set(false);
    setTimeout(() => {
      overlayRef.detach();
      overlayRef.dispose();
    }, ANIMATION_DURATION);
    this.previouslyFocusedElement?.focus();
    this.previouslyFocusedElement = null;
  }

  protected onBackdropMouseDown(event: MouseEvent): void {
    if (this.closeOnBackdrop() && event.target === event.currentTarget) {
      this.requestClose();
    }
  }

  /** Expuesto para que `<bip-modal-header>` (proyectado) pueda cerrar el modal desde su botón de cierre. */
  requestClose(): void {
    this.open.set(false);
    this.closed.emit();
  }
}
