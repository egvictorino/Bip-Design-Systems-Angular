import { Component, signal } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import type { BipSize } from '@bip-design-systems/angular/core';
import { BipDrawerPanel, type BipDrawerPanelPlacement } from './drawer-panel.component';
import { BipDrawerPanelFooter, BipDrawerPanelHeaderActions } from './drawer-panel-slots';

@Component({
  selector: 'bip-drawer-panel-demo',
  imports: [BipDrawerPanel, BipDrawerPanelFooter, BipDrawerPanelHeaderActions],
  template: `
    <button type="button" style="padding: 8px 16px" (click)="open.set(true)">Abrir panel</button>
    <bip-drawer-panel
      [(open)]="open"
      [title]="title"
      [size]="size"
      [placement]="placement"
      [closeOnBackdrop]="closeOnBackdrop"
    >
      <p>Contenido del panel lateral. Puede incluir cualquier markup.</p>
      <button type="button" bipDrawerPanelFooter style="padding: 8px 16px" (click)="open.set(false)">
        Cerrar
      </button>
    </bip-drawer-panel>
  `,
})
class DrawerPanelDemo {
  readonly open = signal(false);
  title = 'Panel lateral';
  size: BipSize = 'md';
  placement: BipDrawerPanelPlacement = 'right';
  closeOnBackdrop = true;
}

const meta: Meta<DrawerPanelDemo> = {
  title: 'Components/DrawerPanel',
  component: DrawerPanelDemo,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    placement: { control: 'select', options: ['left', 'right'] },
  },
};

export default meta;
type Story = StoryObj<DrawerPanelDemo>;

export const Basic: Story = { args: {} };
export const LeftPlacement: Story = { args: { placement: 'left' } };
export const WithoutCloseOnBackdrop: Story = { args: { closeOnBackdrop: false } };

export const WithHeaderActions: Story = {
  render: () => ({
    template: `
      <button type="button" style="padding: 8px 16px" (click)="open.set(true)">Abrir panel</button>
      <bip-drawer-panel [(open)]="open" title="Editar perfil">
        <button type="button" bipDrawerPanelHeaderActions style="padding: 4px 8px">⋮</button>
        <p>Formulario de ejemplo dentro del panel.</p>
      </bip-drawer-panel>
    `,
    moduleMetadata: { imports: [BipDrawerPanel, BipDrawerPanelHeaderActions] },
    props: { open: signal(false) },
  }),
};
