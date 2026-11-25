import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnDestroy,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  computed,
  contentChildren,
  effect,
  inject,
  input,
  untracked,
} from '@angular/core';
import { FocusKeyManager } from '@angular/cdk/a11y';
import { type ConnectedPosition, type OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { BipOverlay } from '@bip-design-systems/angular/core';
import { BIP_DROPDOWN_CONTEXT } from './dropdown-context';
import { BipDropdownFocusableItem } from './dropdown-focusable-item';
import { BIP_DROPDOWN_MENU_SCOPE } from './dropdown-menu-scope';

export type BipDropdownPlacement = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';

/** Debe calzar con `--space-1` (dropdown-menu.component.css: gap entre trigger y menú). */
const GAP_PX = 4;

const PLACEMENT_POSITION: Record<BipDropdownPlacement, ConnectedPosition> = {
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
 * Patrón WAI-ARIA Menu Button: `role="menu"` + navegación por teclado con `FocusKeyManager`
 * del CDK (↑↓ mueven el foco con wrap, Home/End van al primer/último item, se saltan los
 * disabled vía `skipPredicate`). Escape cierra y devuelve el foco al trigger; Tab cierra el
 * menú y deja que el foco avance de forma natural (no hace `preventDefault`).
 *
 * Posiciona vía `BipOverlay` + `TemplatePortal`, igual que `BipPopoverContent` — mismo motivo
 * (regla del CLAUDE.md de Bloque 2), aunque la referencia React use CSS absoluto.
 */
@Component({
  selector: 'bip-dropdown-menu',
  templateUrl: './dropdown-menu.component.html',
  styleUrl: './dropdown-menu.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: BIP_DROPDOWN_MENU_SCOPE, useExisting: BipDropdownMenu }],
})
export class BipDropdownMenu implements OnDestroy {
  readonly placement = input<BipDropdownPlacement>('bottom-start');

  protected readonly context = (() => {
    const ctx = inject(BIP_DROPDOWN_CONTEXT, { optional: true });
    if (!ctx) {
      throw new Error('<bip-dropdown-menu> debe usarse dentro de <bip-dropdown>');
    }
    return ctx;
  })();

  private readonly allItems = contentChildren(BipDropdownFocusableItem, { descendants: true });
  /** Solo los items que me pertenecen directamente — excluye los de un <bip-dropdown-submenu> anidado (ver dropdown-menu-scope.ts). */
  private readonly items = computed(() =>
    this.allItems().filter((item) => item.menuScope === this)
  );

  @ViewChild('portalTemplate', { static: true })
  private readonly portalTemplate!: TemplateRef<unknown>;

  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly bipOverlay = inject(BipOverlay);
  private readonly injector = inject(Injector);

  private overlayRef: OverlayRef | null = null;
  private keyManager: FocusKeyManager<BipDropdownFocusableItem> | null = null;

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

  protected onMenuKeydown(event: KeyboardEvent): void {
    if (event.key === 'Tab') {
      this.context.close();
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      this.context.close();
      this.context.triggerElementRef?.nativeElement.focus();
      return;
    }
    this.keyManager?.onKeydown(event);
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
    overlayRef.outsidePointerEvents().subscribe((event) => {
      const trigger = this.context.triggerElementRef?.nativeElement;
      if (trigger && event.target instanceof Node && trigger.contains(event.target)) {
        return; // el propio trigger ya togglea al hacer clic
      }
      this.context.close();
    });

    this.keyManager = new FocusKeyManager(this.items, this.injector)
      .withWrap()
      .withHomeAndEnd()
      .skipPredicate((item) => item.isDisabled);
    queueMicrotask(() => this.keyManager?.setFirstItemActive());

    this.overlayRef = overlayRef;
  }

  private hide(): void {
    this.overlayRef?.dispose();
    this.overlayRef = null;
    this.keyManager?.destroy();
    this.keyManager = null;
  }
}
