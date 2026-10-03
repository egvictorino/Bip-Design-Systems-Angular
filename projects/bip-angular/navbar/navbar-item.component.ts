import { ChangeDetectionStrategy, Component, booleanAttribute, inject, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BIP_NAVBAR_CONTEXT } from './navbar-context';

/**
 * Elemento (no atributo) porque encapsula estructura (ícono + label proyectado) y decide por sí
 * mismo qué tag nativo renderizar: `<a>` con `routerLink` si se provee, `<a>` con `href` plano
 * si no, o `<button>` si no hay ninguno. `active` es siempre explícito (el consumidor lo calcula
 * o usa `routerLinkActive` sobre el `routerLink`) — igual que la referencia React, que tampoco
 * tiene auto-detección de ruta activa. `data-navbar-item` identifica el elemento focusable real
 * (no el wrapper `role="listitem"`) para la navegación por flechas y el enfoque inicial al abrir
 * el panel móvil. El wrapper es un `<div role="listitem">`, no un `<li>` real: axe exige que un
 * `<ul>`/`[role=list]` contenga SOLO `<li>` como hijo directo, pero `<bip-navbar-item>` se
 * interpone entre `<bip-navbar-nav>` (su `[role=list]`) y el wrapper — con tags nativos
 * `<ul>`/`<li>` eso viola esa regla de axe aun con `display: contents` en el host (afecta el
 * layout, no la validez de la estructura DOM que la regla revisa). `role="list"`/`role="listitem"`
 * en vez de las etiquetas nativas evita el chequeo de validez HTML por completo, conservando la
 * semántica de lista para lectores de pantalla.
 * El contenido proyectado (ícono + label) vive en un único `<ng-template>` reutilizado vía
 * `ngTemplateOutlet` en las tres ramas — `<ng-content>` solo puede proyectar cada nodo una vez,
 * así que repetirlo literalmente en cada rama del `@if/@else if/@else` dejaría vacías las que no
 * fueran la primera en aparecer en el template.
 */
@Component({
  selector: 'bip-navbar-item',
  imports: [RouterLink, NgTemplateOutlet],
  templateUrl: './navbar-item.component.html',
  styleUrl: './navbar-item.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
})
export class BipNavbarItem {
  protected readonly context = (() => {
    const ctx = inject(BIP_NAVBAR_CONTEXT, { optional: true });
    if (!ctx) {
      throw new Error('<bip-navbar-item> debe usarse dentro de <bip-navbar>');
    }
    return ctx;
  })();

  readonly href = input<string | undefined>(undefined);
  readonly routerLink = input<string | unknown[] | undefined>(undefined);
  readonly queryParams = input<Record<string, unknown> | undefined>(undefined);
  readonly active = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly ariaLabel = input<string | undefined>(undefined);

  protected onClick(event: MouseEvent): void {
    if (this.disabled()) {
      event.preventDefault();
      return;
    }
    this.context.closeMobile();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;

    const target = event.currentTarget as HTMLElement;
    const container = target.closest('[data-navbar-items-container]');
    if (!container) return;

    const items = Array.from(
      container.querySelectorAll<HTMLElement>(
        '[data-navbar-item]:not([aria-disabled="true"]):not(:disabled)'
      )
    );
    const currentIndex = items.indexOf(target);
    if (currentIndex === -1) return;

    let nextIndex = currentIndex;
    if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % items.length;
    else if (event.key === 'ArrowLeft')
      nextIndex = (currentIndex - 1 + items.length) % items.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = items.length - 1;

    event.preventDefault();
    items[nextIndex]?.focus();
  }
}
