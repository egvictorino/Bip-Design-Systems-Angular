import { Component, signal } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { BipDropdown } from './dropdown.component';
import { BipDropdownTrigger } from './dropdown-trigger.directive';
import { BipDropdownMenu } from './dropdown-menu.component';
import { BipDropdownItem } from './dropdown-item.component';
import { BipDropdownItemCheckbox } from './dropdown-item-checkbox.component';
import { BipDropdownDivider } from './dropdown-divider.component';
import { BipDropdownGroup } from './dropdown-group.component';
import { BipDropdownSearch } from './dropdown-search.component';
import { BipDropdownSubmenu } from './dropdown-submenu.component';

@Component({
  selector: 'bip-dropdown-demo',
  imports: [
    BipDropdown,
    BipDropdownTrigger,
    BipDropdownMenu,
    BipDropdownItem,
    BipDropdownItemCheckbox,
    BipDropdownDivider,
    BipDropdownGroup,
    BipDropdownSearch,
    BipDropdownSubmenu,
  ],
  template: `
    <bip-dropdown [(open)]="open">
      <button type="button" bipDropdownTrigger style="padding: 8px 16px">Opciones ▾</button>
      <bip-dropdown-menu>
        <bip-dropdown-search [(value)]="search" />
        <button type="button" bipDropdownItem>Editar</button>
        <button type="button" bipDropdownItem>Duplicar</button>
        <button type="button" bipDropdownItemCheckbox [(checked)]="notify">Notificarme</button>
        <bip-dropdown-submenu label="Mover a">
          <button type="button" bipDropdownItem>Bandeja de entrada</button>
          <button type="button" bipDropdownItem>Archivados</button>
          <button type="button" bipDropdownItem>Spam</button>
        </bip-dropdown-submenu>
        <bip-dropdown-divider />
        <bip-dropdown-group label="Zona de peligro">
          <button type="button" bipDropdownItem variant="danger">Eliminar</button>
        </bip-dropdown-group>
      </bip-dropdown-menu>
    </bip-dropdown>
  `,
})
class DropdownDemo {
  readonly open = signal(false);
  search = '';
  notify = false;
}

const meta: Meta<DropdownDemo> = {
  title: 'Components/Dropdown',
  component: DropdownDemo,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<DropdownDemo>;

export const Basic: Story = {};
