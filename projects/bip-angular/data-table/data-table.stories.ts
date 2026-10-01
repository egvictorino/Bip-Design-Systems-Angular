import { Component, signal } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { BipDataTable } from './data-table.component';
import { BipDataTableCell } from './data-table-cell.directive';
import { BipDataTableHeader } from './data-table-header.directive';
import type { BipDataTableBulkAction, BipDataTableColumn } from './data-table.types';

interface Patient {
  id: number;
  name: string;
  email: string;
  age: number;
  status: string;
}

const PATIENTS: Patient[] = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  name: `Paciente ${i + 1}`,
  email: `paciente${i + 1}@example.com`,
  age: 18 + ((i * 7) % 60),
  status: i % 3 === 0 ? 'Activo' : i % 3 === 1 ? 'Pendiente' : 'Inactivo',
}));

const COLUMNS: BipDataTableColumn<Patient>[] = [
  { key: 'name', header: 'Nombre', sortable: true },
  { key: 'email', header: 'Email', sortable: true },
  { key: 'age', header: 'Edad', align: 'end', sortable: true },
  { key: 'status', header: 'Estado' },
];

const IMPORTS = [BipDataTable, BipDataTableCell, BipDataTableHeader];

@Component({
  selector: 'bip-data-table-demo',
  imports: IMPORTS,
  template: `
    <bip-data-table
      [columns]="columns"
      [data]="data()"
      [pageSize]="8"
      [searchable]="true"
      [searchKeys]="['name', 'email']"
      [selectable]="true"
      [columnVisibility]="true"
      [bulkActions]="bulkActions"
      ariaLabel="Listado de pacientes"
    >
      <ng-template bipHeader="status">Estado actual</ng-template>
      <ng-template bipCell="status" let-row>
        <span [style.color]="row['status'] === 'Activo' ? 'var(--color-success)' : 'var(--color-txt-secondary)'">
          {{ row['status'] }}
        </span>
      </ng-template>
    </bip-data-table>
  `,
})
class DataTableDemo {
  readonly columns = COLUMNS;
  readonly data = signal(PATIENTS);
  readonly bulkActions: BipDataTableBulkAction<Patient>[] = [
    { label: 'Exportar', onClick: () => {}, variant: 'secondary' },
    { label: 'Eliminar', onClick: () => {}, variant: 'danger' },
  ];
}

const meta: Meta<DataTableDemo> = {
  title: 'Components/DataTable',
  component: DataTableDemo,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<DataTableDemo>;

export const Default: Story = {};

export const Loading: Story = {
  render: () => ({
    moduleMetadata: { imports: IMPORTS },
    props: { columns: COLUMNS },
    template: `<bip-data-table [columns]="columns" [data]="[]" [loading]="true" />`,
  }),
};

export const Empty: Story = {
  render: () => ({
    moduleMetadata: { imports: IMPORTS },
    props: { columns: COLUMNS },
    template: `<bip-data-table [columns]="columns" [data]="[]" />`,
  }),
};

export const Compact: Story = {
  render: () => ({
    moduleMetadata: { imports: IMPORTS },
    props: { columns: COLUMNS, data: PATIENTS.slice(0, 5) },
    template: `<bip-data-table [columns]="columns" [data]="data" [compact]="true" [striped]="true" />`,
  }),
};
