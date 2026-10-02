import { ChangeDetectionStrategy, Component, ElementRef, inject, input } from '@angular/core';
import { BIP_DROPDOWN_CONTEXT } from './dropdown-context';
import { BipDropdownFocusableItem } from './dropdown-focusable-item';
import { BIP_DROPDOWN_MENU_SCOPE } from './dropdown-menu-scope';

export type BipDropdownItemVariant = 'default' | 'danger';

/**
 * Mejora un button nativo (role="menuitem") — el consumidor pone su propio type="button" y,
 * si quiere un icono, su propio span aria-hidden proyectado antes del texto.
 */
@Component({
  selector: 'button[bipDropdownItem]',
  template: `<ng-content />`,
  styleUrl: './dropdown-item.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: BipDropdownFocusableItem, useExisting: BipDropdownItem }],
  host: {
    '[attr.role]': '"menuitem"',
    class: 'bip-dropdown-item',
    '[class.bip-dropdown-item--danger]': 'variant() === "danger"',
    '(click)': 'onClick()',
  },
})
export class BipDropdownItem extends BipDropdownFocusableItem {
  readonly variant = input<BipDropdownItemVariant>('default');

  private readonly elementRef = inject(ElementRef<HTMLButtonElement>);
  private readonly context = inject(BIP_DROPDOWN_CONTEXT, { optional: true });

  override readonly menuScope = inject(BIP_DROPDOWN_MENU_SCOPE, { optional: true });

  override focus(): void {
    this.elementRef.nativeElement.focus();
  }

  override get isDisabled(): boolean {
    return this.elementRef.nativeElement.disabled;
  }

  protected onClick(): void {
    this.context?.close();
  }
}
