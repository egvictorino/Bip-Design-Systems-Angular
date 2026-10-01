import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { BIP_SIDEBAR_CONTEXT } from './sidebar-context';

/**
 * No renderiza nada cuando el sidebar está colapsado (igual que la referencia React) — el
 * espacio del riel de iconos es demasiado angosto para una marca con texto.
 */
@Component({
  selector: 'bip-sidebar-brand',
  standalone: true,
  imports: [NgTemplateOutlet],
  template: `
    @if (!context.isCollapsed()) {
      @if (href()) {
        <a class="bip-sidebar-brand" [href]="href()"><ng-container [ngTemplateOutlet]="content" /></a>
      } @else {
        <span class="bip-sidebar-brand"><ng-container [ngTemplateOutlet]="content" /></span>
      }
    }

    <ng-template #content>
      <ng-content />
    </ng-template>
  `,
  styleUrl: './sidebar-brand.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BipSidebarBrand {
  protected readonly context = (() => {
    const ctx = inject(BIP_SIDEBAR_CONTEXT, { optional: true });
    if (!ctx) {
      throw new Error('<bip-sidebar-brand> debe usarse dentro de <bip-sidebar>');
    }
    return ctx;
  })();

  readonly href = input<string | undefined>(undefined);
}
