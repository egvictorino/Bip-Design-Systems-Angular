import type { Meta, StoryObj } from '@storybook/angular-vite';
import { BipSelect } from './select.component';
import type { BipSelectOption, BipSelectOptionGroup } from './select.component';

const OPTIONS: BipSelectOption[] = [
  { value: 'mx', label: 'México' },
  { value: 'us', label: 'Estados Unidos' },
  { value: 'ca', label: 'Canadá' },
];

const GROUPS: BipSelectOptionGroup[] = [
  { label: 'América', options: [{ value: 'mx', label: 'México' }, { value: 'us', label: 'Estados Unidos' }] },
  { label: 'Europa', options: [{ value: 'es', label: 'España' }, { value: 'fr', label: 'Francia' }] },
];

const meta: Meta<BipSelect> = {
  title: 'Components/Select',
  component: BipSelect,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: 'select', options: ['outlined', 'filled', 'bare'] },
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
  },
};

export default meta;
type Story = StoryObj<BipSelect>;

export const Default: Story = {
  args: { label: 'País', placeholder: 'Selecciona un país', options: OPTIONS },
};

export const WithHelperText: Story = {
  args: { ...Default.args, helperText: 'Usaremos esto para calcular impuestos' },
};

export const WithError: Story = {
  args: { ...Default.args, error: true, errorMessage: 'Debes seleccionar un país' },
};

export const Grouped: Story = {
  args: { label: 'País', placeholder: 'Selecciona un país', groups: GROUPS },
};

export const FullWidth: Story = {
  args: { ...Default.args, fullWidth: true },
};
