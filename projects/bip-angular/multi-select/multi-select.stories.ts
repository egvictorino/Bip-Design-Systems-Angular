import type { Meta, StoryObj } from '@storybook/angular-vite';
import { BipMultiSelect } from './multi-select.component';
import type { BipMultiSelectOption } from './multi-select.component';

const OPTIONS: BipMultiSelectOption[] = [
  { value: 'mx', label: 'México' },
  { value: 'us', label: 'Estados Unidos' },
  { value: 'ca', label: 'Canadá' },
  { value: 'br', label: 'Brasil' },
  { value: 'ar', label: 'Argentina', disabled: true },
];

const GROUPED_OPTIONS: BipMultiSelectOption[] = [
  { value: 'mx', label: 'México', group: 'América' },
  { value: 'us', label: 'Estados Unidos', group: 'América' },
  { value: 'es', label: 'España', group: 'Europa' },
  { value: 'fr', label: 'Francia', group: 'Europa' },
];

const meta: Meta<BipMultiSelect> = {
  title: 'Components/MultiSelect',
  component: BipMultiSelect,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: 'select', options: ['outlined', 'filled', 'bare'] },
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
  },
};

export default meta;
type Story = StoryObj<BipMultiSelect>;

export const Default: Story = {
  args: { label: 'Países', placeholder: 'Selecciona países', options: OPTIONS },
};

export const Preselected: Story = {
  args: { ...Default.args, value: ['mx', 'us'] },
};

export const Grouped: Story = {
  args: { label: 'Países', placeholder: 'Selecciona países', options: GROUPED_OPTIONS },
};

export const WithSelectAll: Story = {
  args: { ...Default.args, showSelectAll: true },
};

export const WithMaxVisibleChips: Story = {
  args: { ...Default.args, value: ['mx', 'us', 'ca', 'br'], maxVisibleChips: 2 },
};

export const WithHelperText: Story = {
  args: { ...Default.args, helperText: 'Puedes seleccionar varios países' },
};

export const WithError: Story = {
  args: { ...Default.args, error: true, errorMessage: 'Debes seleccionar al menos un país' },
};

export const Loading: Story = {
  args: { ...Default.args, loading: true },
};

export const FullWidth: Story = {
  args: { ...Default.args, fullWidth: true },
};
