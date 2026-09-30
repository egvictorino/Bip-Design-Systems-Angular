import type { Meta, StoryObj } from '@storybook/angular-vite';
import { BipFoundationsColors } from './colors.component';

const meta: Meta<BipFoundationsColors> = {
  title: 'Foundations/Colors',
  component: BipFoundationsColors,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<BipFoundationsColors>;

export const Overview: Story = {};
