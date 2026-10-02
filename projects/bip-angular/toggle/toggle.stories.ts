import type { Meta, StoryObj } from '@storybook/angular-vite';
import { BipToggle } from './toggle.component';

const meta: Meta<BipToggle> = {
  title: 'Components/Toggle',
  component: BipToggle,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
  },
};

export default meta;
type Story = StoryObj<BipToggle>;

export const Default: Story = { args: { label: 'Notificaciones por correo' } };
export const WithHelperText: Story = {
  args: { ...Default.args, helperText: 'Recibirás un resumen semanal' },
};
export const WithError: Story = {
  args: { ...Default.args, error: true, errorMessage: 'Debes habilitar esta opción' },
};
export const Required: Story = { args: { ...Default.args, required: true } };

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <bip-toggle size="sm" label="Pequeño" />
        <bip-toggle size="md" label="Mediano" />
        <bip-toggle size="lg" label="Grande" />
      </div>
    `,
  }),
};
