import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { BipIdGenerator, injectBipLocale } from '@bip-design-systems/angular/core';
import { BipTooltip } from '@bip-design-systems/angular/tooltip';
import { BIP_SIDEBAR_CONTEXT } from './sidebar-context';
import { navigateSidebarItems } from './sidebar-navigation';

/**
 * `defaultOpen` es puramente no-controlado (como la referencia React: no hay `open`/
 * `onOpenChange`) — se lee una sola vez al construir. Colapsado: solo el ícono envuelto en
 * `[bipTooltip]`, sin lista visible en absoluto (no flyout) — igual que React. Se auto-cierra
 * cuando el sidebar colapsa.
 */
@Component({
  selector: 'bip-sidebar-submenu',
  imports: [BipTooltip],
  templateUrl: './sidebar-submenu.component.html',
  styleUrl: './sidebar-submenu.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'bip-sidebar-submenu' },
})
export class BipSidebarSubMenu {
  protected readonly locale = injectBipLocale();
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly document = inject(DOCUMENT);

  protected readonly context = (() => {
    const ctx = inject(BIP_SIDEBAR_CONTEXT, { optional: true });
    if (!ctx) {
      throw new Error('<bip-sidebar-submenu> debe usarse dentro de <bip-sidebar>');
    }
    return ctx;
  })();

  readonly label = input.required<string>();
  readonly defaultOpen = input(false);
  readonly badge = input<number | string | undefined>(undefined);

  protected readonly isOpen = signal(false);
  protected readonly subMenuId = inject(BipIdGenerator).next('bip-sidebar-submenu');

  constructor() {
    // Lee `defaultOpen` una sola vez — no se puede sembrar `isOpen` directamente desde un
    // inicializador de campo (`signal(this.defaultOpen())`): el valor enlazado por el consumidor
    // todavía no se aplicó a esa altura del ciclo de vida (los inputs de señal se escriben
    // después de que corren los inicializadores), así que siempre se leería el default del
    // propio `input()`. Este `effect()` no lee nada reactivo fuera de `untracked()`, así que
    // Angular lo ejecuta exactamente una vez.
    effect(() => {
      untracked(() => this.isOpen.set(this.defaultOpen()));
    });

    effect(() => {
      const collapsed = this.context.isCollapsed();
      untracked(() => {
        if (collapsed) this.isOpen.set(false);
      });
    });

    // Escape cierra el submenú y devuelve el foco a su trigger sin importar qué item interno
    // tenga el foco — por eso es un listener a nivel documento (como el Escape de BipSidebar),
    // no un (keydown) solo en el propio botón trigger.
    effect((onCleanup) => {
      if (!this.isOpen() || this.context.isCollapsed()) return;
      const onKeydown = (event: KeyboardEvent): void => {
        if (event.key !== 'Escape') return;
        this.isOpen.set(false);
        const trigger: HTMLElement | null =
          this.elementRef.nativeElement.querySelector('[data-sidebar-item]');
        trigger?.focus();
      };
      this.document.addEventListener('keydown', onKeydown);
      onCleanup(() => this.document.removeEventListener('keydown', onKeydown));
    });
  }

  protected toggle(): void {
    this.isOpen.update((value) => !value);
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    navigateSidebarItems(event, this.context.sidebarId, this.document);
  }
}
