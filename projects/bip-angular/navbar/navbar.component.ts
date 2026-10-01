import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { BipIdGenerator, breakpointQuery, injectBipLocale, mediaQuery } from '@bip-design-systems/angular/core';
import { BIP_NAVBAR_CONTEXT, type BipNavbarContext } from './navbar-context';

export type BipNavbarVariant = 'default' | 'elevated' | 'transparent';

const VARIANT_CLASS: Record<BipNavbarVariant, string> = {
  default: 'bip-navbar--default',
  elevated: 'bip-navbar--elevated',
  transparent: 'bip-navbar--transparent',
};

/**
 * El estado de apertura del panel móvil es puramente interno (sin input/output expuesto, igual
 * que la referencia React: no hay `open`/`onOpenChange`). A diferencia de React, que mantiene
 * dos árboles de nav/actions (uno de escritorio, uno "levantado" por efecto hacia el panel
 * móvil) para duplicar los mismos items, aquí se proyecta **una sola vez** dentro de un panel
 * cuyo layout cambia por CSS según el ancho — el panel es simplemente la barra horizontal en
 * desktop y un dropdown vertical en mobile. `inert` solo se activa por debajo del breakpoint
 * `md` y con el panel cerrado (en desktop el panel siempre es interactivo).
 */
@Component({
  selector: 'bip-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: BIP_NAVBAR_CONTEXT, useExisting: BipNavbar }],
  host: {
    class: 'bip-navbar',
    '[class]': 'hostClasses()',
    role: 'navigation',
    '[attr.aria-label]': 'locale().navbar.mainNav',
  },
})
export class BipNavbar implements BipNavbarContext {
  protected readonly locale = injectBipLocale();
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly document = inject(DOCUMENT);

  readonly variant = input<BipNavbarVariant>('default');

  private readonly isMobileOpenSignal = signal(false);
  readonly isMobileOpen = this.isMobileOpenSignal.asReadonly();

  readonly mobileMenuId = inject(BipIdGenerator).next('bip-navbar-menu');
  readonly toggleButtonId = inject(BipIdGenerator).next('bip-navbar-toggle');

  protected readonly isDesktop = mediaQuery(breakpointQuery('md'));

  protected readonly hostClasses = computed(() => VARIANT_CLASS[this.variant()]);

  constructor() {
    // Escape cierra el panel móvil.
    effect((onCleanup) => {
      if (!this.isMobileOpen()) return;
      const onKeydown = (event: KeyboardEvent): void => {
        if (event.key === 'Escape') this.closeMobile();
      };
      this.document.addEventListener('keydown', onKeydown);
      onCleanup(() => this.document.removeEventListener('keydown', onKeydown));
    });

    // Clic fuera del navbar cierra el panel móvil.
    effect((onCleanup) => {
      if (!this.isMobileOpen()) return;
      const onPointerDown = (event: PointerEvent): void => {
        const target = event.target as Node | null;
        if (target && !this.elementRef.nativeElement.contains(target)) {
          this.closeMobile();
        }
      };
      this.document.addEventListener('pointerdown', onPointerDown);
      onCleanup(() => this.document.removeEventListener('pointerdown', onPointerDown));
    });

    // Foco: al abrir, va al primer item del panel; al cerrar, vuelve al botón de hamburguesa.
    let wasOpen = false;
    effect(() => {
      const open = this.isMobileOpen();
      untracked(() => {
        if (open && !wasOpen) {
          setTimeout(() => {
            const firstItem: HTMLElement | null = this.elementRef.nativeElement.querySelector('[data-navbar-item]');
            firstItem?.focus();
          });
        } else if (!open && wasOpen) {
          this.document.getElementById(this.toggleButtonId)?.focus();
        }
        wasOpen = open;
      });
    });
  }

  toggleMobile(): void {
    this.isMobileOpenSignal.update((value) => !value);
  }

  closeMobile(): void {
    this.isMobileOpenSignal.set(false);
  }
}
