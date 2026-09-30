import { Component } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { BipStack } from './stack.component';

@Component({
  selector: 'bip-stack-demo',
  imports: [BipStack],
  template: `
    <div bipStack [direction]="direction" [gap]="gap" [align]="align" [justify]="justify" [wrap]="wrap">
      @for (i of [1, 2, 3]; track i) {
        <div style="background: var(--color-surface-3); padding: var(--space-4); border-radius: var(--radius-control);">
          Item {{ i }}
        </div>
      }
    </div>
  `,
})
class StackDemo {
  direction: 'row' | 'column' = 'row';
  gap: '0' | '0-5' | '1' | '1-5' | '2' | '3' | '4' | '5' | '6' | '8' | '10' | '12' | '16' = '4';
  align: 'start' | 'center' | 'end' | 'stretch' | 'baseline' | undefined;
  justify: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly' | undefined;
  wrap = false;
}

const meta: Meta<StackDemo> = {
  title: 'Components/Stack',
  component: StackDemo,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    direction: { control: 'radio', options: ['row', 'column'] },
    align: {
      control: 'select',
      options: [undefined, 'start', 'center', 'end', 'stretch', 'baseline'],
    },
    justify: {
      control: 'select',
      options: [undefined, 'start', 'center', 'end', 'between', 'around', 'evenly'],
    },
  },
};

export default meta;
type Story = StoryObj<StackDemo>;

export const Row: Story = { args: { direction: 'row', gap: '4' } };
export const Column: Story = { args: { direction: 'column', gap: '4' } };
