import type { Meta, StoryObj } from '@storybook/angular-vite';
import { BipFoundationsSpacing } from './spacing.component';

const meta: Meta<BipFoundationsSpacing> = {
  title: 'Foundations/Spacing',
  component: BipFoundationsSpacing,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<BipFoundationsSpacing>;

export const Overview: Story = {};
