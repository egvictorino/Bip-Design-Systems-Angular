import type { Meta, StoryObj } from '@storybook/angular-vite';
import { BipStatsCard } from './stats-card.component';

const meta: Meta<BipStatsCard> = {
  title: 'Components/StatsCard',
  component: BipStatsCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: 'select', options: ['elevated', 'outlined', 'flat'] },
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
  },
};

export default meta;
type Story = StoryObj<BipStatsCard>;

export const Default: Story = {
  args: { title: 'Ingresos', value: '$12,400' },
  render: (args) => ({
    props: args,
    template: `<bip-stats-card [title]="title" [value]="value" style="max-width: 16rem;" />`,
  }),
};

export const WithPositiveTrend: Story = {
  args: { title: 'Ingresos', value: '$12,400', trend: 12 },
  render: (args) => ({
    props: args,
    template: `<bip-stats-card [title]="title" [value]="value" [trend]="trend" style="max-width: 16rem;" />`,
  }),
};

export const WithNegativeTrend: Story = {
  args: { title: 'Cancelaciones', value: '38', trend: -8 },
  render: (args) => ({
    props: args,
    template: `<bip-stats-card [title]="title" [value]="value" [trend]="trend" style="max-width: 16rem;" />`,
  }),
};

export const Loading: Story = {
  args: { title: 'Ingresos', loading: true },
  render: (args) => ({
    props: args,
    template: `<bip-stats-card [title]="title" [loading]="loading" style="max-width: 16rem;" />`,
  }),
};
