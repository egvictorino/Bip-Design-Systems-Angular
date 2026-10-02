import { Component } from '@angular/core';
import { render, screen, fireEvent, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { BipDataTable } from './data-table.component';
import { BipDataTableCell } from './data-table-cell.directive';
import { BipDataTableHeader } from './data-table-header.directive';
import type { BipDataTableBulkAction, BipDataTableColumn } from './data-table.types';

interface Row {
  id: number;
  name: string;
  email: string;
  age: number | null;
}

const makeRows = (n: number): Row[] =>
  Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    name: `Persona ${i + 1}`,
    email: `persona${i + 1}@example.com`,
    age: 20 + i,
  }));

const BASE_COLUMNS: BipDataTableColumn<Row>[] = [
  { key: 'name', header: 'Nombre', sortable: true },
  { key: 'email', header: 'Email' },
  { key: 'age', header: 'Edad', align: 'end' },
];

@Component({
  imports: [BipDataTable],
  template: `
    <bip-data-table
      [columns]="columns"
      [data]="data"
      [pageSize]="pageSize"
      [loading]="loading"
      [emptyMessage]="emptyMessage"
      [rowsClickable]="rowsClickable"
      [searchable]="searchable"
      [searchKeys]="searchKeys"
      [searchPlaceholder]="searchPlaceholder"
      [selectable]="selectable"
      [bulkActions]="bulkActions"
      [serverSide]="serverSide"
      [totalCount]="totalCount"
      [columnVisibility]="columnVisibility"
      [defaultHiddenColumns]="defaultHiddenColumns"
      [ariaLabel]="ariaLabel"
      (rowClick)="onRowClick($event)"
      (selectionChange)="onSelectionChange($event)"
      (pageChange)="onPageChange($event)"
      (sortChange)="onSortChange($event)"
      (searched)="onSearched($event)"
    />
  `,
})
class HostComponent {
  columns: BipDataTableColumn<Row>[] = BASE_COLUMNS;
  data: Row[] = makeRows(3);
  pageSize = 10;
  loading = false;
  emptyMessage: string | undefined = undefined;
  rowsClickable = false;
  searchable = false;
  searchKeys: string[] | undefined = undefined;
  searchPlaceholder: string | undefined = undefined;
  selectable = false;
  bulkActions: BipDataTableBulkAction<Row>[] | undefined = undefined;
  serverSide = false;
  totalCount: number | undefined = undefined;
  columnVisibility = false;
  defaultHiddenColumns: string[] | undefined = undefined;
  ariaLabel: string | undefined = undefined;
  onRowClick = vi.fn();
  onSelectionChange = vi.fn();
  onPageChange = vi.fn();
  onSortChange = vi.fn();
  onSearched = vi.fn();
}

