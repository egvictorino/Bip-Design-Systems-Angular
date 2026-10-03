import type { Meta, StoryObj } from '@storybook/angular-vite';
import { BipSlider } from './slider.component';

const meta: Meta<BipSlider> = {
  title: 'Components/Slider',
  component: BipSlider,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<BipSlider>;

export const Default: Story = { args: { label: 'Volumen', value: 50 } };
export const WithValue: Story = { args: { ...Default.args, showValue: true } };
export const WithHelperText: Story = {
  args: { ...Default.args, helperText: 'Ajusta el volumen general' },
};
export const WithError: Story = {
  args: { ...Default.args, error: true, errorMessage: 'El volumen debe ser mayor a 0' },
};
export const CustomRange: Story = {
  args: { label: 'Temperatura', min: 16, max: 30, step: 0.5, value: 22, showValue: true },
};
export const FullWidth: Story = { args: { ...Default.args, fullWidth: true } };
