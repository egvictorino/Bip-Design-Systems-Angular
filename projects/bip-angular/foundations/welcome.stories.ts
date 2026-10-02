import type { Meta, StoryObj } from '@storybook/angular-vite';
import { BipFoundationsWelcome } from './welcome.component';

const meta: Meta<BipFoundationsWelcome> = {
  title: 'Foundations/Introduction',
  component: BipFoundationsWelcome,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<BipFoundationsWelcome>;

export const Default: Story = {};
