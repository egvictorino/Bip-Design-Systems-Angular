import { Component, signal } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { BipTable } from './table.component';
import { BipTableHead } from './table-head.component';
import { BipTableBody } from './table-body.component';
import { BipTableRow } from './table-row.component';
import { BipTableHeader } from './table-header.component';
import { BipTableCell } from './table-cell.component';
import { BipTableEmpty } from './table-empty.component';

const IMPORTS = [
  BipTable,
  BipTableHead,
  BipTableBody,
  BipTableRow,
  BipTableHeader,
  BipTableCell,
  BipTableEmpty,
];

@Component({
  selector: 'bip-table-demo',
  imports: IMPORTS,
  template: `
    <bip-table [striped]="striped()" [compact]="compact()">
      <thead bipTableHead>
        <tr bipTableRow>
          <th
            bipTableHeader
            [sortable]="true"
            [sortDirection]="sortDirection()"
            (sort)="toggleSort()"
          >
            Nombre
          </th>
          <th bipTableHeader>Email</th>
          <th bipTableHeader align="end">Edad</th>
        </tr>
      </thead>
      <tbody bipTableBody>
        @for (row of rows(); track row.email) {
          <tr bipTableRow>
            <td bipTableCell>{{ row.name }}</td>
            <td bipTableCell>{{ row.email }}</td>
            <td bipTableCell align="end">{{ row.age }}</td>
          </tr>
        }
      </tbody>
    </bip-table>
  `,
})
class TableDemo {
  readonly striped = signal(false);
  readonly compact = signal(false);
  readonly sortDirection = signal<'asc' | 'desc' | null>(null);
  readonly rows = signal([
    { name: 'Juan Pérez', email: 'juan@example.com', age: 32 },
    { name: 'María López', email: 'maria@example.com', age: 28 },
    { name: 'Carlos Ruiz', email: 'carlos@example.com', age: 45 },
  ]);

  toggleSort(): void {
    this.sortDirection.set(
      this.sortDirection() === 'asc' ? 'desc' : this.sortDirection() === 'desc' ? null : 'asc'
    );
  }
}

const meta: Meta<TableDemo> = {
  title: 'Components/Table',
  component: TableDemo,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<TableDemo>;

export const Default: Story = {};

export const Striped: Story = {
  render: () => ({
    moduleMetadata: { imports: IMPORTS },
    template: `
      <bip-table [striped]="true">
        <thead bipTableHead>
          <tr bipTableRow><th bipTableHeader>Nombre</th><th bipTableHeader>Email</th></tr>
        </thead>
        <tbody bipTableBody>
          <tr bipTableRow><td bipTableCell>Juan Pérez</td><td bipTableCell>juan@example.com</td></tr>
          <tr bipTableRow><td bipTableCell>María López</td><td bipTableCell>maria@example.com</td></tr>
          <tr bipTableRow><td bipTableCell>Carlos Ruiz</td><td bipTableCell>carlos@example.com</td></tr>
        </tbody>
      </bip-table>
    `,
  }),
};

export const Compact: Story = {
  render: () => ({
    moduleMetadata: { imports: IMPORTS },
    template: `
      <bip-table [compact]="true">
        <thead bipTableHead>
          <tr bipTableRow><th bipTableHeader>Nombre</th><th bipTableHeader>Email</th></tr>
        </thead>
        <tbody bipTableBody>
          <tr bipTableRow><td bipTableCell>Juan Pérez</td><td bipTableCell>juan@example.com</td></tr>
          <tr bipTableRow><td bipTableCell>María López</td><td bipTableCell>maria@example.com</td></tr>
        </tbody>
      </bip-table>
    `,
  }),
};

export const WithCaption: Story = {
  render: () => ({
    moduleMetadata: { imports: IMPORTS },
    template: `
      <bip-table caption="Listado de pacientes">
        <thead bipTableHead>
          <tr bipTableRow><th bipTableHeader>Nombre</th></tr>
        </thead>
        <tbody bipTableBody>
          <tr bipTableRow><td bipTableCell>Juan Pérez</td></tr>
        </tbody>
      </bip-table>
    `,
  }),
};

export const Empty: Story = {
  render: () => ({
    moduleMetadata: { imports: IMPORTS },
    template: `
      <bip-table>
        <thead bipTableHead>
          <tr bipTableRow><th bipTableHeader>Nombre</th><th bipTableHeader>Email</th></tr>
        </thead>
        <tbody bipTableBody>
          <tr bipTableEmpty [colSpan]="2"></tr>
        </tbody>
      </bip-table>
    `,
  }),
};

export const SelectedAndClickableRows: Story = {
  render: () => ({
    moduleMetadata: { imports: IMPORTS },
    template: `
      <bip-table>
        <tbody bipTableBody>
          <tr bipTableRow [clickable]="true"><td bipTableCell>Fila normal (clickable)</td></tr>
          <tr bipTableRow [selected]="true"><td bipTableCell>Fila seleccionada</td></tr>
        </tbody>
      </bip-table>
    `,
  }),
};
