import { Component } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { BipContainer } from './container.component';

@Component({
  selector: 'bip-container-demo',
  imports: [BipContainer],
  template: `
    <div bipContainer [maxWidth]="maxWidth" style="background: var(--color-surface-2);">
      <p style="margin: 0; padding: var(--space-4) 0;">
        Contenido centrado con ancho máximo "{{ maxWidth }}".
      </p>
    </div>
  `,
})
class ContainerDemo {
  maxWidth: 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'lg';
}

const meta: Meta<ContainerDemo> = {
  title: 'Components/Container',
  component: ContainerDemo,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    maxWidth: { control: 'select', options: ['sm', 'md', 'lg', 'xl', 'full'] },
  },
};

export default meta;
type Story = StoryObj<ContainerDemo>;

export const Default: Story = {
  args: { maxWidth: 'lg' },
};

export const Full: Story = {
  args: { maxWidth: 'full' },
};
