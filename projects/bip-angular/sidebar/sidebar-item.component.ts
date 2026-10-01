import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, booleanAttribute, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { injectBipLocale } from '@bip-design-systems/angular/core';
import { BipTooltip } from '@bip-design-systems/angular/tooltip';
import { BIP_SIDEBAR_CONTEXT } from './sidebar-context';
import { navigateSidebarItems } from './sidebar-navigation';

/**
 * `label` es un input explícito (no `children` como en React) — Angular no puede leer el texto
 * de contenido proyectado como string de forma fiable, y `label` hace de nombre accesible,
 * tooltip (modo colapsado) y texto visible (expandido) a la vez. El tooltip se aplica siempre
 * (no solo colapsado): simplifica de 6 ramas de template a 3 sin perder el caso que importa
 * (colapsado sí necesita el tooltip); en expandido es redundante con el texto visible pero no
 * incorrecto. Flechas ↑↓/Home/End navegan dentro de todo el `<bip-sidebar>` (clamp, no wrap —
 * fiel a `navigateSidebarItems()` de React).
 */
@Component({
  selector: 'bip-sidebar-item',
  standalone: true,
  imports: [RouterLink, NgTemplateOutlet, BipTooltip],
  templateUrl: './sidebar-item.component.html',
  styleUrl: './sidebar-item.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BipSidebarItem {
  protected readonly locale = injectBipLocale();
  private readonly document = inject(DOCUMENT);

  protected readonly context = (() => {
    const ctx = inject(BIP_SIDEBAR_CONTEXT, { optional: true });
    if (!ctx) {
      throw new Error('<bip-sidebar-item> debe usarse dentro de <bip-sidebar>');
    }
    return ctx;
  })();

  readonly label = input.required<string>();
  readonly href = input<string | undefined>(undefined);
  readonly routerLink = input<string | unknown[] | undefined>(undefined);
  readonly queryParams = input<Record<string, unknown> | undefined>(undefined);
  readonly active = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly badge = input<number | string | undefined>(undefined);

  protected readonly accessibleLabel = computed(() => {
    const badge = this.badge();
    if (!this.context.isCollapsed() || badge === undefined) return this.label();
    const count = typeof badge === 'number' ? badge : Number(badge);
    return `${this.label()}${Number.isFinite(count) ? this.locale().sidebar.badgeCount(count) : ''}`;
  });

  protected onClick(event: MouseEvent): void {
    if (this.disabled()) {
      event.preventDefault();
      return;
    }
    this.context.closeMobile();
  }

  protected onKeydown(event: KeyboardEvent): void {
    navigateSidebarItems(event, this.context.sidebarId, this.document);
  }
}
