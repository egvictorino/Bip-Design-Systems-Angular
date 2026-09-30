import type { Meta, StoryObj } from '@storybook/angular-vite';
import { BipDivider } from './divider.component';

const meta: Meta<BipDivider> = {
  title: 'Components/Divider',
  component: BipDivider,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    orientation: { control: 'radio', options: ['horizontal', 'vertical'] },
    variant: { control: 'radio', options: ['solid', 'dashed'] },
  },
};

export default meta;
type Story = StoryObj<BipDivider>;

export const Horizontal: Story = { args: { orientation: 'horizontal' } };
export const Dashed: Story = { args: { orientation: 'horizontal', variant: 'dashed' } };
export const WithLabel: Story = { args: { orientation: 'horizontal', label: 'O continúa con' } };
export const Vertical: Story = {
  args: { orientation: 'vertical' },
  render: (args) => ({
    props: args,
    template: `<div style="display: flex; align-items: stretch; height: 3rem; gap: var(--space-3);"><bip-divider orientation="vertical"></bip-divider></div>`,
  }),
};
