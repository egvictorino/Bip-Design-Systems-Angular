import { Component, signal } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { BipPopover } from './popover.component';
import { BipPopoverTrigger } from './popover-trigger.directive';
import { BipPopoverContent, type BipPopoverPlacement } from './popover-content.component';

@Component({
  selector: 'bip-popover-demo',
  imports: [BipPopover, BipPopoverTrigger, BipPopoverContent],
  template: `
    <bip-popover [(open)]="open">
      <button type="button" bipPopoverTrigger style="padding: 8px 16px">Abrir popover</button>
      <bip-popover-content [placement]="placement">
        <p style="margin: 0 0 8px;">Contenido del popover. Puede incluir cualquier markup.</p>
        <button type="button" style="padding: 4px 8px" (click)="open.set(false)">Cerrar</button>
      </bip-popover-content>
    </bip-popover>
  `,
})
class PopoverDemo {
  readonly open = signal(false);
  placement: BipPopoverPlacement = 'bottom-start';
}

const meta: Meta<PopoverDemo> = {
  title: 'Components/Popover',
  component: PopoverDemo,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    placement: {
      control: 'select',
      options: ['bottom-start', 'bottom-end', 'top-start', 'top-end'],
    },
  },
};

export default meta;
type Story = StoryObj<PopoverDemo>;

export const Basic: Story = { args: {} };
export const BottomEnd: Story = { args: { placement: 'bottom-end' } };
export const TopStart: Story = { args: { placement: 'top-start' } };
export const TopEnd: Story = { args: { placement: 'top-end' } };
