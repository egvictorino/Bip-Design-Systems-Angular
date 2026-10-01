import { Component } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { BipNavbar } from './navbar.component';
import { BipNavbarBrand } from './navbar-brand.component';
import { BipNavbarNav } from './navbar-nav.component';
import { BipNavbarItem } from './navbar-item.component';
import { BipNavbarActions } from './navbar-actions.component';

@Component({
  selector: 'bip-navbar-demo',
  imports: [BipNavbar, BipNavbarBrand, BipNavbarNav, BipNavbarItem, BipNavbarActions],
  template: `
    <bip-navbar>
      <bip-navbar-brand href="/">BipUI</bip-navbar-brand>
      <bip-navbar-nav>
        <bip-navbar-item href="#" [active]="true">Inicio</bip-navbar-item>
        <bip-navbar-item href="#">Pacientes</bip-navbar-item>
        <bip-navbar-item href="#">Agenda</bip-navbar-item>
      </bip-navbar-nav>
      <bip-navbar-actions>
        <button type="button" style="padding: 8px 16px">Cerrar sesión</button>
      </bip-navbar-actions>
    </bip-navbar>
  `,
})
class NavbarDemo {}

const meta: Meta<NavbarDemo> = {
  title: 'Components/Navbar',
  component: NavbarDemo,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<NavbarDemo>;

export const Basic: Story = {};

export const Elevated: Story = {
  render: () => ({
    moduleMetadata: { imports: [BipNavbar, BipNavbarBrand, BipNavbarNav, BipNavbarItem] },
    template: `
      <bip-navbar variant="elevated">
        <bip-navbar-brand href="/">BipUI</bip-navbar-brand>
        <bip-navbar-nav>
          <bip-navbar-item href="#" [active]="true">Inicio</bip-navbar-item>
          <bip-navbar-item href="#">Pacientes</bip-navbar-item>
        </bip-navbar-nav>
      </bip-navbar>
    `,
  }),
};
