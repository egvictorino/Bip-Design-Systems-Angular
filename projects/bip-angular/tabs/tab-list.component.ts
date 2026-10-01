import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  OnDestroy,
  computed,
  contentChildren,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { FocusKeyManager } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { toSignal } from '@angular/core/rxjs-interop';
import { BIP_TABS_CONTEXT } from './tabs-context';
import { BipTab } from './tab.component';

/**
 * `role="tablist"` + navegación con `FocusKeyManager` (↑↓ o ←→ según `orientation`, con wrap,
 * Home/End, saltando los tabs disabled) — las flechas solo mueven el foco (activación manual,
 * igual que la referencia React); clic/Enter/Espacio sobre el tab activa. El indicador animado
 * (variant con `animated`) mide la posición del tab activo con `getBoundingClientRect()` pero
 * la expresa como `inset-inline-start` (no `left`), invirtiendo el cálculo según
 * `Directionality` — así queda correcto en RTL sin depender de una propiedad física.
 */
@Component({
  selector: 'bip-tab-list',
  standalone: true,
  template: `
    <ng-content />
    @if (context.animated() && context.orientation() === 'horizontal') {
      <span
        class="bip-tab-indicator"
        [style.width.px]="indicatorWidth()"
        [style.insetInlineStart.px]="indicatorOffset()"
      ></span>
    }
  `,
  styleUrl: './tab-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'bip-tab-list',
    '[class.bip-tab-list--vertical]': "context.orientation() === 'vertical'",
    role: 'tablist',
    '[attr.aria-orientation]': 'context.orientation()',
    '(keydown)': 'onKeydown($event)',
    '(focusin)': 'onFocusIn($event)',
  },
})
export class BipTabList implements OnDestroy {
  protected readonly context = (() => {
    const ctx = inject(BIP_TABS_CONTEXT, { optional: true });
    if (!ctx) {
      throw new Error('<bip-tab-list> debe usarse dentro de <bip-tabs>');
    }
    return ctx;
  })();

  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly injector = inject(Injector);
  private readonly directionality = inject(Directionality);
  private readonly dir = toSignal(this.directionality.change, { initialValue: this.directionality.value });

  private readonly items = contentChildren(BipTab, { descendants: true });
  private keyManager: FocusKeyManager<BipTab> | null = null;

  protected readonly indicatorOffset = signal(0);
  protected readonly indicatorWidth = signal(0);

  constructor() {
    effect(() => {
      const items = this.items();
      const orientation = this.context.orientation();
      const dir = this.dir();
      untracked(() => this.setupKeyManager(items, orientation, dir));
    });

    effect(() => {
      this.context.activeValue();
      this.items();
      untracked(() => queueMicrotask(() => this.updateIndicator()));
    });
  }

  ngOnDestroy(): void {
    this.keyManager?.destroy();
  }

  protected onKeydown(event: KeyboardEvent): void {
    this.keyManager?.onKeydown(event);
  }

  /** Mantiene sincronizado el índice activo del `FocusKeyManager` cuando el foco llega por
   * clic/Tab (no por sus propias flechas) — si no, la siguiente pulsación de flecha movería el
   * foco relativo al último índice que el propio manager movió, no al elemento realmente
   * enfocado. */
  protected onFocusIn(event: FocusEvent): void {
    const target = event.target as HTMLElement;
    const item = this.items().find((tab) => tab.elementRef.nativeElement === target);
    if (item) {
      this.keyManager?.updateActiveItem(item);
    }
  }

  private setupKeyManager(
    items: readonly BipTab[],
    orientation: 'horizontal' | 'vertical',
    dir: 'ltr' | 'rtl'
  ): void {
    this.keyManager?.destroy();
    const manager = new FocusKeyManager(computed(() => [...items]), this.injector)
      .withWrap()
      .withHomeAndEnd()
      .skipPredicate((item) => item.isDisabled);
    if (orientation === 'vertical') {
      manager.withVerticalOrientation();
    } else {
      manager.withHorizontalOrientation(dir);
    }
    this.keyManager = manager;
  }

  private updateIndicator(): void {
    const activeItem = this.items().find((item) => item.isActive());
    if (!activeItem) return;

    const containerRect = this.elementRef.nativeElement.getBoundingClientRect();
    const itemRect = activeItem.elementRef.nativeElement.getBoundingClientRect();

    const isRtl = this.directionality.value === 'rtl';
    this.indicatorOffset.set(isRtl ? containerRect.right - itemRect.right : itemRect.left - containerRect.left);
    this.indicatorWidth.set(itemRect.width);
  }
}
