import { Component } from '@angular/core';
import { render, screen, fireEvent, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
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
    <bip-sidebar [open]="open" [collapsed]="collapsed" [variant]="variant" (openChange)="onOpenChange($event)">
      <bip-sidebar-header>
        <bip-sidebar-brand href="/">Bip</bip-sidebar-brand>
        <button type="button" bipSidebarTrigger>Toggle</button>
      </bip-sidebar-header>
      <bip-sidebar-content>
        <bip-sidebar-group label="Principal">
          <bip-sidebar-item href="/inicio" label="Inicio" [active]="true" />
          <bip-sidebar-item href="/pacientes" label="Pacientes" [badge]="3" />
          <bip-sidebar-item label="Deshabilitado" [disabled]="true" />
        </bip-sidebar-group>
        <bip-sidebar-submenu label="Configuración" [defaultOpen]="submenuDefaultOpen">
          <bip-sidebar-item href="/config/general" label="General" />
          <bip-sidebar-item href="/config/seguridad" label="Seguridad" />
        </bip-sidebar-submenu>
      </bip-sidebar-content>
      <bip-sidebar-footer>Pie</bip-sidebar-footer>
    </bip-sidebar>
  `,
})
class HostComponent {
  open = false;
  collapsed = false;
  variant: 'light' | 'dark' | 'primary' = 'light';
  submenuDefaultOpen = false;
  onOpenChange = vi.fn();
}

describe('BipSidebar', () => {
  it('role="navigation" con aria-label localizado (nav)', async () => {
    await render(HostComponent);
    expect(screen.getAllByRole('navigation', { name: 'Navegación lateral' })[0]).toBeInTheDocument();
  });

  it('BipSidebarContent es un landmark de navegación independiente (navLandmark)', async () => {
    await render(HostComponent);
    expect(screen.getByRole('navigation', { name: 'Navegación' })).toBeInTheDocument();
  });

  it('item activo tiene aria-current="page"', async () => {
    await render(HostComponent);
    expect(screen.getByRole('link', { name: 'Inicio' })).toHaveAttribute('aria-current', 'page');
  });

  it('item deshabilitado sin href es un <button disabled>', async () => {
    await render(HostComponent);
    expect(screen.getByRole('button', { name: 'Deshabilitado' })).toBeDisabled();
  });

  it('trigger de collapse con aria-expanded/aria-controls/aria-label localizado', async () => {
    await render(HostComponent);
    const trigger = screen.getByRole('button', { name: 'Colapsar sidebar' });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger.getAttribute('aria-controls')).toBeTruthy();
  });

  it('colapsado: el aria-label del trigger cambia a "Expandir sidebar"', async () => {
    await render(HostComponent, { componentProperties: { collapsed: true } });
    expect(screen.getByRole('button', { name: 'Expandir sidebar' })).toBeInTheDocument();
  });

  it('colapsado: BipSidebarBrand y el label del grupo no se renderizan', async () => {
    await render(HostComponent, { componentProperties: { collapsed: true } });
    expect(screen.queryByText('Bip')).not.toBeInTheDocument();
    expect(screen.queryByText('Principal')).not.toBeInTheDocument();
  });

  it('colapsado: el label del item sigue siendo el nombre accesible (vía aria-label)', async () => {
    await render(HostComponent, { componentProperties: { collapsed: true } });
    expect(screen.getByRole('link', { name: 'Inicio' })).toBeInTheDocument();
  });

  it('colapsado: el aria-label del item con badge incluye el conteo localizado', async () => {
    await render(HostComponent, { componentProperties: { collapsed: true } });
    expect(screen.getByRole('link', { name: 'Pacientes (3 notificaciones)' })).toBeInTheDocument();
  });

  it('clic en el trigger de collapse alterna collapsed', async () => {
    await render(HostComponent);
    const trigger = screen.getByRole('button', { name: 'Colapsar sidebar' });
    await userEvent.click(trigger);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Expandir sidebar' })).toBeInTheDocument());
  });

  it('aplica la clase de variante correspondiente', async () => {
    await render(HostComponent, { componentProperties: { variant: 'dark' } });
    expect(document.querySelector('.bip-sidebar--dark')).toBeInTheDocument();
  });

  it('clic en un item cierra el drawer móvil', async () => {
    const { fixture } = await render(HostComponent, { componentProperties: { open: true } });
    await userEvent.click(screen.getByRole('link', { name: 'Pacientes', hidden: true }));
    expect(fixture.componentInstance.onOpenChange).toHaveBeenCalledWith(false);
  });

  it('overlay móvil presente solo cuando open', async () => {
    const { rerender } = await render(HostComponent);
    expect(document.querySelector('.bip-sidebar-overlay')).not.toBeInTheDocument();

    await rerender({ componentProperties: { open: true } });
    expect(document.querySelector('.bip-sidebar-overlay')).toBeInTheDocument();
  });

  it('clic en el overlay cierra el drawer móvil', async () => {
    const { fixture } = await render(HostComponent, { componentProperties: { open: true } });
    const overlay = document.querySelector('.bip-sidebar-overlay') as HTMLElement;
    await userEvent.click(overlay);
    expect(fixture.componentInstance.onOpenChange).toHaveBeenCalledWith(false);
  });

  it('Escape cierra el drawer móvil', async () => {
    const { fixture } = await render(HostComponent, { componentProperties: { open: true } });
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(fixture.componentInstance.onOpenChange).toHaveBeenCalledWith(false);
  });

  describe('teclado (flechas, clamp sin wrap)', () => {
    it('ArrowDown mueve el foco al siguiente item', async () => {
      await render(HostComponent);
      const inicio = screen.getByRole('link', { name: 'Inicio' });
      inicio.focus();
      fireEvent.keyDown(inicio, { key: 'ArrowDown' });
      expect(screen.getByRole('link', { name: 'Pacientes' })).toHaveFocus();
    });

    it('ArrowUp en el primer item no hace nada (clamp, no wrap)', async () => {
      await render(HostComponent);
      const inicio = screen.getByRole('link', { name: 'Inicio' });
      inicio.focus();
      fireEvent.keyDown(inicio, { key: 'ArrowUp' });
      expect(inicio).toHaveFocus();
    });
  });

  describe('BipSidebarSubMenu', () => {
    it('expandido: render del trigger con aria-expanded/aria-controls', async () => {
      await render(HostComponent);
      const trigger = screen.getByRole('button', { name: 'Configuración' });
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(trigger.getAttribute('aria-controls')).toBeTruthy();
    });

    it('clic en el trigger abre/cierra la sublista', async () => {
      await render(HostComponent);
      const trigger = screen.getByRole('button', { name: 'Configuración' });
      await userEvent.click(trigger);
      await waitFor(() => expect(screen.getByRole('link', { name: 'General' })).toBeInTheDocument());

      await userEvent.click(trigger);
      await waitFor(() => expect(screen.queryByRole('link', { name: 'General' })).not.toBeInTheDocument());
    });

    it('defaultOpen la muestra abierta desde el inicio', async () => {
      await render(HostComponent, { componentProperties: { submenuDefaultOpen: true } });
      expect(screen.getByRole('link', { name: 'General' })).toBeInTheDocument();
    });

    it('colapsado: solo muestra el trigger con tooltip, sin la sublista', async () => {
      await render(HostComponent, {
        componentProperties: { collapsed: true, submenuDefaultOpen: true },
      });
      expect(screen.queryByText('Configuración')).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: 'General' })).not.toBeInTheDocument();
    });

    it('Escape cierra la sublista y devuelve el foco a su trigger', async () => {
      await render(HostComponent, { componentProperties: { submenuDefaultOpen: true } });
      const general = screen.getByRole('link', { name: 'General' });
      fireEvent.keyDown(general, { key: 'Escape' });
      await waitFor(() => expect(screen.getByRole('button', { name: 'Configuración' })).toHaveFocus());
    });
  });

  it('lanza si <bip-sidebar-item> se usa fuera de <bip-sidebar>', async () => {
    @Component({
      imports: [BipSidebarItem],
      template: `<bip-sidebar-item label="Huérfano" />`,
    })
    class OrphanHost {}

    await expect(render(OrphanHost)).rejects.toThrow('<bip-sidebar-item> debe usarse dentro de <bip-sidebar>');
  });
});
