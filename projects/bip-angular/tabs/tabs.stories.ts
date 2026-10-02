import { Component, signal } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { BipTabs } from './tabs.component';
import { BipTabList } from './tab-list.component';
import { BipTab } from './tab.component';
import { BipTabPanel } from './tab-panel.component';

@Component({
  selector: 'bip-tabs-demo',
  imports: [BipTabs, BipTabList, BipTab, BipTabPanel],
  template: `
    <bip-tabs [value]="value()" (valueChange)="value.set($event)" style="max-width: 28rem">
      <bip-tab-list>
        <button type="button" bipTab value="general">General</button>
        <button type="button" bipTab value="detalles">Detalles</button>
        <button type="button" bipTab value="historial" disabled>Historial</button>
      </bip-tab-list>
      <bip-tab-panel value="general">Información general del expediente.</bip-tab-panel>
      <bip-tab-panel value="detalles">Detalles clínicos del paciente.</bip-tab-panel>
      <bip-tab-panel value="historial">Historial completo (deshabilitado en este demo).</bip-tab-panel>
    </bip-tabs>
  `,
})
class TabsDemo {
  readonly value = signal('general');
}

const meta: Meta<TabsDemo> = {
  title: 'Components/Tabs',
  component: TabsDemo,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<TabsDemo>;

export const Line: Story = {};

export const Pill: Story = {
  render: () => ({
    moduleMetadata: { imports: [BipTabs, BipTabList, BipTab, BipTabPanel] },
    template: `
      <bip-tabs value="general" variant="pill" style="max-width: 28rem">
        <bip-tab-list>
          <button type="button" bipTab value="general">General</button>
          <button type="button" bipTab value="detalles">Detalles</button>
        </bip-tab-list>
        <bip-tab-panel value="general">Contenido general.</bip-tab-panel>
        <bip-tab-panel value="detalles">Contenido de detalles.</bip-tab-panel>
      </bip-tabs>
    `,
  }),
};

export const Vertical: Story = {
  render: () => ({
    moduleMetadata: { imports: [BipTabs, BipTabList, BipTab, BipTabPanel] },
    template: `
      <bip-tabs value="general" orientation="vertical" style="max-width: 28rem">
        <bip-tab-list>
          <button type="button" bipTab value="general">General</button>
          <button type="button" bipTab value="detalles">Detalles</button>
        </bip-tab-list>
        <bip-tab-panel value="general">Contenido general.</bip-tab-panel>
        <bip-tab-panel value="detalles">Contenido de detalles.</bip-tab-panel>
      </bip-tabs>
    `,
  }),
};
