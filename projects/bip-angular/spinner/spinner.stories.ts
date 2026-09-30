import type { Meta, StoryObj } from '@storybook/angular-vite';
import { BipSpinner } from './spinner.component';

const meta: Meta<BipSpinner> = {
  title: 'Components/Spinner',
  component: BipSpinner,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'inverse', 'danger', 'success', 'info'],
    },
    speed: { control: 'select', options: [undefined, 'slow', 'normal', 'fast'] },
  },
};

export default meta;
type Story = StoryObj<BipSpinner>;

export const Default: Story = { args: { size: 'md', variant: 'primary' } };
export const AllSizes: Story = {
  render: () => ({
    template: `
      <div style="display: flex; align-items: center; gap: 1rem;">
        <bip-spinner size="xs" />
        <bip-spinner size="sm" />
        <bip-spinner size="md" />
        <bip-spinner size="lg" />
        <bip-spinner size="xl" />
      </div>
    `,
  }),
};
