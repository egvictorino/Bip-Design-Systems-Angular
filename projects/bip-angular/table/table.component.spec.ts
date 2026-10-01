import { Component } from '@angular/core';
import { render, screen, fireEvent } from '@testing-library/angular';
import { describe, expect, it, vi } from 'vitest';
import { BipTable } from './table.component';
import { BipTableHead } from './table-head.component';
import { BipTableBody } from './table-body.component';
import { BipTableRow } from './table-row.component';
import { BipTableHeader } from './table-header.component';
import { BipTableCell } from './table-cell.component';
import { BipTableEmpty } from './table-empty.component';

const IMPORTS = [BipTable, BipTableHead, BipTableBody, BipTableRow, BipTableHeader, BipTableCell];

@Component({
  imports: IMPORTS,
  template: `
    <bip-table>
      <thead bipTableHead>
        <tr bipTableRow>
          <th bipTableHeader>Nombre</th>
          <th bipTableHeader>Email</th>
        </tr>
      </thead>
      <tbody bipTableBody>
        <tr bipTableRow>
          <td bipTableCell>Juan</td>
          <td bipTableCell>juan@example.com</td>
        </tr>
        <tr bipTableRow>
          <td bipTableCell>María</td>
          <td bipTableCell>maria@example.com</td>
        </tr>
      </tbody>
    </bip-table>
  `,
})
class DefaultTableHost {}

