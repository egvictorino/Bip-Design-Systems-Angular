import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { injectBipLocale } from '@bip-design-systems/angular/core';
import { BipToastItemComponent } from './toast-item.component';
import { BipToast } from './toast.service';
import type { BipToastPosition } from './toast.types';

const TOAST_GAP = 12;
const PEEK_PX = 14;
const SCALE_STEP = 0.05;
const DEFAULT_ITEM_HEIGHT = 80;
/** El frente del stack (el toast más nuevo) y hasta 2 más por detrás se ven; el resto queda oculto (opacity 0). */
const MAX_VISIBLE_IN_STACK = 3;

const POSITION_CLASS: Record<BipToastPosition, string> = {
  'top-left': 'bip-toast-region--top-left',
  'top-center': 'bip-toast-region--top-center',
  'top-right': 'bip-toast-region--top-right',
  'bottom-left': 'bip-toast-region--bottom-left',
  'bottom-center': 'bip-toast-region--bottom-center',
  'bottom-right': 'bip-toast-region--bottom-right',
};

/**
 * Pila visual de toasts: colapsada muestra solo el frente con un "peek" de los de atrás; en
 * hover se expande mostrando todos apilados verticalmente. Puerto directo de `ToastStack`
 * (React) — mismas constantes (`TOAST_GAP`/`PEEK_PX`/`SCALE_STEP`) para el mismo look & feel.
 * Vive dentro del overlay que crea `BipToast` (`ComponentPortal`, vía `BipOverlay`).
 */
@Component({
  selector: 'bip-toast-region',
  standalone: true,
  imports: [BipToastItemComponent],
  templateUrl: './toast-region.component.html',
  styleUrl: './toast-region.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BipToastRegion {
  protected readonly locale = injectBipLocale();
  protected readonly toastService = inject(BipToast);

  protected readonly items = this.toastService.items;
  protected readonly isExpanded = signal(false);
  private readonly heights = signal<Record<number, number>>({});

  protected readonly positionClass = computed(() => POSITION_CLASS[this.toastService.position()]);
  protected readonly isBottom = computed(() => this.toastService.position().startsWith('bottom'));

  protected readonly frontHeight = computed(() => {
    const items = this.items();
    if (items.length === 0) return DEFAULT_ITEM_HEIGHT;
    return this.heights()[items[items.length - 1].id] ?? DEFAULT_ITEM_HEIGHT;
  });

  protected readonly expandedHeight = computed(() => {
    const items = this.items();
    const heights = this.heights();
    return (
      items.reduce((sum, item) => sum + (heights[item.id] ?? DEFAULT_ITEM_HEIGHT), 0) +
      Math.max(0, items.length - 1) * TOAST_GAP
    );
  });

  protected readonly containerHeight = computed(() =>
    this.isExpanded() ? this.expandedHeight() : this.frontHeight()
  );

  /** `cumFromFront[i]` = suma de alturas (+ gap) de todos los toasts más nuevos que `items()[i]`. */
  private readonly cumFromFront = computed(() => {
    const items = this.items();
    const heights = this.heights();
    const cum: number[] = new Array(items.length).fill(0);
    for (let i = items.length - 2; i >= 0; i--) {
      cum[i] = cum[i + 1] + (heights[items[i + 1].id] ?? DEFAULT_ITEM_HEIGHT) + TOAST_GAP;
    }
    return cum;
  });

  constructor() {
    // Limpia alturas de toasts ya removidos — evita que el mapa crezca indefinidamente.
    effect(() => {
      const ids = new Set(this.items().map((item) => item.id));
      const current = this.heights();
      const stale = Object.keys(current).filter((id) => !ids.has(Number(id)));
      if (stale.length > 0) {
        const next = { ...current };
        for (const id of stale) delete next[Number(id)];
        this.heights.set(next);
      }
    });
  }

  protected onMouseEnter(): void {
    this.isExpanded.set(true);
  }

  protected onMouseLeave(): void {
    this.isExpanded.set(false);
  }

  protected onHeightChange(id: number, height: number): void {
    this.heights.update((prev) => (prev[id] === height ? prev : { ...prev, [id]: height }));
  }

  protected fromFront(arrayIdx: number): number {
    return this.items().length - 1 - arrayIdx;
  }

  protected wrapperStyle(arrayIdx: number): Record<string, string> {
    const fromFront = this.fromFront(arrayIdx);
    const isBottom = this.isBottom();
    const edge = isBottom ? 'bottom' : 'top';
    const zIndex = String(this.items().length - fromFront);

    if (this.isExpanded()) {
      const offset = this.cumFromFront()[arrayIdx] ?? 0;
      return {
        [edge]: '0px',
        'z-index': zIndex,
        transform: `translateY(${isBottom ? -offset : offset}px) scale(1)`,
        opacity: '1',
        'pointer-events': 'auto',
      };
    }

    const isHidden = fromFront >= MAX_VISIBLE_IN_STACK;
    return {
      [edge]: '0px',
      'z-index': zIndex,
      transform: `translateY(${isBottom ? -(fromFront * PEEK_PX) : fromFront * PEEK_PX}px) scale(${1 - fromFront * SCALE_STEP})`,
      opacity: isHidden ? '0' : String(1 - fromFront * 0.1),
      'pointer-events': fromFront === 0 ? 'auto' : 'none',
    };
  }

  protected onItemDismissed(id: number): void {
    this.toastService.dismiss(id);
  }
}
