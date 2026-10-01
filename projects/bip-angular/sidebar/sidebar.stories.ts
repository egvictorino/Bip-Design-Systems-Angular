import { Component, signal } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { BipSidebar } from './sidebar.component';
import { BipSidebarHeader } from './sidebar-header.component';
import { BipSidebarBrand } from './sidebar-brand.component';
import { BipSidebarContent } from './sidebar-content.component';
import { BipSidebarGroup } from './sidebar-group.component';
import { BipSidebarItem } from './sidebar-item.component';
import { BipSidebarSubMenu } from './sidebar-submenu.component';
import { BipSidebarFooter } from './sidebar-footer.component';
import { BipSidebarTrigger } from './sidebar-trigger.component';

@Component({
  selector: 'bip-sidebar-demo',
  imports: [
    BipSidebar,
    BipSidebarHeader,
    BipSidebarBrand,
    BipSidebarContent,
    BipSidebarGroup,
    BipSidebarItem,
    BipSidebarSubMenu,
    BipSidebarFooter,
    BipSidebarTrigger,
  ],
  template: `
    <div style="display: flex; height: 28rem; border: 1px solid var(--color-edge)">
      <bip-sidebar [collapsed]="collapsed()">
        <bip-sidebar-header style="display: flex; align-items: center; justify-content: space-between">
          <bip-sidebar-brand href="/">BipUI</bip-sidebar-brand>
          <button type="button" bipSidebarTrigger (click)="collapsed.set(!collapsed())">⇔</button>
        </bip-sidebar-header>
        <bip-sidebar-content>
          <bip-sidebar-group label="Principal">
            <bip-sidebar-item href="#" label="Inicio" [active]="true" />
            <bip-sidebar-item href="#" label="Pacientes" [badge]="5" />
          </bip-sidebar-group>
          <bip-sidebar-submenu label="Configuración">
            <bip-sidebar-item href="#" label="General" />
            <bip-sidebar-item href="#" label="Seguridad" />
          </bip-sidebar-submenu>
        </bip-sidebar-content>
        <bip-sidebar-footer>v1.0.0</bip-sidebar-footer>
      </bip-sidebar>
      <div style="padding: 16px">Contenido principal</div>
    </div>
  `,
})
class SidebarDemo {
  readonly collapsed = signal(false);
}

const meta: Meta<SidebarDemo> = {
  title: 'Components/Sidebar',
  component: SidebarDemo,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<SidebarDemo>;

export const Basic: Story = {};

export const Dark: Story = {
  render: () => ({
    moduleMetadata: {
      imports: [BipSidebar, BipSidebarHeader, BipSidebarBrand, BipSidebarContent, BipSidebarItem, BipSidebarFooter],
    },
    template: `
      <div style="display: flex; height: 20rem;">
        <bip-sidebar variant="dark">
          <bip-sidebar-header><bip-sidebar-brand href="/">BipUI</bip-sidebar-brand></bip-sidebar-header>
          <bip-sidebar-content>
            <bip-sidebar-item href="#" label="Inicio" [active]="true" />
            <bip-sidebar-item href="#" label="Pacientes" />
          </bip-sidebar-content>
        </bip-sidebar>
        <div style="padding: 16px">Contenido principal</div>
      </div>
    `,
  }),
};
