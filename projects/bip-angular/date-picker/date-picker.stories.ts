import type { Meta, StoryObj } from '@storybook/angular-vite';
import { BipDatePicker } from './date-picker.component';

const meta: Meta<BipDatePicker> = {
  title: 'Components/DatePicker',
  component: BipDatePicker,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
  },
};

export default meta;
type Story = StoryObj<BipDatePicker>;

export const Default: Story = {
  args: { label: 'Fecha de nacimiento', placeholder: 'Selecciona una fecha' },
};

export const WithValue: Story = {
  args: { ...Default.args, value: new Date() },
};

/** Valor 31-dic-2025: al navegar a enero 2026 aparece como día seleccionado de otro mes. */
export const WithOutsideMonthSelection: Story = {
  args: { ...Default.args, value: new Date(2025, 11, 31) },
};

export const WithMinMax: Story = {
  args: {
    ...Default.args,
    min: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    max: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
  },
};

export const WithHelperText: Story = {
  args: { ...Default.args, helperText: 'Formato día/mes/año' },
};

export const WithError: Story = {
  args: { ...Default.args, error: true, errorMessage: 'Debes seleccionar una fecha' },
};

export const Loading: Story = {
  args: { ...Default.args, loading: true },
};

export const FullWidth: Story = {
  args: { ...Default.args, fullWidth: true },
};
