import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  inject,
  input,
} from '@angular/core';
import { injectBipLocale } from '@bip-design-systems/angular/core';
import { BipSkeleton } from '@bip-design-systems/angular/skeleton';

export type BipCardVariant = 'elevated' | 'outlined' | 'flat';
export type BipCardPadding = 'none' | 'sm' | 'md' | 'lg';
export type BipCardRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl';

const VARIANT_CLASS: Record<BipCardVariant, string> = {
  elevated: 'bip-card--elevated',
  outlined: 'bip-card--outlined',
  flat: 'bip-card--flat',
};

const PADDING_CLASS: Record<BipCardPadding, string> = {
  none: 'bip-card--padding-none',
  sm: 'bip-card--padding-sm',
  md: 'bip-card--padding-md',
  lg: 'bip-card--padding-lg',
};

const RADIUS_CLASS: Record<BipCardRadius, string> = {
  none: 'bip-card--radius-none',
  sm: 'bip-card--radius-sm',
  md: 'bip-card--radius-md',
  lg: 'bip-card--radius-lg',
  xl: 'bip-card--radius-xl',
};

/**
 * Contenedor de superficie; compón con `<bip-card-header>`/`<bip-card-body>`/
 * `<bip-card-footer>`/`<bip-card-media>` proyectados. `clickable` añade `role="button"` +
 * navegación por teclado (Enter/Espacio disparan un `click()` nativo sobre el host, que
 * cualquier `(click)` del consumidor captura igual que un clic real).
 */
@Component({
  selector: 'bip-card',
  imports: [BipSkeleton],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'bip-card',
    '[class]': 'hostClasses()',
    '[attr.role]': 'clickable() ? "button" : null',
    '[attr.tabindex]': 'clickable() ? 0 : null',
    '(keydown)': 'onKeydown($event)',
  },
})
export class BipCard {
  private readonly locale = injectBipLocale();
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly variant = input<BipCardVariant>('elevated');
  readonly padding = input<BipCardPadding>('none');
  readonly radius = input<BipCardRadius>('lg');
  readonly fullWidth = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly clickable = input(false, { transform: booleanAttribute });

  protected readonly loadingLabel = computed(() => this.locale().card.loading);

  protected readonly hostClasses = computed(() =>
    [
      VARIANT_CLASS[this.variant()],
      RADIUS_CLASS[this.radius()],
      PADDING_CLASS[this.padding()],
      this.fullWidth() ? 'bip-card--full-width' : '',
      this.clickable() ? 'bip-card--clickable' : '',
    ]
      .filter(Boolean)
      .join(' ')
  );

  protected onKeydown(event: KeyboardEvent): void {
    if (!this.clickable()) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.elementRef.nativeElement.click();
    }
  }
}
