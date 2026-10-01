import { Component } from '@angular/core';
import { render, screen, fireEvent, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { BipDropdown } from './dropdown.component';
import { BipDropdownTrigger } from './dropdown-trigger.directive';
import { BipDropdownMenu } from './dropdown-menu.component';
import { BipDropdownItem } from './dropdown-item.component';
import { BipDropdownItemCheckbox } from './dropdown-item-checkbox.component';
import { BipDropdownDivider } from './dropdown-divider.component';
import { BipDropdownGroup } from './dropdown-group.component';
import { BipDropdownSubmenu } from './dropdown-submenu.component';

@Component({
  imports: [
    BipDropdown,
    BipDropdownTrigger,
    BipDropdownMenu,
    BipDropdownItem,
    BipDropdownItemCheckbox,
    BipDropdownDivider,
    BipDropdownGroup,
    BipDropdownSubmenu,
  ],
  template: `
    <bip-dropdown [(open)]="open">
      <button type="button" bipDropdownTrigger>Opciones</button>
      <bip-dropdown-menu>
        <button type="button" bipDropdownItem (click)="onEdit()">Editar</button>
        <button type="button" bipDropdownItem disabled>Duplicar (deshabilitado)</button>
        <bip-dropdown-divider />
        <bip-dropdown-group label="Zona de peligro">
          <button type="button" bipDropdownItem variant="danger" (click)="onDelete()">Eliminar</button>
        </bip-dropdown-group>
        <button type="button" bipDropdownItemCheckbox [(checked)]="checked">Marcar</button>
        <bip-dropdown-submenu label="Más opciones">
          <button type="button" bipDropdownItem (click)="onArchive()">Archivar</button>
          <button type="button" bipDropdownItem (click)="onMove()">Mover a...</button>
        </bip-dropdown-submenu>
      </bip-dropdown-menu>
    </bip-dropdown>
  `,
})
class HostComponent {
  open = false;
  checked = false;
  onEdit = vi.fn();
  onDelete = vi.fn();
  onArchive = vi.fn();
  onMove = vi.fn();
}

describe('BipDropdown', () => {
  it('no renderiza el menú cuando está cerrado', async () => {
    await render(HostComponent);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('clic en el trigger abre el menú y enfoca el primer item', async () => {
    await render(HostComponent);
    await userEvent.click(screen.getByRole('button', { name: 'Opciones' }));
    await waitFor(() => expect(screen.getByRole('menu')).toBeInTheDocument());
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Editar' })).toHaveFocus());
  });

  it('aria-haspopup/expanded/controls correctos en el trigger', async () => {
    await render(HostComponent);
    const trigger = screen.getByRole('button', { name: 'Opciones' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'true');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(trigger);
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));
    expect(trigger.getAttribute('aria-controls')).toBe(screen.getByRole('menu').id);
  });

  it('clic en un item lo ejecuta y cierra el menú', async () => {
    await render(HostComponent);
    await userEvent.click(screen.getByRole('button', { name: 'Opciones' }));
    await waitFor(() => expect(screen.getByRole('menu')).toBeInTheDocument());

    await userEvent.click(screen.getByRole('menuitem', { name: 'Editar' }));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('ArrowDown mueve el foco al siguiente item, saltando los disabled', async () => {
    await render(HostComponent);
    await userEvent.click(screen.getByRole('button', { name: 'Opciones' }));
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Editar' })).toHaveFocus());

    fireEvent.keyDown(screen.getByRole('menu'), { key: 'ArrowDown', keyCode: 40 });
    expect(screen.getByRole('menuitem', { name: 'Eliminar' })).toHaveFocus();
  });

  it('ArrowUp desde el primer item va al último (wrap)', async () => {
    await render(HostComponent);
    await userEvent.click(screen.getByRole('button', { name: 'Opciones' }));
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Editar' })).toHaveFocus());

    fireEvent.keyDown(screen.getByRole('menu'), { key: 'ArrowUp', keyCode: 38 });
    expect(screen.getByRole('menuitem', { name: 'Más opciones' })).toHaveFocus();
  });

  it('End mueve el foco al último item', async () => {
    await render(HostComponent);
    await userEvent.click(screen.getByRole('button', { name: 'Opciones' }));
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Editar' })).toHaveFocus());

    fireEvent.keyDown(screen.getByRole('menu'), { key: 'End', keyCode: 35 });
    expect(screen.getByRole('menuitem', { name: 'Más opciones' })).toHaveFocus();
  });

  it('Escape cierra el menú y devuelve el foco al trigger', async () => {
    await render(HostComponent);
    const trigger = screen.getByRole('button', { name: 'Opciones' });
    await userEvent.click(trigger);
    await waitFor(() => expect(screen.getByRole('menu')).toBeInTheDocument());

    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('clic fuera cierra el menú', async () => {
    await render(HostComponent);
    await userEvent.click(screen.getByRole('button', { name: 'Opciones' }));
    await waitFor(() => expect(screen.getByRole('menu')).toBeInTheDocument());

    await userEvent.click(document.body);
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  });

  it('separador tiene role="separator"', async () => {
    await render(HostComponent);
    await userEvent.click(screen.getByRole('button', { name: 'Opciones' }));
    await waitFor(() => expect(screen.getByRole('separator')).toBeInTheDocument());
  });

  it('grupo tiene role="group" con su label', async () => {
    await render(HostComponent);
    await userEvent.click(screen.getByRole('button', { name: 'Opciones' }));
    await waitFor(() => expect(screen.getByRole('group', { name: 'Zona de peligro' })).toBeInTheDocument());
  });

  it('item checkbox alterna aria-checked sin cerrar el menú', async () => {
    const { fixture } = await render(HostComponent);
    await userEvent.click(screen.getByRole('button', { name: 'Opciones' }));
    await waitFor(() => expect(screen.getByRole('menu')).toBeInTheDocument());

    const checkbox = screen.getByRole('menuitemcheckbox', { name: 'Marcar' });
    expect(checkbox).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(checkbox);
    expect(checkbox).toHaveAttribute('aria-checked', 'true');
    expect(fixture.componentInstance.checked).toBe(true);
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('lanza si <bip-dropdown-menu> se usa fuera de <bip-dropdown>', async () => {
    @Component({
      imports: [BipDropdownMenu],
      template: `<bip-dropdown-menu>Contenido</bip-dropdown-menu>`,
    })
    class OrphanMenuHost {}

    await expect(render(OrphanMenuHost)).rejects.toThrow(
      '<bip-dropdown-menu> debe usarse dentro de <bip-dropdown>'
    );
  });
});

describe('BipDropdownSubmenu', () => {
  it('clic en el trigger del submenú lo abre, sin cerrar el dropdown', async () => {
    await render(HostComponent);
    await userEvent.click(screen.getByRole('button', { name: 'Opciones' }));
    await waitFor(() => expect(screen.getByRole('menu')).toBeInTheDocument());

    const submenuTrigger = screen.getByRole('menuitem', { name: 'Más opciones' });
    expect(submenuTrigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(submenuTrigger).toHaveAttribute('aria-expanded', 'false');

    // fireEvent.click (no userEvent.click): userEvent simula el hover real antes del click, y
    // el (mouseenter) del contenedor ya abriría el submenú, haciendo que toggle() lo cierre de
    // nuevo en el mismo gesto — fireEvent.click dispara solo el evento click, como Enter/Espacio
    // desde teclado.
    fireEvent.click(submenuTrigger);
    expect(submenuTrigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('menuitem', { name: 'Archivar' })).toBeInTheDocument();
    expect(screen.getAllByRole('menu')).toHaveLength(2); // el dropdown raíz + el submenú
  });

  it('ArrowRight en el trigger abre el submenú y enfoca su primer item', async () => {
    await render(HostComponent);
    await userEvent.click(screen.getByRole('button', { name: 'Opciones' }));
    await waitFor(() => expect(screen.getByRole('menu')).toBeInTheDocument());

    const submenuTrigger = screen.getByRole('menuitem', { name: 'Más opciones' });
    submenuTrigger.focus();
    fireEvent.keyDown(submenuTrigger, { key: 'ArrowRight' });

    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Archivar' })).toHaveFocus());
  });

  it('ArrowDown dentro del submenú navega entre sus propios items', async () => {
    await render(HostComponent);
    await userEvent.click(screen.getByRole('button', { name: 'Opciones' }));
    await waitFor(() => expect(screen.getByRole('menu')).toBeInTheDocument());

    const submenuTrigger = screen.getByRole('menuitem', { name: 'Más opciones' });
    submenuTrigger.focus();
    fireEvent.keyDown(submenuTrigger, { key: 'ArrowRight' });
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Archivar' })).toHaveFocus());

    fireEvent.keyDown(screen.getByRole('menuitem', { name: 'Archivar' }), {
      key: 'ArrowDown',
      keyCode: 40,
    });
    expect(screen.getByRole('menuitem', { name: 'Mover a...' })).toHaveFocus();
  });

  it('ArrowLeft dentro del submenú lo cierra y devuelve el foco al trigger, sin cerrar el dropdown', async () => {
    await render(HostComponent);
    await userEvent.click(screen.getByRole('button', { name: 'Opciones' }));
    await waitFor(() => expect(screen.getByRole('menu')).toBeInTheDocument());

    const submenuTrigger = screen.getByRole('menuitem', { name: 'Más opciones' });
    submenuTrigger.focus();
    fireEvent.keyDown(submenuTrigger, { key: 'ArrowRight' });
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Archivar' })).toHaveFocus());

    fireEvent.keyDown(screen.getByRole('menuitem', { name: 'Archivar' }), { key: 'ArrowLeft' });
    expect(screen.queryByRole('menuitem', { name: 'Archivar' })).not.toBeInTheDocument();
    expect(submenuTrigger).toHaveFocus();
    expect(screen.getByRole('menu', { name: 'Opciones' })).toBeInTheDocument();
  });

  it('Escape dentro del submenú solo lo cierra a él, no todo el dropdown', async () => {
    await render(HostComponent);
    await userEvent.click(screen.getByRole('button', { name: 'Opciones' }));
    await waitFor(() => expect(screen.getByRole('menu')).toBeInTheDocument());

    const submenuTrigger = screen.getByRole('menuitem', { name: 'Más opciones' });
    submenuTrigger.focus();
    fireEvent.keyDown(submenuTrigger, { key: 'ArrowRight' });
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Archivar' })).toHaveFocus());

    fireEvent.keyDown(screen.getByRole('menuitem', { name: 'Archivar' }), { key: 'Escape' });
    expect(screen.queryByRole('menuitem', { name: 'Archivar' })).not.toBeInTheDocument();
    expect(submenuTrigger).toHaveFocus();
    expect(screen.getAllByRole('menu')).toHaveLength(1); // el dropdown raíz sigue abierto
  });

  it('clic en un item del submenú lo ejecuta y cierra todo el dropdown', async () => {
    const { fixture } = await render(HostComponent);
    await userEvent.click(screen.getByRole('button', { name: 'Opciones' }));
    await waitFor(() => expect(screen.getByRole('menu')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('menuitem', { name: 'Más opciones' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Archivar' }));

    expect(fixture.componentInstance.onArchive).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('mouseenter/mouseleave en el contenedor abren y cierran el submenú', async () => {
    await render(HostComponent);
    await userEvent.click(screen.getByRole('button', { name: 'Opciones' }));
    await waitFor(() => expect(screen.getByRole('menu')).toBeInTheDocument());

    const submenuTrigger = screen.getByRole('menuitem', { name: 'Más opciones' });
    const container = submenuTrigger.parentElement as HTMLElement;

    fireEvent.mouseEnter(container);
    expect(screen.getByRole('menuitem', { name: 'Archivar' })).toBeInTheDocument();

    fireEvent.mouseLeave(container);
    expect(screen.queryByRole('menuitem', { name: 'Archivar' })).not.toBeInTheDocument();
  });
});
