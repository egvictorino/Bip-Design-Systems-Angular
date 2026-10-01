import type { Meta, StoryObj } from '@storybook/angular-vite';
import { BipButton } from './button.component';

const meta: Meta<BipButton> = {
  title: 'Components/Button',
  component: BipButton,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'bare', 'soul', 'danger'] },
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
  },
  render: (args) => ({
    props: args,
    template: `<button bipButton [variant]="variant" [size]="size" [loading]="loading" [fullWidth]="fullWidth" [disabled]="disabled">Guardar</button>`,
  }),
};

export default meta;
type Story = StoryObj<BipButton>;

export const Default: Story = {
  args: { variant: 'primary', size: 'md', loading: false, fullWidth: false, disabled: false },
};
export const Loading: Story = { args: { ...Default.args, loading: true } };
export const Disabled: Story = { args: { ...Default.args, disabled: true } };
export const FullWidth: Story = {
  args: { ...Default.args, fullWidth: true },
  render: (args) => ({
    props: args,
    template: `<div style="width: 320px;"><button bipButton [variant]="variant" [size]="size" [fullWidth]="fullWidth">Guardar</button></div>`,
  }),
};

export const AllVariants: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
        <button bipButton variant="primary">Primary</button>
        <button bipButton variant="secondary">Secondary</button>
        <button bipButton variant="bare">Bare</button>
        <button bipButton variant="soul">Soul</button>
        <button bipButton variant="danger">Danger</button>
      </div>
    `,
  }),
};

export const AsLink: Story = {
  render: () => ({
    template: `<a bipButton href="#" variant="secondary">Enlace con estilo de botón</a>`,
  }),
};
