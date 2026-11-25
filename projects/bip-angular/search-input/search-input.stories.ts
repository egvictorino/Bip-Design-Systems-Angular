import type { Meta, StoryObj } from '@storybook/angular-vite';
import { BipSearchInput } from './search-input.component';

const meta: Meta<BipSearchInput> = {
  title: 'Components/SearchInput',
  component: BipSearchInput,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: 'select', options: ['outlined', 'filled', 'bare'] },
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
  },
};

export default meta;
type Story = StoryObj<BipSearchInput>;

export const Default: Story = { args: { label: 'Buscar' } };
export const WithValue: Story = { args: { ...Default.args, value: 'consulta de ejemplo' } };
export const Loading: Story = { args: { ...Default.args, loading: true, value: 'buscando...' } };
export const Debounced: Story = { args: { ...Default.args, debounceMs: 300 } };
export const SearchOnEnter: Story = { args: { ...Default.args, searchOnEnter: true } };
export const WithError: Story = {
  args: {
    ...Default.args,
    error: true,
    errorMessage: 'La búsqueda debe tener al menos 3 caracteres',
  },
};
