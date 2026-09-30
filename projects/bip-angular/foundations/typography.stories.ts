import type { Meta, StoryObj } from '@storybook/angular-vite';
import { BipFoundationsTypography } from './typography.component';

const meta: Meta<BipFoundationsTypography> = {
  title: 'Foundations/Typography',
  component: BipFoundationsTypography,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<BipFoundationsTypography>;

export const Overview: Story = {};