describe('BipTable', () => {
  // ─── Rendering básico ────────────────────────────────────────────────────

  it('renderiza un elemento table', async () => {
    await render(DefaultTableHost);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('renderiza los encabezados de columna', async () => {
    await render(DefaultTableHost);
    expect(screen.getByRole('columnheader', { name: 'Nombre' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Email' })).toBeInTheDocument();
  });

  it('renderiza el dato de las celdas', async () => {
    await render(DefaultTableHost);
    expect(screen.getByRole('cell', { name: 'Juan' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'juan@example.com' })).toBeInTheDocument();
  });

  // ─── Caption ──────────────────────────────────────────────────────────────

  it('renderiza el caption cuando se provee', async () => {
    @Component({
      imports: [BipTable, BipTableBody],
      template: `<bip-table caption="Listado de clientes"><tbody bipTableBody></tbody></bip-table>`,
    })
    class WithCaption {}

    await render(WithCaption);
    expect(screen.getByText('Listado de clientes').tagName).toBe('CAPTION');
  });

  it('no renderiza caption si no se provee', async () => {
    @Component({
      imports: [BipTable, BipTableBody],
      template: `<bip-table><tbody bipTableBody></tbody></bip-table>`,
    })
    class NoCaption {}

    const { container } = await render(NoCaption);
    expect(container.querySelector('caption')).toBeNull();
  });

  // ─── Sticky header ────────────────────────────────────────────────────────

  it('stickyHeader aplica la clase sticky al thead', async () => {
    @Component({
      imports: [BipTable, BipTableHead, BipTableRow, BipTableHeader, BipTableBody],
      template: `
        <bip-table stickyHeader>
          <thead bipTableHead>
            <tr bipTableRow><th bipTableHeader>Nombre</th></tr>
          </thead>
          <tbody bipTableBody></tbody>
        </bip-table>
      `,
    })
    class Sticky {}

    const { container } = await render(Sticky);
    expect(container.querySelector('thead')).toHaveClass('bip-table-thead--sticky');
  });

  it('sin stickyHeader el thead no tiene la clase sticky', async () => {
    const { container } = await render(DefaultTableHost);
    expect(container.querySelector('thead')).not.toHaveClass('bip-table-thead--sticky');
  });

  // ─── Sorting ──────────────────────────────────────────────────────────────

  it('encabezado ordenable tiene aria-sort="none" y tabindex=0', async () => {
    @Component({
      imports: [BipTable, BipTableHead, BipTableRow, BipTableHeader, BipTableBody],
      template: `
        <bip-table>
          <thead bipTableHead><tr bipTableRow><th bipTableHeader [sortable]="true">Nombre</th></tr></thead>
          <tbody bipTableBody></tbody>
        </bip-table>
      `,
    })
    class Sortable {}

    await render(Sortable);
    const header = screen.getByRole('columnheader', { name: /Nombre/i });
    expect(header).toHaveAttribute('aria-sort', 'none');
    expect(header).toHaveAttribute('tabindex', '0');
  });

  it('aria-sort="ascending" con sortDirection="asc"', async () => {
    @Component({
      imports: [BipTable, BipTableHead, BipTableRow, BipTableHeader, BipTableBody],
      template: `
        <bip-table>
          <thead bipTableHead><tr bipTableRow><th bipTableHeader [sortable]="true" sortDirection="asc">Nombre</th></tr></thead>
          <tbody bipTableBody></tbody>
        </bip-table>
      `,
    })
    class Asc {}

    await render(Asc);
    expect(screen.getByRole('columnheader', { name: /Nombre/i })).toHaveAttribute('aria-sort', 'ascending');
  });

  it('aria-sort="descending" con sortDirection="desc"', async () => {
    @Component({
      imports: [BipTable, BipTableHead, BipTableRow, BipTableHeader, BipTableBody],
      template: `
        <bip-table>
          <thead bipTableHead><tr bipTableRow><th bipTableHeader [sortable]="true" sortDirection="desc">Nombre</th></tr></thead>
          <tbody bipTableBody></tbody>
        </bip-table>
      `,
    })
    class Desc {}

    await render(Desc);
    expect(screen.getByRole('columnheader', { name: /Nombre/i })).toHaveAttribute('aria-sort', 'descending');
  });

  it('encabezado no ordenable no tiene aria-sort ni tabindex', async () => {
    await render(DefaultTableHost);
    const header = screen.getByRole('columnheader', { name: 'Nombre' });
    expect(header).not.toHaveAttribute('aria-sort');
    expect(header).not.toHaveAttribute('tabindex');
  });

  it('clic en encabezado ordenable emite sort', async () => {
    const onSort = vi.fn();
    @Component({
      imports: [BipTable, BipTableHead, BipTableRow, BipTableHeader, BipTableBody],
      template: `
        <bip-table>
          <thead bipTableHead><tr bipTableRow><th bipTableHeader [sortable]="true" (sort)="onSort()">Nombre</th></tr></thead>
          <tbody bipTableBody></tbody>
        </bip-table>
      `,
    })
    class Clickable {
      onSort = onSort;
    }

    await render(Clickable);
    fireEvent.click(screen.getByRole('columnheader', { name: /Nombre/i }));
    expect(onSort).toHaveBeenCalledTimes(1);
  });

  it('Enter en encabezado ordenable emite sort', async () => {
    const onSort = vi.fn();
    @Component({
      imports: [BipTable, BipTableHead, BipTableRow, BipTableHeader, BipTableBody],
      template: `
        <bip-table>
          <thead bipTableHead><tr bipTableRow><th bipTableHeader [sortable]="true" (sort)="onSort()">Nombre</th></tr></thead>
          <tbody bipTableBody></tbody>
        </bip-table>
      `,
    })
    class EnterSort {
      onSort = onSort;
    }

    await render(EnterSort);
    fireEvent.keyDown(screen.getByRole('columnheader', { name: /Nombre/i }), { key: 'Enter' });
    expect(onSort).toHaveBeenCalledTimes(1);
  });

  it('Espacio en encabezado ordenable emite sort', async () => {
    const onSort = vi.fn();
    @Component({
      imports: [BipTable, BipTableHead, BipTableRow, BipTableHeader, BipTableBody],
      template: `
        <bip-table>
          <thead bipTableHead><tr bipTableRow><th bipTableHeader [sortable]="true" (sort)="onSort()">Nombre</th></tr></thead>
          <tbody bipTableBody></tbody>
        </bip-table>
      `,
    })
    class SpaceSort {
      onSort = onSort;
    }

    await render(SpaceSort);
    fireEvent.keyDown(screen.getByRole('columnheader', { name: /Nombre/i }), { key: ' ' });
    expect(onSort).toHaveBeenCalledTimes(1);
  });

  it('un encabezado no ordenable no cancela el click en controles interactivos que proyecta (regresión: "(click)": "sortable() && sort.emit()" evaluaba a false y disparaba preventDefault)', async () => {
    @Component({
      imports: [BipTable, BipTableHead, BipTableRow, BipTableHeader, BipTableBody],
      template: `
        <bip-table>
          <thead bipTableHead><tr bipTableRow><th bipTableHeader><input type="checkbox" /></th></tr></thead>
          <tbody bipTableBody></tbody>
        </bip-table>
      `,
    })
    class CheckboxInHeader {}

    await render(CheckboxInHeader);
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);
  });

  // ─── scope ────────────────────────────────────────────────────────────────

  it('BipTableHeader tiene scope="col" por defecto', async () => {
    await render(DefaultTableHost);
    expect(screen.getByRole('columnheader', { name: 'Nombre' })).toHaveAttribute('scope', 'col');
  });

  it('BipTableHeader acepta scope="row"', async () => {
    @Component({
      imports: [BipTable, BipTableBody, BipTableRow, BipTableHeader, BipTableCell],
      template: `
        <bip-table>
          <tbody bipTableBody>
            <tr bipTableRow><th bipTableHeader scope="row">Fila</th><td bipTableCell>Dato</td></tr>
          </tbody>
        </bip-table>
      `,
    })
    class RowScope {}

    const { container } = await render(RowScope);
    expect(container.querySelector('th')).toHaveAttribute('scope', 'row');
  });

  // ─── Selection ────────────────────────────────────────────────────────────

  it('fila seleccionada tiene aria-selected="true"', async () => {
    @Component({
      imports: [BipTable, BipTableBody, BipTableRow, BipTableCell],
      template: `
        <bip-table>
          <tbody bipTableBody><tr bipTableRow [selected]="true"><td bipTableCell>Seleccionado</td></tr></tbody>
        </bip-table>
      `,
    })
    class Selected {}

    const { container } = await render(Selected);
    expect(container.querySelector('tbody tr')).toHaveAttribute('aria-selected', 'true');
  });

  it('fila no seleccionada no tiene aria-selected', async () => {
    const { container } = await render(DefaultTableHost);
    expect(container.querySelector('tbody tr')).not.toHaveAttribute('aria-selected');
  });

  it('una fila seleccionada dentro de thead no emite aria-selected', async () => {
    @Component({
      imports: [BipTable, BipTableHead, BipTableRow, BipTableHeader, BipTableBody],
      template: `
        <bip-table>
          <thead bipTableHead><tr bipTableRow [selected]="true"><th bipTableHeader>Nombre</th></tr></thead>
          <tbody bipTableBody></tbody>
        </bip-table>
      `,
    })
    class SelectedInHead {}

    const { container } = await render(SelectedInHead);
    expect(container.querySelector('thead tr')).not.toHaveAttribute('aria-selected');
  });

  // ─── clickable ────────────────────────────────────────────────────────────

  it('clickable aplica la clase correspondiente', async () => {
    @Component({
      imports: [BipTable, BipTableBody, BipTableRow, BipTableCell],
      template: `
        <bip-table>
          <tbody bipTableBody><tr bipTableRow [clickable]="true"><td bipTableCell>Fila</td></tr></tbody>
        </bip-table>
      `,
    })
    class Clickable {}

    const { container } = await render(Clickable);
    expect(container.querySelector('tbody tr')).toHaveClass('bip-table-row--clickable');
  });

  it('sin clickable no se aplica la clase', async () => {
    const { container } = await render(DefaultTableHost);
    expect(container.querySelector('tbody tr')).not.toHaveClass('bip-table-row--clickable');
  });

  // ─── Context guard ────────────────────────────────────────────────────────

  it('lanza si BipTableRow se usa fuera de <bip-table>', async () => {
    @Component({
      imports: [BipTableRow, BipTableCell],
      template: `<tr bipTableRow><td bipTableCell>X</td></tr>`,
    })
    class Orphan {}

    await expect(render(Orphan)).rejects.toThrow('<tr bipTableRow> debe usarse dentro de <bip-table>');
  });

  // ─── Compact / Normal ─────────────────────────────────────────────────────

  it('compact aplica clases compact a th/td', async () => {
    @Component({
      imports: [BipTable, BipTableHead, BipTableRow, BipTableHeader, BipTableBody, BipTableCell],
      template: `
        <bip-table [compact]="true">
          <thead bipTableHead><tr bipTableRow><th bipTableHeader>Nombre</th></tr></thead>
          <tbody bipTableBody><tr bipTableRow><td bipTableCell>Juan</td></tr></tbody>
        </bip-table>
      `,
    })
    class Compact {}

    const { container } = await render(Compact);
    expect(container.querySelector('th')).toHaveClass('bip-table-header--compact');
    expect(container.querySelector('td')).toHaveClass('bip-table-cell--compact');
  });

  it('sin compact aplica clases normal a th/td', async () => {
    @Component({
      imports: [BipTable, BipTableHead, BipTableRow, BipTableHeader, BipTableBody, BipTableCell],
      template: `
        <bip-table>
          <thead bipTableHead><tr bipTableRow><th bipTableHeader>Nombre</th></tr></thead>
          <tbody bipTableBody><tr bipTableRow><td bipTableCell>Juan</td></tr></tbody>
        </bip-table>
      `,
    })
    class Normal {}

    const { container } = await render(Normal);
    expect(container.querySelector('th')).toHaveClass('bip-table-header--normal');
    expect(container.querySelector('td')).toHaveClass('bip-table-cell--normal');
  });

  it('striped aplica la clase a cada fila', async () => {
    @Component({
      imports: [BipTable, BipTableBody, BipTableRow, BipTableCell],
      template: `
        <bip-table [striped]="true">
          <tbody bipTableBody>
            <tr bipTableRow><td bipTableCell>Fila 1</td></tr>
            <tr bipTableRow><td bipTableCell>Fila 2</td></tr>
          </tbody>
        </bip-table>
      `,
    })
    class Striped {}

    const { container } = await render(Striped);
    container.querySelectorAll('tbody tr').forEach((row) => {
      expect(row).toHaveClass('bip-table-row--striped');
    });
  });

  // ─── Alignment ────────────────────────────────────────────────────────────

  it('align="center" aplica bip-table-align-center en header y cell', async () => {
    @Component({
      imports: [BipTable, BipTableHead, BipTableRow, BipTableHeader, BipTableBody, BipTableCell],
      template: `
        <bip-table>
          <thead bipTableHead><tr bipTableRow><th bipTableHeader align="center">Centro</th></tr></thead>
          <tbody bipTableBody><tr bipTableRow><td bipTableCell align="center">Centro</td></tr></tbody>
        </bip-table>
      `,
    })
    class Aligned {}

    const { container } = await render(Aligned);
    expect(container.querySelector('th')).toHaveClass('bip-table-align-center');
    expect(container.querySelector('td')).toHaveClass('bip-table-align-center');
  });

  it('align="end" aplica bip-table-align-end', async () => {
    @Component({
      imports: [BipTable, BipTableHead, BipTableRow, BipTableHeader, BipTableBody],
      template: `
        <bip-table>
          <thead bipTableHead><tr bipTableRow><th bipTableHeader align="end">Derecha</th></tr></thead>
          <tbody bipTableBody></tbody>
        </bip-table>
      `,
    })
    class AlignEnd {}

    const { container } = await render(AlignEnd);
    expect(container.querySelector('th')).toHaveClass('bip-table-align-end');
  });

  // ─── class forwarding ─────────────────────────────────────────────────────

  it('reenvía class al host (consumidor la pone directamente)', async () => {
    @Component({
      imports: [BipTable, BipTableBody],
      template: `<bip-table class="my-custom-class"><tbody bipTableBody></tbody></bip-table>`,
    })
    class CustomClass {}

    const { container } = await render(CustomClass);
    expect(container.querySelector('bip-table')).toHaveClass('my-custom-class');
  });

  // ─── BipTableEmpty ────────────────────────────────────────────────────────

  it('BipTableEmpty renderiza el mensaje por defecto del locale', async () => {
    @Component({
      imports: [BipTable, BipTableBody, BipTableEmpty],
      template: `<bip-table><tbody bipTableBody><tr bipTableEmpty [colSpan]="3"></tr></tbody></bip-table>`,
    })
    class EmptyDefault {}

    await render(EmptyDefault);
    expect(screen.getByText('No hay registros que mostrar.')).toBeInTheDocument();
  });

  it('BipTableEmpty renderiza contenido proyectado en vez del mensaje por defecto', async () => {
    @Component({
      imports: [BipTable, BipTableBody, BipTableEmpty],
      template: `
        <bip-table><tbody bipTableBody><tr bipTableEmpty [colSpan]="3">Sin resultados para tu búsqueda</tr></tbody></bip-table>
      `,
    })
    class EmptyCustom {}

    await render(EmptyCustom);
    expect(screen.getByText('Sin resultados para tu búsqueda')).toBeInTheDocument();
    expect(screen.queryByText('No hay registros que mostrar.')).toBeNull();
  });

  it('BipTableEmpty renderiza un único td con el colSpan dado', async () => {
    @Component({
      imports: [BipTable, BipTableBody, BipTableEmpty],
      template: `<bip-table><tbody bipTableBody><tr bipTableEmpty [colSpan]="4"></tr></tbody></bip-table>`,
    })
    class EmptyColSpan {}

    const { container } = await render(EmptyColSpan);
    expect(container.querySelector('tbody td')).toHaveAttribute('colspan', '4');
  });

  it('BipTableEmpty aplica clase compact en modo compact', async () => {
    @Component({
      imports: [BipTable, BipTableBody, BipTableEmpty],
      template: `<bip-table [compact]="true"><tbody bipTableBody><tr bipTableEmpty [colSpan]="2"></tr></tbody></bip-table>`,
    })
    class EmptyCompact {}

    const { container } = await render(EmptyCompact);
    expect(container.querySelector('tbody td')).toHaveClass('bip-table-cell--compact');
  });

  it('BipTableEmpty aplica clase normal fuera de modo compact', async () => {
    @Component({
      imports: [BipTable, BipTableBody, BipTableEmpty],
      template: `<bip-table><tbody bipTableBody><tr bipTableEmpty [colSpan]="2"></tr></tbody></bip-table>`,
    })
    class EmptyNormal {}

    const { container } = await render(EmptyNormal);
    expect(container.querySelector('tbody td')).toHaveClass('bip-table-cell--normal');
  });

  it('lanza si BipTableEmpty se usa fuera de <bip-table>', async () => {
    @Component({
      imports: [BipTableEmpty],
      template: `<tr bipTableEmpty [colSpan]="3"></tr>`,
    })
    class OrphanEmpty {}

    await expect(render(OrphanEmpty)).rejects.toThrow('<tr bipTableEmpty> debe usarse dentro de <bip-table>');
  });

  it('BipTableEmpty aplica la clase bip-table-cell-empty', async () => {
    @Component({
      imports: [BipTable, BipTableBody, BipTableEmpty],
      template: `<bip-table><tbody bipTableBody><tr bipTableEmpty [colSpan]="2"></tr></tbody></bip-table>`,
    })
    class EmptyClass {}

    const { container } = await render(EmptyClass);
    expect(container.querySelector('tbody td')).toHaveClass('bip-table-cell-empty');
  });
});
