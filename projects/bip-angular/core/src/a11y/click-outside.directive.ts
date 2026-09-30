import { DOCUMENT } from '@angular/common';
import {
  Directive,
  ElementRef,
  booleanAttribute,
  effect,
  inject,
  input,
  output,
} from '@angular/core';

/**
 * Puerto de `useClickOutside()` (React) como directiva standalone — para overlays de CDK
 * (Modal, Dropdown, Popover...) preferir `overlayRef.outsidePointerEvents()` (BipOverlay ya
 * lo expone), que no necesita esta directiva. `bipClickOutside` es para elementos fuera de un
 * overlay que igual necesitan detectar "click afuera" (p. ej. un elemento con `position:
 * absolute` casero).
 */
@Directive({
  selector: '[bipClickOutside]',
})
export class BipClickOutsideDirective {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly document = inject(DOCUMENT);

  readonly enabled = input(true, { transform: booleanAttribute });
  readonly bipClickOutside = output<void>();

  constructor() {
    effect((onCleanup) => {
      if (!this.enabled()) return;

      const onPointerDown = (event: PointerEvent): void => {
        const target = event.target as Node | null;
        if (target && !this.elementRef.nativeElement.contains(target)) {
          this.bipClickOutside.emit();
        }
      };

      this.document.addEventListener('pointerdown', onPointerDown);
      onCleanup(() => this.document.removeEventListener('pointerdown', onPointerDown));
    });
  }
}
