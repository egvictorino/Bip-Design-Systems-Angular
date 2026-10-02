import type { Meta, StoryObj } from '@storybook/angular-vite';
import { BipFoundationsMotion } from './motion.component';

const meta: Meta<BipFoundationsMotion> = {
  title: 'Foundations/Motion',
  component: BipFoundationsMotion,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<BipFoundationsMotion>;

export const Overview: Story = {};
