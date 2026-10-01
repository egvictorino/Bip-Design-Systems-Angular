import { Component, signal } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { BipConfirmDialog, type BipConfirmDialogVariant } from './confirm-dialog.component';

@Component({
  selector: 'bip-confirm-dialog-demo',
  imports: [BipConfirmDialog],
  template: `
    <button type="button" style="padding: 8px 16px" (click)="open.set(true)">
      Eliminar elemento
    </button>
    <bip-confirm-dialog
      [(open)]="open"
      [title]="title"
      [description]="description"
      [variant]="variant"
      (confirmed)="open.set(false)"
    />
  `,
})
class ConfirmDialogDemo {
  readonly open = signal(false);
  title = 'Eliminar elemento';
  description = '¿Estás seguro? Esta acción no se puede deshacer.';
  variant: BipConfirmDialogVariant = 'danger';
}

const meta: Meta<ConfirmDialogDemo> = {
  title: 'Components/ConfirmDialog',
  component: ConfirmDialogDemo,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    variant: { control: 'select', options: ['info', 'danger', 'warning'] },
  },
};

export default meta;
type Story = StoryObj<ConfirmDialogDemo>;

export const Danger: Story = { args: { variant: 'danger' } };
export const Warning: Story = {
  args: {
    variant: 'warning',
    title: 'Descartar cambios',
    description: 'Tienes cambios sin guardar. ¿Deseas continuar?',
  },
};
export const Info: Story = {
  args: { variant: 'info', title: 'Confirmar acción', description: '¿Deseas continuar?' },
};
export const WithoutDescription: Story = { args: { variant: 'info', description: '' } };
