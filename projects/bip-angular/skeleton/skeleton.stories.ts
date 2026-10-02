import type { Meta, StoryObj } from '@storybook/angular-vite';
import { BipSkeleton } from './skeleton.component';

const meta: Meta<BipSkeleton> = {
  title: 'Components/Skeleton',
  component: BipSkeleton,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: 'radio', options: ['text', 'circle', 'rect'] },
    animation: { control: 'radio', options: ['pulse', 'wave', 'none'] },
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
  },
};

export default meta;
type Story = StoryObj<BipSkeleton>;

export const Text: Story = { args: { variant: 'text' } };
export const MultilineText: Story = { args: { variant: 'text', lines: 3 } };
export const Circle: Story = { args: { variant: 'circle', size: 'lg' } };
export const Rect: Story = { args: { variant: 'rect' } };
export const Wave: Story = { args: { variant: 'rect', animation: 'wave' } };
