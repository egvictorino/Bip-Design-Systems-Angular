import { Component, signal } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { BipPagination } from './pagination.component';

@Component({
  selector: 'bip-pagination-demo',
  imports: [BipPagination],
  template: `<bip-pagination [page]="page()" [totalPages]="20" (pageChange)="page.set($event)" />`,
})
class PaginationDemo {
  readonly page = signal(5);
}

const meta: Meta<PaginationDemo> = {
  title: 'Components/Pagination',
  component: PaginationDemo,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<PaginationDemo>;

export const Basic: Story = {};

export const FewPages: Story = {
  render: () => ({
    moduleMetadata: { imports: [BipPagination] },
    template: `<bip-pagination [page]="2" [totalPages]="3" />`,
  }),
};

export const Disabled: Story = {
  render: () => ({
    moduleMetadata: { imports: [BipPagination] },
    template: `<bip-pagination [page]="5" [totalPages]="20" [disabled]="true" />`,
  }),
};
