import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  booleanAttribute,
  computed,
  contentChildren,
  effect,
  inject,
  input,
  numberAttribute,
  output,
  signal,
  untracked,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import {
  injectBipLocale,
  BipIdGenerator,
  BipVisuallyHidden,
} from '@bip-design-systems/angular/core';
import {
  BipTable,
  BipTableHead,
  BipTableBody,
  BipTableRow,
  BipTableHeader,
  BipTableCell,
} from '@bip-design-systems/angular/table';
import { BipPagination } from '@bip-design-systems/angular/pagination';
import { BipSkeleton } from '@bip-design-systems/angular/skeleton';
import { BipEmptyState } from '@bip-design-systems/angular/empty-state';
import { BipSearchInput } from '@bip-design-systems/angular/search-input';
import { BipCheckbox } from '@bip-design-systems/angular/checkbox';
import { BipButton } from '@bip-design-systems/angular/button';
import { BipClickOutside } from '@bip-design-systems/angular/core';
import { BipDataTableCell } from './data-table-cell.directive';
import { BipDataTableHeader } from './data-table-header.directive';
import type {
  BipDataTableBulkAction,
  BipDataTableCellContext,
  BipDataTableColumn,
  BipDataTableSortDirection,
} from './data-table.types';

/**
 * Columnas definidas con `<ng-template bipCell="key">`/`<ng-template bipHeader="key">`
 * proyectados (ver `data-table-cell.directive.ts`/`data-table-header.directive.ts`) en vez del
 * `render`/`header` por función de la referencia React — sin template para una key, la celda
 * cae al valor crudo de la fila ("—" si es `null`/`undefined`).
 *
 * Sin modelo controlado de selección/orden/página/búsqueda (igual que la referencia React):
 * todo vive en signals internas; el consumidor se entera vía `(selectionChange)`/`(sortChange)`/
 * `(pageChange)`/`(searched)` y, en `serverSide`, es dueño de volver a pasar `data()` ya
 * ordenada/filtrada/paginada.
 */
@Component({
  selector: 'bip-data-table',
  imports: [
    NgTemplateOutlet,
    BipTable,
    BipTableHead,
    BipTableBody,
    BipTableRow,
    BipTableHeader,
    BipTableCell,
    BipPagination,
    BipSkeleton,
    BipEmptyState,
    BipSearchInput,
    BipCheckbox,
    BipButton,
    BipClickOutside,
    BipVisuallyHidden,
  ],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'bip-data-table',
    '[attr.aria-label]': 'ariaLabel() || null',
    '[attr.role]': "ariaLabel() ? 'region' : null",
  },
})
export class BipDataTable<T = Record<string, unknown>> {
  protected readonly locale = injectBipLocale();
  protected readonly colPanelId = inject(BipIdGenerator).next('bip-data-table-col-panel');

  readonly columns = input.required<BipDataTableColumn<T>[]>();
  readonly data = input.required<T[]>();
  readonly pageSize = input(10, { transform: numberAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly emptyMessage = input<string | undefined>(undefined);
  readonly striped = input(false, { transform: booleanAttribute });
  readonly compact = input(false, { transform: booleanAttribute });
  readonly keyExtractor = input<((row: T, index: number) => string | number) | undefined>(
    undefined
  );
  /** Ver nota de `table-row.component.ts`/`handleRowClick`: Angular no detecta si `(rowClick)` tiene listeners. */
  readonly rowsClickable = input(false, { transform: booleanAttribute });

  readonly searchable = input(false, { transform: booleanAttribute });
  readonly searchKeys = input<string[] | undefined>(undefined);
  readonly searchPlaceholder = input<string | undefined>(undefined);

  readonly selectable = input(false, { transform: booleanAttribute });
  readonly bulkActions = input<BipDataTableBulkAction<T>[] | undefined>(undefined);

  readonly serverSide = input(false, { transform: booleanAttribute });
  readonly totalCount = input<number | undefined>(undefined);

  readonly columnVisibility = input(false, { transform: booleanAttribute });
  readonly defaultHiddenColumns = input<string[] | undefined>(undefined);

  readonly ariaLabel = input<string | undefined>(undefined);

  readonly rowClick = output<T>();
  readonly selectionChange = output<T[]>();
  readonly pageChange = output<number>();
  readonly sortChange = output<{ key: string | null; direction: BipDataTableSortDirection }>();
  readonly searched = output<string>();

  protected readonly cellTemplates = contentChildren(BipDataTableCell);
  protected readonly headerTemplates = contentChildren(BipDataTableHeader);

  private readonly sortKey = signal<string | null>(null);
  private readonly sortDirection = signal<BipDataTableSortDirection>(null);
  protected readonly currentPage = signal(1);
  protected readonly searchQuery = signal('');
  private readonly selectedKeys = signal<Set<string | number>>(new Set());
  private readonly visibleColumnKeysOverride = signal<Set<string> | null>(null);
  protected readonly colPanelOpen = signal(false);

  protected readonly effectiveVisibleColumnKeys = computed(() => {
    const override = this.visibleColumnKeysOverride();
    if (override) return override;
    const hidden = this.defaultHiddenColumns();
    return new Set(
      this.columns()
        .filter((col) => !hidden?.includes(col.key))
        .map((col) => col.key)
    );
  });

  protected readonly activeColumns = computed(() =>
    this.columnVisibility()
      ? this.columns().filter((col) => this.effectiveVisibleColumnKeys().has(col.key))
      : this.columns()
  );

  private readonly filteredData = computed(() => {
    const data = this.data();
    const keys = this.searchKeys();
    const query = this.searchQuery().trim().toLowerCase();
    if (this.serverSide() || !this.searchable() || !query || !keys?.length) return data;
    return data.filter((row) =>
      keys.some((key) => {
        const val = (row as Record<string, unknown>)[key];
        return val != null && String(val).toLowerCase().includes(query);
      })
    );
  });

  protected readonly sortedData = computed(() => {
    const data = this.filteredData();
    const key = this.sortKey();
    const direction = this.sortDirection();
    if (this.serverSide() || !key || !direction) return data;
    return [...data].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[key];
      const bVal = (b as Record<string, unknown>)[key];
      if (aVal === bVal) return 0;
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = String(aVal).localeCompare(String(bVal), this.locale().locale, { numeric: true });
      return direction === 'asc' ? cmp : -cmp;
    });
  });

