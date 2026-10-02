import { Component } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { BipText } from './text.component';

@Component({
  selector: 'bip-text-demo',
  imports: [BipText],
  template: `<p bipText [size]="size" [weight]="weight" [color]="color" [truncate]="truncate">
    El veloz murciélago hindú comía feliz cardillo y kiwi.
  </p>`,
})
class TextDemo {
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' = 'md';
  weight: 'normal' | 'medium' | 'semibold' | 'bold' = 'normal';
  color: 'default' | 'secondary' | 'danger' | 'success' | 'warning' | 'info' | 'link' = 'default';
  truncate = false;
}

const meta: Meta<TextDemo> = {
  title: 'Components/Text',
  component: TextDemo,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<TextDemo>;

export const Default: Story = { args: { size: 'md', weight: 'normal', color: 'default' } };
export const Secondary: Story = { args: { size: 'sm', color: 'secondary' } };
export const Truncated: Story = {
  args: { truncate: true },
  render: (args) => ({
    props: args,
    template: `<div style="max-width: 12rem;"><p bipText truncate>El veloz murciélago hindú comía feliz cardillo y kiwi.</p></div>`,
  }),
};
