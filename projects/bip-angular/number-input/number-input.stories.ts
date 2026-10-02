import type { Meta, StoryObj } from '@storybook/angular-vite';
import { BipNumberInput } from './number-input.component';

const meta: Meta<BipNumberInput> = {
  title: 'Components/NumberInput',
  component: BipNumberInput,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: 'select', options: ['outlined', 'filled', 'bare'] },
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
  },
};

export default meta;
type Story = StoryObj<BipNumberInput>;

export const Default: Story = { args: { label: 'Cantidad', value: 1 } };

export const WithMinMax: Story = { args: { ...Default.args, min: 0, max: 10 } };

export const WithDecimals: Story = { args: { label: 'Precio', value: 19.99, decimals: 2, step: 0.01 } };

export const WithPrefixSuffix: Story = { args: { label: 'Precio', value: 100, prefix: '$', suffix: 'MXN' } };

export const WithError: Story = {
  args: { ...Default.args, error: true, errorMessage: 'Debes ingresar una cantidad válida' },
};

export const ReadOnly: Story = { args: { label: 'Cantidad', value: 5, readonly: true } };
