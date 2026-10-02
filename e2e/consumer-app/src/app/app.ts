import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { BipThemeProvider } from '@bip-design-systems/angular/core';
import { BipButton } from '@bip-design-systems/angular/button';
import { BipModal, BipModalBody } from '@bip-design-systems/angular/modal';

/**
 * Smoke test del tarball publicado — e2e/consumer.spec.ts verifica, contra el HTML servido
 * por Express (src/server.ts), que:
 *  - el bundle resuelve limpio (sin "require is not defined" ni errores de módulo ESM-only),
 *  - bip.css se aplicó de verdad (background-color real del botón, no el default nativo),
 *  - el eje theme sobrevive el empaquetado (--radius-field distinto entre square/rounded),
 *  - un overlay (BipOverlay) hereda el tema/esquema del provider más cercano, no el de <html>.
 */
@Component({
  selector: 'app-root',
  imports: [BipThemeProvider, BipButton, BipModal, BipModalBody],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <bip-theme-provider theme="square">
      <button bipButton variant="primary" data-testid="button-square">Square</button>
    </bip-theme-provider>

    <bip-theme-provider theme="rounded">
      <button bipButton variant="primary" data-testid="button-rounded">Rounded</button>
    </bip-theme-provider>

    <bip-theme-provider theme="rounded" colorScheme="dark">
      <button type="button" data-testid="open-modal" (click)="modalOpen.set(true)">
        Abrir modal
      </button>
      <bip-modal [(open)]="modalOpen" title="Modal de prueba">
        <bip-modal-body>
          <p data-testid="modal-content">Contenido del modal.</p>
        </bip-modal-body>
      </bip-modal>
    </bip-theme-provider>
  `,
})
export class App {
  protected readonly modalOpen = signal(false);
}
