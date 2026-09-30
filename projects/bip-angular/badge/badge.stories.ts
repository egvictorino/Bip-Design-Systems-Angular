import type { Meta, StoryObj } from '@storybook/angular-vite';
import { BipBadge } from './badge.component';

const meta: Meta<BipBadge> = {
  title: 'Components/Badge',
  component: BipBadge,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'success', 'warning', 'danger', 'neutral'] },
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
  },
  render: (args) => ({
    props: args,
    template: `<bip-badge [variant]="variant" [size]="size" [dot]="dot">Etiqueta</bip-badge>`,
  }),
};

export default meta;
type Story = StoryObj<BipBadge>;

export const Default: Story = { args: { variant: 'primary', size: 'md', dot: false } };
export const WithDot: Story = { args: { variant: 'success', size: 'md', dot: true } };
export const AllVariants: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
        <bip-badge variant="primary">Primary</bip-badge>
        <bip-badge variant="success">Success</bip-badge>
        <bip-badge variant="warning">Warning</bip-badge>
        <bip-badge variant="danger">Danger</bip-badge>
        <bip-badge variant="neutral">Neutral</bip-badge>
      </div>
    `,
  }),
};
