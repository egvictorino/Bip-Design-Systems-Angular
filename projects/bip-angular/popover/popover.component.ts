import { ChangeDetectionStrategy, Component, type ElementRef, inject, model } from '@angular/core';
import { BipIdGenerator } from '@bip-design-systems/angular/core';
import { BIP_POPOVER_CONTEXT, type BipPopoverContext } from './popover-context';

/**
 * Compound component — `<bip-popover>` solo provee contexto (estado abierto/cerrado +
 * ids estables), `[bipPopoverTrigger]` y `<bip-popover-content>` (ambos descendientes
 * directos en el DOM, aunque no exista un wrapper `position: relative` como en React: el
 * posicionamiento real lo resuelve `BipPopoverContent` vía `BipOverlay` + CDK) hacen el resto.
 * `[(open)]` como `model()` — controlado/no-controlado "gratis" (el consumidor que no lo
 * enlaza simplemente nunca lee ni escribe el signal, toggle()/close() lo mueven igual).
 */
@Component({
  selector: 'bip-popover',
  standalone: true,
  template: `<ng-content />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'bip-popover' },
  providers: [{ provide: BIP_POPOVER_CONTEXT, useExisting: BipPopover }],
})
export class BipPopover implements BipPopoverContext {
  readonly open = model(false);
  readonly isOpen = this.open;
  readonly contentId = inject(BipIdGenerator).next('bip-popover-content');
  readonly triggerId = inject(BipIdGenerator).next('bip-popover-trigger');

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
