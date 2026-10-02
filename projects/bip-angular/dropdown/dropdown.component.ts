import { ChangeDetectionStrategy, Component, type ElementRef, inject, model } from '@angular/core';
import { BipIdGenerator } from '@bip-design-systems/angular/core';
import { BIP_DROPDOWN_CONTEXT, type BipDropdownContext } from './dropdown-context';

/**
 * Compound component (patrón WAI-ARIA Menu Button) — mismo esqueleto que `BipPopover`:
 * `<bip-dropdown>` solo provee contexto, `[bipDropdownTrigger]` y `<bip-dropdown-menu>` hacen
 * el resto. `[(open)]` como `model()`.
 */
@Component({
  selector: 'bip-dropdown',
  template: `<ng-content />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'bip-dropdown' },
  providers: [{ provide: BIP_DROPDOWN_CONTEXT, useExisting: BipDropdown }],
})
export class BipDropdown implements BipDropdownContext {
  readonly open = model(false);
  readonly isOpen = this.open;
  readonly menuId = inject(BipIdGenerator).next('bip-dropdown-menu');
  readonly triggerId = inject(BipIdGenerator).next('bip-dropdown-trigger');

  triggerElementRef: ElementRef<HTMLElement> | null = null;

  toggle(): void {
    this.open.update((value) => !value);
  }

  close(): void {
    this.open.set(false);
  }

  registerTrigger(elementRef: ElementRef<HTMLElement>): void {
    this.triggerElementRef = elementRef;
  }
}
