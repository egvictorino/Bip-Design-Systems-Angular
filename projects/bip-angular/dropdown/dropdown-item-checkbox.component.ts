import { ChangeDetectionStrategy, Component, ElementRef, inject, model } from '@angular/core';
import { BipDropdownFocusableItem } from './dropdown-focusable-item';

/**
 * `role="menuitemcheckbox"` — a diferencia de `[bipDropdownItem]` (directiva de atributo),
 * necesita marcado propio (el indicador de check) así que es un elemento, no un atributo.
 * No cierra el dropdown al hacer clic (a diferencia de `BipDropdownItem`) — alternar una
 * opción normalmente no implica terminar la interacción con el menú.
 */
@Component({
  selector: 'button[bipDropdownItemCheckbox]',
  standalone: true,
  template: `
    <span class="bip-dropdown-item-check-indicator" aria-hidden="true">{{ checked() ? '✓' : '' }}</span>
    <ng-content />
  `,
  styleUrl: './dropdown-item-checkbox.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: BipDropdownFocusableItem, useExisting: BipDropdownItemCheckbox }],
  host: {
    class: 'bip-dropdown-item bip-dropdown-item-checkbox',
    '[attr.role]': '"menuitemcheckbox"',
    '[attr.aria-checked]': 'checked()',
    '(click)': 'onClick()',
  },
})
export class BipDropdownItemCheckbox extends BipDropdownFocusableItem {
  readonly checked = model(false);

  private readonly elementRef = inject(ElementRef<HTMLButtonElement>);

  override focus(): void {
    this.elementRef.nativeElement.focus();
  }

  override get disabled(): boolean {
    return this.elementRef.nativeElement.disabled;
  }

  protected onClick(): void {
    if (!this.disabled) {
      this.checked.update((value) => !value);
    }
  }
}
