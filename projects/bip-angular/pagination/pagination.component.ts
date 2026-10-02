import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input, numberAttribute, output } from '@angular/core';
import { injectBipLocale } from '@bip-design-systems/angular/core';
import { getPageRange } from './pagination-range';

/**
 * Totalmente controlado (sin modelo no-controlado) — igual que la referencia React: no hay
 * `defaultPage`, el consumidor es dueño del estado y escucha `(pageChange)`. Sin partes
 * compuestas ni contexto. No renderiza nada (`@if` envuelve todo el template) cuando
 * `totalPages() <= 1`, igual que el `return null` de React.
 */
@Component({
  selector: 'bip-pagination',
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'bip-pagination', style: 'display: contents' },
})
export class BipPagination {
  protected readonly locale = injectBipLocale();

  readonly page = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly siblingCount = input(1, { transform: numberAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly pageChange = output<number>();

  protected readonly pageRange = computed(() => getPageRange(this.page(), this.totalPages(), this.siblingCount()));

  protected goTo(target: number): void {
    if (this.disabled() || target < 1 || target > this.totalPages() || target === this.page()) {
      return;
    }
    this.pageChange.emit(target);
  }
}