  private readonly totalRows = computed(() =>
    this.serverSide() ? (this.totalCount() ?? this.data().length) : this.sortedData().length
  );

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalRows() / this.pageSize()))
  );

  protected readonly paginatedData = computed(() => {
    if (this.serverSide()) return this.sortedData();
    const page = this.currentPage();
    const size = this.pageSize();
    return this.sortedData().slice((page - 1) * size, page * size);
  });

  private readonly pageKeys = computed(() =>
    this.paginatedData().map((row, i) => this.keyFor(row, this.absoluteIndex(i)))
  );

  protected readonly allPageSelected = computed(() => {
    const keys = this.pageKeys();
    return keys.length > 0 && keys.every((k) => this.selectedKeys().has(k));
  });

  protected readonly somePageSelected = computed(
    () => !this.allPageSelected() && this.pageKeys().some((k) => this.selectedKeys().has(k))
  );

  protected readonly selectedRows = computed(() =>
    this.data().filter((row, i) => this.selectedKeys().has(this.keyFor(row, i)))
  );

  protected readonly colSpan = computed(
    () => this.activeColumns().length + (this.selectable() ? 1 : 0)
  );

  protected readonly skeletonRows = computed(() =>
    Array.from({ length: this.pageSize() }, (_, i) => i)
  );

  constructor() {
    effect(() => {
      this.data();
      this.searchQuery();
      untracked(() => this.currentPage.set(1));
    });
    effect(() => {
      this.data();
      untracked(() => this.selectedKeys.set(new Set()));
    });
    effect(() => {
      const rows = this.selectedRows();
      untracked(() => this.selectionChange.emit(rows));
    });
  }

  private keyFor(row: T, index: number): string | number {
    const extractor = this.keyExtractor();
    return extractor ? extractor(row, index) : index;
  }

  private absoluteIndex(pageIndex: number): number {
    return (this.currentPage() - 1) * this.pageSize() + pageIndex;
  }

  protected rowIsSelected(row: T, pageIndex: number): boolean {
    return this.selectedKeys().has(this.keyFor(row, this.absoluteIndex(pageIndex)));
  }

  protected cellValue(column: BipDataTableColumn<T>, row: T): unknown {
    return (row as Record<string, unknown>)[column.key] ?? '—';
  }

  protected cellTemplateFor(key: string): TemplateRef<BipDataTableCellContext<T>> | undefined {
    return this.cellTemplates().find((t) => t.key() === key)?.templateRef;
  }

  protected headerTemplateFor(key: string): TemplateRef<void> | undefined {
    return this.headerTemplates().find((t) => t.key() === key)?.templateRef;
  }

  protected cellContext(
    column: BipDataTableColumn<T>,
    row: T,
    pageIndex: number
  ): BipDataTableCellContext<T> {
    return {
      $implicit: row,
      value: (row as Record<string, unknown>)[column.key],
      rowIndex: this.absoluteIndex(pageIndex),
    };
  }

  protected getSortDirection(key: string): BipDataTableSortDirection {
    return this.sortKey() === key ? this.sortDirection() : null;
  }

  protected handleSort(key: string): void {
    let newKey: string | null;
    let newDirection: BipDataTableSortDirection;
    if (this.sortKey() !== key) {
      newKey = key;
      newDirection = 'asc';
    } else if (this.sortDirection() === 'asc') {
      newKey = key;
      newDirection = 'desc';
    } else {
      newKey = null;
      newDirection = null;
    }
    this.sortKey.set(newKey);
    this.sortDirection.set(newDirection);
    if (this.serverSide()) this.sortChange.emit({ key: newKey, direction: newDirection });
  }

  protected onSearchChange(query: string): void {
    this.searchQuery.set(query);
    if (this.serverSide()) this.searched.emit(query);
  }

  protected onPageChange(page: number): void {
    this.currentPage.set(page);
    if (this.serverSide()) this.pageChange.emit(page);
  }

  protected handleRowClick(row: T): void {
    if (this.rowsClickable()) this.rowClick.emit(row);
  }

  protected toggleHeaderCheckbox(): void {
    const keys = this.pageKeys();
    const next = new Set(this.selectedKeys());
    if (this.allPageSelected()) {
      keys.forEach((k) => next.delete(k));
    } else {
      keys.forEach((k) => next.add(k));
    }
    this.selectedKeys.set(next);
  }

  protected toggleRowSelection(row: T, pageIndex: number): void {
    const key = this.keyFor(row, this.absoluteIndex(pageIndex));
    const next = new Set(this.selectedKeys());
    if (next.has(key)) next.delete(key);
    else next.add(key);
    this.selectedKeys.set(next);
  }

  protected clearSelection(): void {
    this.selectedKeys.set(new Set());
  }

  protected toggleColumnVisibility(key: string): void {
    const next = new Set(this.effectiveVisibleColumnKeys());
    if (next.has(key)) next.delete(key);
    else next.add(key);
    this.visibleColumnKeysOverride.set(next);
  }
}
