import type { Meta, StoryObj } from '@storybook/angular-vite';
import { BipFoundationsBreakpoints } from './breakpoints.component';

const meta: Meta<BipFoundationsBreakpoints> = {
  title: 'Foundations/Breakpoints',
  component: BipFoundationsBreakpoints,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<BipFoundationsBreakpoints>;

export const Overview: Story = {};
