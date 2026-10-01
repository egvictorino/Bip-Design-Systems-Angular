import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, model } from '@angular/core';
import { A11yModule } from '@angular/cdk/a11y';
import { BipIdGenerator, injectBipLocale } from '@bip-design-systems/angular/core';
import { BIP_SIDEBAR_CONTEXT, type BipSidebarContext } from './sidebar-context';

export type BipSidebarVariant = 'light' | 'dark' | 'primary';

const VARIANT_CLASS: Record<BipSidebarVariant, string> = {
  light: 'bip-sidebar--light',
  dark: 'bip-sidebar--dark',
  primary: 'bip-sidebar--primary',
};

/**
 * `open` (drawer móvil) y `collapsed` (modo riel de iconos en escritorio) son ejes
 * independientes, ambos `model()` — controlado/no-controlado en uno solo, como el resto de la
 * librería. Escape cierra el drawer móvil; el foco dentro de él queda atrapado con
 * `cdkTrapFocus` (ver `sidebar.component.html`) solo mientras está abierto — a diferencia de la
 * referencia React, que no atrapaba el foco del drawer móvil en absoluto.
 */
@Component({
  selector: 'bip-sidebar',
  standalone: true,
  imports: [A11yModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: BIP_SIDEBAR_CONTEXT, useExisting: BipSidebar }],
  host: {
    class: 'bip-sidebar',
    '[class]': 'hostClasses()',
    role: 'navigation',
    '[attr.id]': 'sidebarId',
    '[attr.aria-label]': 'locale().sidebar.nav',
  },
})
export class BipSidebar implements BipSidebarContext {
  protected readonly locale = injectBipLocale();
  private readonly document = inject(DOCUMENT);

  readonly open = model(false);
  readonly isMobileOpen = this.open;

  readonly collapsed = model(false);
  readonly isCollapsed = this.collapsed;

  readonly variant = input<BipSidebarVariant>('light');

  readonly sidebarId = inject(BipIdGenerator).next('bip-sidebar');

  protected readonly hostClasses = computed(() => VARIANT_CLASS[this.variant()]);

  constructor() {
    effect((onCleanup) => {
      if (!this.isMobileOpen()) return;
      const onKeydown = (event: KeyboardEvent): void => {
        if (event.key === 'Escape') this.closeMobile();
      };
      this.document.addEventListener('keydown', onKeydown);
      onCleanup(() => this.document.removeEventListener('keydown', onKeydown));
    });
  }

  toggleCollapsed(): void {
    this.collapsed.update((value) => !value);
  }

  closeMobile(): void {
    this.open.set(false);
  }

  protected onOverlayClick(): void {
    this.closeMobile();
  }
}
