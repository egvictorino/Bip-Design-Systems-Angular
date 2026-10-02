import { Component } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { BipLink } from './link.component';

@Component({
  selector: 'bip-link-demo',
  imports: [BipLink],
  template: `
    <a bipLink href="#" [underline]="underline" [external]="external" [disabled]="disabled">
      Enlace de ejemplo
    </a>
  `,
})
class LinkDemo {
  underline: 'always' | 'hover' | 'none' = 'always';
  external = false;
  disabled = false;
}

const meta: Meta<LinkDemo> = {
  title: 'Components/Link',
  component: LinkDemo,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    underline: { control: 'radio', options: ['always', 'hover', 'none'] },
  },
};

export default meta;
type Story = StoryObj<LinkDemo>;

export const Default: Story = { args: { underline: 'always' } };
export const HoverUnderline: Story = { args: { underline: 'hover' } };
export const External: Story = { args: { external: true } };
export const Disabled: Story = { args: { disabled: true } };
