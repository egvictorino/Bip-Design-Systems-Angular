import { Component } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { BipGrid } from './grid.component';

@Component({
  selector: 'bip-grid-demo',
  imports: [BipGrid],
  template: `
    <div bipGrid [columns]="columns" [gap]="gap">
      @for (i of [1, 2, 3, 4, 5, 6]; track i) {
        <div
          style="background: var(--color-surface-3); padding: var(--space-4); border-radius: var(--radius-control);"
        >
          Item {{ i }}
        </div>
      }
    </div>
  `,
})
class GridDemo {
  columns: 1 | 2 | 3 | 4 | 5 | 6 | 12 | 'responsive' = 3;
  gap: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '8' | '10' | '12' | '16' = '4';
}

const meta: Meta<GridDemo> = {
  title: 'Components/Grid',
  component: GridDemo,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    columns: { control: 'select', options: [1, 2, 3, 4, 5, 6, 12, 'responsive'] },
  },
};

export default meta;
type Story = StoryObj<GridDemo>;

export const FixedColumns: Story = { args: { columns: 3, gap: '4' } };
export const Responsive: Story = { args: { columns: 'responsive', gap: '4' } };
