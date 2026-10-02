import type { Meta, StoryObj } from '@storybook/angular-vite';
import { BipAlert } from './alert.component';

const meta: Meta<BipAlert> = {
  title: 'Components/Alert',
  component: BipAlert,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: 'select', options: ['info', 'success', 'warning', 'danger'] },
  },
  render: (args) => ({
    props: args,
    template: `<bip-alert [variant]="variant" [title]="title" [closable]="closable">Este es un mensaje de ejemplo.</bip-alert>`,
  }),
};

export default meta;
type Story = StoryObj<BipAlert>;

export const Info: Story = { args: { variant: 'info', title: 'Información' } };
export const Success: Story = { args: { variant: 'success', title: 'Éxito' } };
export const Warning: Story = { args: { variant: 'warning', title: 'Advertencia' } };
export const Danger: Story = { args: { variant: 'danger', title: 'Error' } };
export const Closable: Story = { args: { variant: 'info', title: 'Información', closable: true } };
export const WithoutTitle: Story = { args: { variant: 'info' } };
