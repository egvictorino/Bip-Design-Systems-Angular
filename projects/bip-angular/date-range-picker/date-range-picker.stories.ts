import type { Meta, StoryObj } from '@storybook/angular-vite';
import { BipDateRangePicker } from './date-range-picker.component';

const meta: Meta<BipDateRangePicker> = {
  title: 'Components/DateRangePicker',
  component: BipDateRangePicker,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
  },
};

export default meta;
type Story = StoryObj<BipDateRangePicker>;

export const Default: Story = {
  args: { label: 'Rango de estadía', placeholder: 'Selecciona un rango' },
};

export const WithValue: Story = {
  args: {
    ...Default.args,
    value: { from: new Date(), to: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000) },
  },
};

export const WithHelperText: Story = {
  args: { ...Default.args, helperText: 'Entrada y salida' },
};

export const WithError: Story = {
  args: { ...Default.args, error: true, errorMessage: 'Debes seleccionar un rango' },
};

export const FullWidth: Story = {
  args: { ...Default.args, fullWidth: true },
};
