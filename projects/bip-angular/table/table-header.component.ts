import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { BIP_TABLE_CONTEXT } from './table-context';
import type { BipTableAlign, BipTableSortDirection } from './table.types';

const ARIA_SORT: Record<Exclude<BipTableSortDirection, null> | 'none', 'ascending' | 'descending' | 'none'> = {
  asc: 'ascending',
  desc: 'descending',
  none: 'none',
};

/**
 * Mejora un `<th>` nativo. `sortable` añade `tabindex=0`+`aria-sort`+manejo de Enter/Espacio
 * (el `<th>` en sí es el control interactivo, no un botón anidado — igual que la referencia
 * React). El ícono de orden es puramente decorativo (`aria-hidden`).
 */
@Component({
  selector: 'th[bipTableHeader]',
  standalone: true,
  template: `
    <span [class.bip-table-header-sortable-inner]="sortable()">
      <ng-content />
      @if (sortable()) {
        <svg viewBox="0 0 16 16" fill="none" class="bip-table-sort-icon" [class.bip-table-sort-icon--active]="sortDirection()" aria-hidden="true">
          @switch (sortDirection()) {
            @case ('asc') {
              <path d="M8 4.5L3.5 9.5h9L8 4.5z" fill="currentColor" />
            }
            @case ('desc') {
              <path d="M8 11.5L3.5 6.5h9L8 11.5z" fill="currentColor" />
            }
            @default {
              <path d="M8 4.5L5 8h6L8 4.5z" fill="currentColor" />
              <path d="M8 11.5L5 8h6L8 11.5z" fill="currentColor" />
            }
          }
        </svg>
      }
    </span>
  `,
  styleUrl: './table-header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'bip-table-header',
    '[class]': 'hostClasses()',
    '[attr.scope]': 'scope()',
    '[attr.aria-sort]': 'ariaSort()',
    '[attr.tabindex]': 'sortable() ? 0 : null',
    '(click)': 'onClick()',
    '(keydown)': 'onKeyDown($event)',
  },
})
export class BipTableHeader {
  private readonly context = (() => {
    const ctx = inject(BIP_TABLE_CONTEXT, { optional: true });
    if (!ctx) {
      throw new Error('<th bipTableHeader> debe usarse dentro de <bip-table>');
    }
    return ctx;
  })();

  readonly sortable = input(false);
  readonly sortDirection = input<BipTableSortDirection>(null);
  readonly align = input<BipTableAlign>('start');
  readonly scope = input<'col' | 'row' | 'colgroup' | 'rowgroup'>('col');

  readonly sort = output<void>();

  protected readonly ariaSort = computed(() =>
    this.sortable() ? ARIA_SORT[this.sortDirection() ?? 'none'] : null
  );

  protected readonly hostClasses = computed(() => {
    const classes = [
      this.context.compact() ? 'bip-table-header--compact' : 'bip-table-header--normal',
      `bip-table-align-${this.align()}`,
    ];
    if (this.sortable()) classes.push('bip-table-header--sortable');
    return classes.join(' ');
  });

  /**
   * Nunca `'(click)': 'sortable() && sort.emit()'` en el host: cuando `sortable()` es `false`
   * esa expresión vale literalmente `false`, y Angular interpreta que un binding de evento que
   * evalúa a `false` pide `preventDefault()` — cancelando la acción por defecto del click en
   * CUALQUIER control interactivo proyectado dentro de un `<th>` no ordenable (p. ej. el
   * checkbox de "seleccionar todo" de `BipDataTable`, cuyo toggle nativo quedaba silenciosamente
   * cancelado). Un método que no retorna nada evita el problema de raíz.
   */
  protected onClick(): void {
    if (this.sortable()) this.sort.emit();
  }

  protected onKeyDown(event: KeyboardEvent): void {
    if (this.sortable() && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      this.sort.emit();
    }
  }
}