describe('BipDataTable', () => {
  // ─── Render básico ────────────────────────────────────────────────────────

  it('renderiza los encabezados de columna', async () => {
    await render(HostComponent);
    expect(screen.getByRole('columnheader', { name: 'Nombre' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Email' })).toBeInTheDocument();
  });

  it('renderiza el dato de cada fila', async () => {
    await render(HostComponent);
    expect(screen.getByText('Persona 1')).toBeInTheDocument();
    expect(screen.getByText('persona1@example.com')).toBeInTheDocument();
  });

  it('renderiza "—" para valores null', async () => {
    await render(HostComponent, {
      componentProperties: { data: [{ id: 1, name: 'Juan', email: 'juan@x.com', age: null }] },
    });
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renderiza el estado vacío sin datos', async () => {
    await render(HostComponent, { componentProperties: { data: [] } });
    expect(screen.getByText('No hay datos disponibles')).toBeInTheDocument();
  });

  it('usa emptyMessage custom', async () => {
    await render(HostComponent, { componentProperties: { data: [], emptyMessage: 'Nada por aquí' } });
    expect(screen.getByText('Nada por aquí')).toBeInTheDocument();
  });

  it('renderiza filas skeleton mientras loading=true', async () => {
    const { container } = await render(HostComponent, { componentProperties: { loading: true, pageSize: 3 } });
    expect(container.querySelectorAll('bip-skeleton')).toHaveLength(9); // 3 filas x 3 columnas
  });

  // ─── Row click ────────────────────────────────────────────────────────────

  it('emite rowClick al hacer click en una fila cuando rowsClickable=true', async () => {
    const { fixture } = await render(HostComponent, { componentProperties: { rowsClickable: true } });
    fireEvent.click(screen.getByText('Persona 1'));
    expect(fixture.componentInstance.onRowClick).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Persona 1' })
    );
  });

  it('no emite rowClick si rowsClickable=false', async () => {
    const { fixture } = await render(HostComponent);
    fireEvent.click(screen.getByText('Persona 1'));
    expect(fixture.componentInstance.onRowClick).not.toHaveBeenCalled();
  });

  // ─── Sorting ──────────────────────────────────────────────────────────────

  it('ordena ascendente/descendente/limpia al hacer click repetido en un encabezado ordenable', async () => {
    await render(HostComponent, {
      componentProperties: { data: [makeRows(1)[0], { id: 2, name: 'Ana', email: 'a@x.com', age: 20 }] },
    });
    const header = screen.getByRole('columnheader', { name: /Nombre/i });
    const rowsText = () => screen.getAllByRole('row').slice(1).map((r) => r.textContent);

    fireEvent.click(header);
    expect(header).toHaveAttribute('aria-sort', 'ascending');
    expect(rowsText()[0]).toContain('Ana');

    fireEvent.click(header);
    expect(header).toHaveAttribute('aria-sort', 'descending');
    expect(rowsText()[0]).toContain('Persona 1');

    fireEvent.click(header);
    expect(header).toHaveAttribute('aria-sort', 'none');
  });

  it('las filas con valor null quedan al final al ordenar', async () => {
    await render(HostComponent, {
      componentProperties: {
        data: [
          { id: 1, name: 'Ana', email: 'a@x.com', age: null },
          { id: 2, name: 'Beto', email: 'b@x.com', age: 20 },
        ],
      },
    });
    fireEvent.click(screen.getByRole('columnheader', { name: /Nombre/i }));
    const rows = screen.getAllByRole('row').slice(1);
    expect(rows[0].textContent).toContain('Ana');
    expect(rows[1].textContent).toContain('Beto');
  });

  // ─── Pagination ───────────────────────────────────────────────────────────

  it('pagina los datos según pageSize', async () => {
    await render(HostComponent, { componentProperties: { data: makeRows(15), pageSize: 10 } });
    expect(screen.getByText('Persona 1')).toBeInTheDocument();
    expect(screen.queryByText('Persona 11')).toBeNull();
  });

  it('no renderiza paginación cuando los datos caben en una página', async () => {
    await render(HostComponent, { componentProperties: { data: makeRows(5), pageSize: 10 } });
    expect(screen.queryByRole('navigation')).toBeNull();
  });

  it('renderiza paginación cuando los datos superan pageSize', async () => {
    await render(HostComponent, { componentProperties: { data: makeRows(15), pageSize: 10 } });
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('el skeleton de carga tiene exactamente pageSize filas', async () => {
    const { container } = await render(HostComponent, { componentProperties: { loading: true, pageSize: 7 } });
    const skeletonRows = container.querySelectorAll('tbody tr');
    expect(skeletonRows).toHaveLength(7);
  });

  // ─── Búsqueda ─────────────────────────────────────────────────────────────

  it('no renderiza el buscador cuando searchable=false', async () => {
    await render(HostComponent);
    expect(screen.queryByRole('search')).toBeNull();
  });

  it('renderiza el buscador cuando searchable=true', async () => {
    await render(HostComponent, { componentProperties: { searchable: true, searchKeys: ['name'] } });
    expect(screen.getByRole('search')).toBeInTheDocument();
  });

  it('usa searchPlaceholder custom como label del buscador', async () => {
    await render(HostComponent, {
      componentProperties: { searchable: true, searchKeys: ['name'], searchPlaceholder: 'Buscar persona...' },
    });
    expect(screen.getByText('Buscar persona...')).toBeInTheDocument();
  });

  it('filtra filas por la búsqueda (case-insensitive) sobre searchKeys', async () => {
    const user = userEvent.setup();
    await render(HostComponent, {
      componentProperties: {
        searchable: true,
        searchKeys: ['name'],
        data: [
          { id: 1, name: 'Ana Pérez', email: 'a@x.com', age: 20 },
          { id: 2, name: 'Beto Ruiz', email: 'b@x.com', age: 21 },
        ],
      },
    });
    await user.type(screen.getByRole('search').querySelector('input')!, 'ANA');
    expect(screen.getByText('Ana Pérez')).toBeInTheDocument();
    expect(screen.queryByText('Beto Ruiz')).toBeNull();
  });

  it('muestra el estado vacío cuando la búsqueda no tiene coincidencias', async () => {
    const user = userEvent.setup();
    await render(HostComponent, { componentProperties: { searchable: true, searchKeys: ['name'] } });
    await user.type(screen.getByRole('search').querySelector('input')!, 'zzz-no-existe');
    expect(screen.getByText('No hay datos disponibles')).toBeInTheDocument();
  });

  it('no filtra del lado cliente en modo serverSide', async () => {
    await render(HostComponent, {
      componentProperties: { searchable: true, searchKeys: ['name'], serverSide: true },
    });
    const input = screen.getByRole('search').querySelector('input')!;
    fireEvent.input(input, { target: { value: 'zzz-no-existe' } });
    expect(screen.getByText('Persona 1')).toBeInTheDocument();
  });

  it('emite searched en modo serverSide al cambiar la búsqueda', async () => {
    const { fixture } = await render(HostComponent, {
      componentProperties: { searchable: true, searchKeys: ['name'], serverSide: true },
    });
    const input = screen.getByRole('search').querySelector('input')!;
    fireEvent.input(input, { target: { value: 'ana' } });
    expect(fixture.componentInstance.onSearched).toHaveBeenCalledWith('ana');
  });

  // ─── Server-side ──────────────────────────────────────────────────────────

  it('usa totalCount para calcular totalPages en modo serverSide', async () => {
    await render(HostComponent, {
      componentProperties: { serverSide: true, totalCount: 25, pageSize: 10, data: makeRows(10) },
    });
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('emite pageChange en modo serverSide', async () => {
    const { fixture } = await render(HostComponent, {
      componentProperties: { serverSide: true, totalCount: 25, pageSize: 10, data: makeRows(10) },
    });
    await userEvent.click(screen.getByRole('button', { name: /2/ }));
    expect(fixture.componentInstance.onPageChange).toHaveBeenCalledWith(2);
  });

  it('emite sortChange en modo serverSide al ordenar', async () => {
    const { fixture } = await render(HostComponent, { componentProperties: { serverSide: true } });
    fireEvent.click(screen.getByRole('columnheader', { name: /Nombre/i }));
    expect(fixture.componentInstance.onSortChange).toHaveBeenCalledWith({ key: 'name', direction: 'asc' });
  });

  // ─── Selección ────────────────────────────────────────────────────────────

  it('renderiza un checkbox de encabezado y uno por fila cuando selectable=true', async () => {
    await render(HostComponent, { componentProperties: { selectable: true } });
    expect(screen.getAllByRole('checkbox')).toHaveLength(4); // encabezado + 3 filas
  });

  it('no renderiza checkboxes cuando selectable=false', async () => {
    await render(HostComponent);
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
  });

  it('alterna la selección individual al hacer click en el checkbox de una fila', async () => {
    const { fixture } = await render(HostComponent, { componentProperties: { selectable: true } });
    const checkboxes = screen.getAllByRole('checkbox');
    await userEvent.click(checkboxes[1]);
    expect(fixture.componentInstance.onSelectionChange).toHaveBeenCalledWith([
      expect.objectContaining({ name: 'Persona 1' }),
    ]);
  });

  it('selecciona todas las filas de la página con el checkbox de encabezado', async () => {
    const { fixture } = await render(HostComponent, { componentProperties: { selectable: true } });
    await userEvent.click(screen.getAllByRole('checkbox')[0]);
    expect(fixture.componentInstance.onSelectionChange).toHaveBeenLastCalledWith(
      expect.arrayContaining([expect.objectContaining({ name: 'Persona 1' })])
    );
  });

  it('muestra el conteo de selección y el botón Limpiar', async () => {
    await render(HostComponent, { componentProperties: { selectable: true } });
    await userEvent.click(screen.getAllByRole('checkbox')[1]);
    expect(screen.getByText('1 seleccionado')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Limpiar' })).toBeInTheDocument();
  });

  it('muestra el plural cuando hay más de una fila seleccionada', async () => {
    await render(HostComponent, { componentProperties: { selectable: true } });
    const checkboxes = screen.getAllByRole('checkbox');
    await userEvent.click(checkboxes[1]);
    await userEvent.click(checkboxes[2]);
    expect(screen.getByText('2 seleccionados')).toBeInTheDocument();
  });

  it('renderiza botones de acciones masivas con la selección activa', async () => {
    const onBulkClick = vi.fn();
    await render(HostComponent, {
      componentProperties: {
        selectable: true,
        bulkActions: [{ label: 'Eliminar', onClick: onBulkClick, variant: 'danger' }],
      },
    });
    await userEvent.click(screen.getAllByRole('checkbox')[1]);
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar' }));
    expect(onBulkClick).toHaveBeenCalledWith([expect.objectContaining({ name: 'Persona 1' })]);
  });

  it('limpia la selección al hacer click en Limpiar', async () => {
    const { fixture } = await render(HostComponent, { componentProperties: { selectable: true } });
    await userEvent.click(screen.getAllByRole('checkbox')[1]);
    await userEvent.click(screen.getByRole('button', { name: 'Limpiar' }));
    expect(screen.queryByText(/seleccionado/)).toBeNull();
    expect(fixture.componentInstance.onSelectionChange).toHaveBeenLastCalledWith([]);
  });

  // ─── Visibilidad de columnas ──────────────────────────────────────────────

  it('renderiza el botón de visibilidad de columnas cuando columnVisibility=true', async () => {
    await render(HostComponent, { componentProperties: { columnVisibility: true } });
    expect(screen.getByRole('button', { name: 'Columnas' })).toBeInTheDocument();
  });

  it('no renderiza el botón de visibilidad de columnas cuando columnVisibility=false', async () => {
    await render(HostComponent);
    expect(screen.queryByRole('button', { name: 'Columnas' })).toBeNull();
  });

  it('abre el panel de visibilidad de columnas al hacer click en el botón', async () => {
    await render(HostComponent, { componentProperties: { columnVisibility: true } });
    await userEvent.click(screen.getByRole('button', { name: 'Columnas' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('oculta una columna al desmarcarla en el panel', async () => {
    await render(HostComponent, { componentProperties: { columnVisibility: true } });
    await userEvent.click(screen.getByRole('button', { name: 'Columnas' }));
    const dialog = screen.getByRole('dialog');
    await userEvent.click(within(dialog).getByRole('checkbox', { name: 'Email' }));
    expect(screen.queryByRole('columnheader', { name: 'Email' })).toBeNull();
  });

  it('aplica defaultHiddenColumns en el render inicial', async () => {
    await render(HostComponent, { componentProperties: { columnVisibility: true, defaultHiddenColumns: ['email'] } });
    expect(screen.queryByRole('columnheader', { name: 'Email' })).toBeNull();
    expect(screen.getByRole('columnheader', { name: 'Nombre' })).toBeInTheDocument();
  });

  // ─── aria-label / region ──────────────────────────────────────────────────

  it('aplica role="region" y aria-label cuando se provee ariaLabel', async () => {
    const { container } = await render(HostComponent, { componentProperties: { ariaLabel: 'Tabla de pacientes' } });
    expect(container.querySelector('bip-data-table')).toHaveAttribute('role', 'region');
    expect(container.querySelector('bip-data-table')).toHaveAttribute('aria-label', 'Tabla de pacientes');
  });

  it('no aplica role ni aria-label sin ariaLabel', async () => {
    const { container } = await render(HostComponent);
    expect(container.querySelector('bip-data-table')).not.toHaveAttribute('role');
  });
});

describe('BipDataTable — templates de columna', () => {
  @Component({
    imports: [BipDataTable, BipDataTableCell, BipDataTableHeader],
    template: `
      <bip-data-table [columns]="columns" [data]="data">
        <ng-template bipHeader="name">
          <strong>Nombre completo</strong>
        </ng-template>
        <ng-template bipCell="name" let-row>
          <em>{{ row['name'] }}</em>
        </ng-template>
      </bip-data-table>
    `,
  })
  class TemplatesHost {
    columns: BipDataTableColumn<Row>[] = [{ key: 'name', header: 'Nombre' }];
    data: Row[] = [{ id: 1, name: 'Juan', email: 'juan@x.com', age: 30 }];
  }

  it('usa el template bipHeader/bipCell proyectado en vez del texto plano', async () => {
    const { container } = await render(TemplatesHost);
    expect(screen.getByText('Nombre completo').tagName).toBe('STRONG');
    expect(screen.getByText('Juan').tagName).toBe('EM');
    expect(container.querySelector('th strong')).toBeInTheDocument();
  });
});
