import type { Meta, StoryObj } from '@storybook/angular-vite';
import { BipTextarea } from './textarea.component';

const meta: Meta<BipTextarea> = {
  title: 'Components/Textarea',
  component: BipTextarea,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: 'select', options: ['outlined', 'filled', 'bare'] },
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
    resize: { control: 'select', options: ['none', 'vertical', 'horizontal', 'both'] },
  },
};

export default meta;
type Story = StoryObj<BipTextarea>;

export const Default: Story = {
  args: { label: 'Comentario', variant: 'outlined', size: 'md' },
};

export const WithHelperText: Story = {
  args: { ...Default.args, helperText: 'Máximo 500 caracteres' },
};

export const WithError: Story = {
  args: { ...Default.args, error: true, errorMessage: 'Este campo es requerido' },
};

export const WithCounter: Story = {
  args: { ...Default.args, maxLength: 120, value: 'Texto de ejemplo' },
};

export const AutoGrow: Story = {
  args: { label: 'Descripción', autoGrow: true, value: 'Este textarea crece con el contenido.' },
};

export const FullWidth: Story = {
  args: { ...Default.args, fullWidth: true },
};
