import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { injectBipLocale } from '@bip-design-systems/angular/core';
import { BIP_MODAL_CONTEXT } from './modal-context';

/**
 * Debe usarse dentro de `<bip-modal>` (ya sea proyectado a mano, o instanciado por `BipModal`
 * cuando se usa el input `title`) — sin `BIP_MODAL_CONTEXT` no hay `titleId` que anclar al
 * `aria-labelledby` del diálogo ni un `requestClose()` al que llamar, así que lanza en vez de
 * degradar en silencio.
 */
@Component({
  selector: 'bip-modal-header',
  template: `
    <h2 class="bip-modal-title" [id]="context.titleId">
      <ng-content />
    </h2>
    <button
      type="button"
      class="bip-modal-close-btn"
      [attr.aria-label]="locale().modal.close"
      (click)="context.requestClose()"
    >
      <svg viewBox="0 0 20 20" fill="currentColor" class="bip-modal-close-icon" aria-hidden="true">
        <path
          d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
        />
      </svg>
    </button>
  `,
  styleUrl: './modal-header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'bip-modal-header' },
})
export class BipModalHeader {
  protected readonly locale = injectBipLocale();

  protected readonly context = (() => {
    const ctx = inject(BIP_MODAL_CONTEXT, { optional: true });
    if (!ctx) {
      throw new Error('<bip-modal-header> debe usarse dentro de <bip-modal>');
    }
    return ctx;
  })();
}
