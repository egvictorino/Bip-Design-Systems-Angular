import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { BIP_NAVBAR_CONTEXT } from './navbar-context';

/**
 * `<a>` si trae `href` (y cierra el panel móvil al hacer clic, como cualquier navegación),
 * `<span>` si no — igual que la referencia React. El contenido proyectado vive en un único
 * `<ng-template>` reutilizado vía `ngTemplateOutlet` en ambas ramas: `<ng-content>` solo puede
 * proyectar cada nodo una vez, así que repetirlo literalmente en los dos branches del `@if`
 * dejaría uno de los dos vacío.
 */
@Component({
  selector: 'bip-navbar-brand',
  standalone: true,
  imports: [NgTemplateOutlet],
  template: `
    @if (href()) {
      <a class="bip-navbar-brand" [href]="href()" (click)="context.closeMobile()">
        <ng-container [ngTemplateOutlet]="content" />
      </a>
    } @else {
      <span class="bip-navbar-brand">
        <ng-container [ngTemplateOutlet]="content" />
      </span>
    }

    <ng-template #content>
      <ng-content />
    </ng-template>
  `,
  styleUrl: './navbar-brand.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
})
export class BipNavbarBrand {
  protected readonly context = (() => {
    const ctx = inject(BIP_NAVBAR_CONTEXT, { optional: true });
    if (!ctx) {
      throw new Error('<bip-navbar-brand> debe usarse dentro de <bip-navbar>');
    }
    return ctx;
  })();

  readonly href = input<string | undefined>(undefined);
}
