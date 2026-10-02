import type { Meta, StoryObj } from '@storybook/angular-vite';
import { BipProgressBar } from './progress-bar.component';

const meta: Meta<BipProgressBar> = {
  title: 'Components/ProgressBar',
  component: BipProgressBar,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: 'select', options: ['default', 'success', 'warning', 'danger'] },
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
  },
};

export default meta;
type Story = StoryObj<BipProgressBar>;

export const Default: Story = { args: { value: 60 } };
export const WithLabelAndValue: Story = { args: { value: 60, label: 'Subiendo...', showValue: true } };
export const Indeterminate: Story = { args: { indeterminate: true, label: 'Cargando...' } };
export const Striped: Story = { args: { value: 60, striped: true, animated: true } };
export const WithHelperText: Story = {
  args: { value: 24, label: 'Archivos', showValue: true, helperText: '12 de 50 archivos subidos' },
};
