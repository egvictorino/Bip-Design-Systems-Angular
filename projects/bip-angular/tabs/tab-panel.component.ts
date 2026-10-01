import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { BIP_TABS_CONTEXT } from './tabs-context';

/**
 * `id`/`aria-labelledby` se calculan con la misma fórmula que `BipTab` (`instanceId` +
 * `value`) — no hay registro entre ambos, ambos derivan el mismo id de forma independiente.
 * Contenido siempre presente en el DOM (`hidden` nativo oculta el panel inactivo, en vez de
 * `@if`), igual que la referencia React.
 */
@Component({
  selector: 'bip-tab-panel',
  standalone: true,
  template: `<ng-content />`,
  styleUrl: './tab-panel.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'bip-tab-panel',
    role: 'tabpanel',
    tabindex: '0',
    '[id]': 'panelId()',
    '[attr.aria-labelledby]': 'tabId()',
    '[hidden]': '!isActive()',
  },
})
export class BipTabPanel {
  private readonly context = (() => {
    const ctx = inject(BIP_TABS_CONTEXT, { optional: true });
    if (!ctx) {
      throw new Error('<bip-tab-panel> debe usarse dentro de <bip-tabs>');
    }
    return ctx;
  })();

  readonly value = input.required<string>();

  readonly isActive = computed(() => this.context.activeValue() === this.value());
  readonly tabId = computed(() => `${this.context.instanceId}-tab-${this.value()}`);
  readonly panelId = computed(() => `${this.context.instanceId}-panel-${this.value()}`);
}
