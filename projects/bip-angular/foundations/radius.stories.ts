import type { Meta, StoryObj } from '@storybook/angular-vite';
import { BipFoundationsRadius } from './radius.component';

const meta: Meta<BipFoundationsRadius> = {
  title: 'Foundations/Radius',
  component: BipFoundationsRadius,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<BipFoundationsRadius>;

export const Overview: Story = {};
