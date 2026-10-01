import { Directive, ElementRef, type OnInit, inject } from '@angular/core';
import { BIP_POPOVER_CONTEXT } from './popover-context';

/** Mejora cualquier elemento nativo (`<button bipPopoverTrigger>`, igual que `bipButton`) en vez de envolverlo — Angular no tiene `cloneElement`. */
@Directive({
  selector: '[bipPopoverTrigger]',
  standalone: true,
  host: {
    '[id]': 'context.triggerId',
    '[attr.aria-haspopup]': '"dialog"',
    '[attr.aria-expanded]': 'context.isOpen()',
    '[attr.aria-controls]': 'context.contentId',
    '(click)': 'context.toggle()',
  },
})
export class BipPopoverTrigger implements OnInit {
  protected readonly context = (() => {
    const ctx = inject(BIP_POPOVER_CONTEXT, { optional: true });
    if (!ctx) {
      throw new Error('[bipPopoverTrigger] debe usarse dentro de <bip-popover>');
    }
    return ctx;
  })();

  private readonly elementRef = inject(ElementRef<HTMLElement>);

  ngOnInit(): void {
    this.context.registerTrigger(this.elementRef);
  }
}
