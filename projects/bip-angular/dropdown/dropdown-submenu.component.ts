import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  OnDestroy,
  ViewChild,
  booleanAttribute,
  computed,
  contentChildren,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { FocusKeyManager } from '@angular/cdk/a11y';
import { BipIdGenerator } from '@bip-design-systems/angular/core';
import { BipDropdownFocusableItem } from './dropdown-focusable-item';
import { BIP_DROPDOWN_MENU_SCOPE } from './dropdown-menu-scope';

/**
 * Item de menú que abre un sub-menú anidado — se registra como UN solo `BipDropdownFocusableItem`
 * en el `<bip-dropdown-menu>` padre (su propio trigger), y a la vez provee `BIP_DROPDOWN_MENU_SCOPE`
 * como sí mismo para que sus propios items hijos no sean vistos por el `FocusKeyManager` del
 * padre (`contentChildren(..., { descendants: true })` atraviesa también esta plantilla).
 *
 * No usa `BipOverlay` para el panel anidado — vive dentro del `<bip-dropdown-menu>` padre, que
 * ya es un overlay; se posiciona con CSS absoluto (`inset-inline-start: 100%`), igual que la
 * referencia React.
 *
 * Teclado: `ArrowRight` en el trigger abre y enfoca el primer item; dentro del panel,
 * ↑↓/Home/End navegan con su propio `FocusKeyManager`, `ArrowLeft`/`Escape` cierran y devuelven
 * el foco al trigger sin dejar que el `Escape` siga subiendo hasta `<bip-dropdown-menu>` (que
 * cerraría todo el dropdown) — `stopPropagation()` basta en Angular (eventos nativos del DOM,
 * a diferencia del `stopImmediatePropagation()` que la referencia React necesita por su sistema
 * de eventos sintéticos).
 */
@Component({
  selector: 'bip-dropdown-submenu',
  templateUrl: './dropdown-submenu.component.html',
  styleUrl: './dropdown-submenu.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: BipDropdownFocusableItem, useExisting: BipDropdownSubmenu },
    { provide: BIP_DROPDOWN_MENU_SCOPE, useExisting: BipDropdownSubmenu },
  ],
  host: {
    class: 'bip-dropdown-submenu-container',
    '(mouseenter)': 'openSubmenu()',
    '(mouseleave)': 'closeSubmenu()',
  },
})
export class BipDropdownSubmenu extends BipDropdownFocusableItem implements OnDestroy {
  readonly label = input.required<string>();
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly isOpen = signal(false);
  protected readonly submenuId = inject(BipIdGenerator).next('bip-dropdown-submenu');

  @ViewChild('triggerBtn', { static: true })
  private readonly triggerBtnRef!: ElementRef<HTMLButtonElement>;

  private readonly allItems = contentChildren(BipDropdownFocusableItem, { descendants: true });
  private readonly directItems = computed(() => this.allItems().filter((item) => item.menuScope === this));

  private readonly injector = inject(Injector);
  private keyManager: FocusKeyManager<BipDropdownFocusableItem> | null = null;
  private openedViaKeyboard = false;

  override readonly menuScope = inject(BIP_DROPDOWN_MENU_SCOPE, { optional: true, skipSelf: true });

  constructor() {
    super();
    effect(() => {
      const open = this.isOpen();
      untracked(() => {
        if (open) {
          // FocusKeyManager crea un effect() interno al recibir un Signal — construirlo acá
          // (ya estamos dentro de untracked) evita el NG0602 que da BipOverlay.create() si no
          // se envuelve igual.
          this.keyManager = new FocusKeyManager(this.directItems, this.injector)
            .withWrap()
            .withHomeAndEnd()
            .skipPredicate((item) => item.isDisabled);
          if (this.openedViaKeyboard) {
            this.openedViaKeyboard = false;
            queueMicrotask(() => this.keyManager?.setFirstItemActive());
          }
        } else {
          this.keyManager?.destroy();
          this.keyManager = null;
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.keyManager?.destroy();
  }

  override focus(): void {
    this.triggerBtnRef.nativeElement.focus();
  }

  override get isDisabled(): boolean {
    return this.disabled();
  }

  protected openSubmenu(): void {
    if (!this.isDisabled) {
      this.isOpen.set(true);
    }
  }

  protected closeSubmenu(): void {
    this.isOpen.set(false);
  }

  protected toggle(): void {
    this.isOpen.update((value) => !value);
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      event.stopPropagation();
      this.openedViaKeyboard = true;
      this.openSubmenu();
    }
  }

  protected onSubmenuKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft' || event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.closeSubmenu();
      this.focus();
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Home' || event.key === 'End') {
      event.stopPropagation();
      this.keyManager?.onKeydown(event);
    }
  }
}
