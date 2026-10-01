import { Directive, ElementRef, type OnInit, inject } from '@angular/core';
import { BIP_DROPDOWN_CONTEXT } from './dropdown-context';

/** Mejora cualquier elemento nativo (`<button bipDropdownTrigger>`) — sin wrapper, Angular no tiene `cloneElement`. */
@Directive({
  selector: '[bipDropdownTrigger]',
  standalone: true,
  host: {
    '[id]': 'context.triggerId',
    '[attr.aria-haspopup]': '"true"',
    '[attr.aria-expanded]': 'context.isOpen()',
    '[attr.aria-controls]': 'context.menuId',
    '(click)': 'context.toggle()',
  },
})
export class BipDropdownTrigger implements OnInit {
  protected readonly context = (() => {
    const ctx = inject(BIP_DROPDOWN_CONTEXT, { optional: true });
    if (!ctx) {
      throw new Error('[bipDropdownTrigger] debe usarse dentro de <bip-dropdown>');
    }
    return ctx;
  })();

  private readonly elementRef = inject(ElementRef<HTMLElement>);

  ngOnInit(): void {
    this.context.registerTrigger(this.elementRef);
  }
}
