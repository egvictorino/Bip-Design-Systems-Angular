import { Component } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { render, screen, fireEvent, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { BipNavbar } from './navbar.component';
import { BipNavbarBrand } from './navbar-brand.component';
import { BipNavbarNav } from './navbar-nav.component';
import { BipNavbarItem } from './navbar-item.component';
import { BipNavbarActions } from './navbar-actions.component';

/**
 * `BipNavbar` decide si el panel móvil debe llevar `inert` consultando `BreakpointObserver`
 * (vía `mediaQuery()`), no solo CSS. El `MediaMatcher` real del CDK liga `window.matchMedia` en
 * su constructor la primera vez que algo lo inyecta en todo el proceso de test (singleton
 * `providedIn: 'root'`) — mockear `window.matchMedia` llega demasiado tarde. Se reemplaza
 * `BreakpointObserver` entero por DI: `matches: true` simula escritorio (panel siempre
 * interactivo, sin abrir el hamburguesa); los tests de comportamiento móvil usan `false`.
 */
function provideBreakpointObserver(matches: boolean) {
  return { provide: BreakpointObserver, useValue: { observe: () => of({ matches, breakpoints: {} }) } };
}

@Component({
  imports: [BipNavbar, BipNavbarBrand, BipNavbarNav, BipNavbarItem, BipNavbarActions],
  template: `
    <bip-navbar>
      <bip-navbar-brand href="/">Bip</bip-navbar-brand>
      <bip-navbar-nav>
        <bip-navbar-item href="/inicio" [active]="true">Inicio</bip-navbar-item>
        <bip-navbar-item href="/pacientes">Pacientes</bip-navbar-item>
        <bip-navbar-item [disabled]="true">Deshabilitado</bip-navbar-item>
      </bip-navbar-nav>
      <bip-navbar-actions>
        <button type="button" (click)="onLogout()">Salir</button>
      </bip-navbar-actions>
    </bip-navbar>
  `,
})
class HostComponent {
  onLogout = vi.fn();
}

const desktop = () => ({ providers: [provideBreakpointObserver(true)] });
const mobile = () => ({ providers: [provideBreakpointObserver(false)] });

describe('BipNavbar (escritorio)', () => {
  it('role="navigation" con aria-label localizado', async () => {
    await render(HostComponent, desktop());
    expect(screen.getByRole('navigation', { name: 'Navegación principal' })).toBeInTheDocument();
  });

  it('botón hamburguesa con aria-expanded/aria-controls y aria-label localizado', async () => {
    await render(HostComponent, desktop());
    const toggle = screen.getByRole('button', { name: 'Abrir menú' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(toggle);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Cerrar menú' })).toHaveAttribute('aria-expanded', 'true')
    );
    expect(screen.getByRole('button', { name: 'Cerrar menú' }).getAttribute('aria-controls')).toBeTruthy();
  });

  it('item activo tiene aria-current="page"', async () => {
    await render(HostComponent, desktop());
    expect(screen.getByRole('link', { name: 'Inicio' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Pacientes' })).not.toHaveAttribute('aria-current');
  });

  it('item deshabilitado sin href se renderiza como <button disabled>', async () => {
    await render(HostComponent, desktop());
    expect(screen.getByRole('button', { name: 'Deshabilitado' })).toBeDisabled();
  });

  it('clic en un item cierra el panel móvil', async () => {
    await render(HostComponent, desktop());
    await userEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Cerrar menú' })).toBeInTheDocument());

    await userEvent.click(screen.getByRole('link', { name: 'Pacientes' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Abrir menú' })).toBeInTheDocument());
  });

  it('clic en el brand (link) cierra el panel móvil', async () => {
    await render(HostComponent, desktop());
    await userEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Cerrar menú' })).toBeInTheDocument());

    await userEvent.click(screen.getByRole('link', { name: 'Bip' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Abrir menú' })).toBeInTheDocument());
  });

  it('Escape cierra el panel móvil y devuelve el foco al botón de hamburguesa', async () => {
    await render(HostComponent, desktop());
    await userEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Cerrar menú' })).toBeInTheDocument());

    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Abrir menú' })).toHaveFocus());
  });

  it('clic fuera cierra el panel móvil', async () => {
    await render(HostComponent, desktop());
    await userEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Cerrar menú' })).toBeInTheDocument());

    await userEvent.click(document.body);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Abrir menú' })).toBeInTheDocument());
  });

  describe('teclado', () => {
    it('ArrowRight mueve el foco al siguiente item, saltando el deshabilitado', async () => {
      await render(HostComponent, desktop());
      const inicio = screen.getByRole('link', { name: 'Inicio' });
      inicio.focus();
      fireEvent.keyDown(inicio, { key: 'ArrowRight' });
      expect(screen.getByRole('link', { name: 'Pacientes' })).toHaveFocus();
    });

    it('ArrowLeft desde el primero va al último habilitado (wrap)', async () => {
      await render(HostComponent, desktop());
      const inicio = screen.getByRole('link', { name: 'Inicio' });
      inicio.focus();
      fireEvent.keyDown(inicio, { key: 'ArrowLeft' });
      expect(screen.getByRole('link', { name: 'Pacientes' })).toHaveFocus();
    });

    it('End mueve el foco al último item habilitado', async () => {
      await render(HostComponent, desktop());
      const inicio = screen.getByRole('link', { name: 'Inicio' });
      inicio.focus();
      fireEvent.keyDown(inicio, { key: 'End' });
      expect(screen.getByRole('link', { name: 'Pacientes' })).toHaveFocus();
    });
  });

  it('lanza si <bip-navbar-item> se usa fuera de <bip-navbar>', async () => {
    @Component({
      imports: [BipNavbarItem],
      template: `<bip-navbar-item>Huérfano</bip-navbar-item>`,
    })
    class OrphanHost {}

    await expect(render(OrphanHost, desktop())).rejects.toThrow(
      '<bip-navbar-item> debe usarse dentro de <bip-navbar>'
    );
  });
});

describe('BipNavbar (mobile, debajo del breakpoint md)', () => {
  it('el panel está inert cuando está cerrado (sus items no son accesibles)', async () => {
    await render(HostComponent, mobile());
    expect(screen.queryByRole('link', { name: 'Inicio' })).not.toBeInTheDocument();
  });

  it('abrir el panel expone sus items y enfoca el primero', async () => {
    await render(HostComponent, mobile());
    await userEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));
    await waitFor(() => expect(screen.getByRole('link', { name: 'Inicio' })).toHaveFocus());
  });
});
