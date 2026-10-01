import { Component } from '@angular/core';
import { render, screen, fireEvent } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { BipDrawerPanel, type BipDrawerPanelPlacement } from './drawer-panel.component';
import { BipDrawerPanelFooter, BipDrawerPanelHeaderActions } from './drawer-panel-slots';
import type { BipSize } from '@bip-design-systems/angular/core';

@Component({
  imports: [BipDrawerPanel, BipDrawerPanelFooter, BipDrawerPanelHeaderActions],
  template: `
    <bip-drawer-panel
      [(open)]="open"
      [title]="title"
      [size]="size"
      [placement]="placement"
      [closeOnBackdrop]="closeOnBackdrop"
      (closed)="onClosed()"
    >
      Contenido del drawer
      <button type="button" bipDrawerPanelHeaderActions>Acción</button>
      <button type="button" bipDrawerPanelFooter>Guardar</button>
    </bip-drawer-panel>
  `,
})
class HostComponent {
  open = false;
  title: string | undefined = 'Panel lateral';
  size: BipSize = 'md';
  placement: BipDrawerPanelPlacement = 'right';
  closeOnBackdrop = true;
  onClosed = vi.fn();
}

describe('BipDrawerPanel', () => {
  it('no renderiza nada cuando open=false', async () => {
    await render(HostComponent, { componentProperties: { open: false } });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renderiza el panel cuando open=true', async () => {
    await render(HostComponent, { componentProperties: { open: true } });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('aria-modal="true" y aria-label con el título', async () => {
    await render(HostComponent, { componentProperties: { open: true } });
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', 'Panel lateral');
  });

  it('renderiza el contenido proyectado por defecto y los slots', async () => {
    await render(HostComponent, { componentProperties: { open: true } });
    expect(screen.getByText('Contenido del drawer')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Acción' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();
  });

  it('botón de cerrar con aria-label localizado cierra el panel', async () => {
    const { fixture } = await render(HostComponent, { componentProperties: { open: true } });
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar panel' }));
    expect(fixture.componentInstance.onClosed).toHaveBeenCalledTimes(1);
    expect(fixture.componentInstance.open).toBe(false);
  });

  it('Escape siempre cierra el panel', async () => {
    const { fixture } = await render(HostComponent, { componentProperties: { open: true } });
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(fixture.componentInstance.onClosed).toHaveBeenCalledTimes(1);
  });

  it('clic en el backdrop cierra cuando closeOnBackdrop=true (default)', async () => {
    const { fixture } = await render(HostComponent, { componentProperties: { open: true } });
    const backdrop = document.querySelector('.bip-drawer-panel-backdrop') as HTMLElement;
    await userEvent.click(backdrop);
    expect(fixture.componentInstance.onClosed).toHaveBeenCalledTimes(1);
  });

  it('clic en el backdrop NO cierra cuando closeOnBackdrop=false', async () => {
    const { fixture } = await render(HostComponent, {
      componentProperties: { open: true, closeOnBackdrop: false },
    });
    const backdrop = document.querySelector('.bip-drawer-panel-backdrop') as HTMLElement;
    await userEvent.click(backdrop);
    expect(fixture.componentInstance.onClosed).not.toHaveBeenCalled();
  });

  it('aplica la clase de tamaño y placement correspondientes', async () => {
    await render(HostComponent, {
      componentProperties: { open: true, size: 'lg', placement: 'left' },
    });
    const panel = document.querySelector('.bip-drawer-panel') as HTMLElement;
    expect(panel).toHaveClass('bip-drawer-panel--lg');
    expect(panel).toHaveClass('bip-drawer-panel--left');
  });

  it('no renderiza el header cuando no se provee title', async () => {
    await render(HostComponent, { componentProperties: { open: true, title: undefined } });
    expect(screen.queryByRole('button', { name: 'Cerrar panel' })).not.toBeInTheDocument();
  });

  it('no renderiza el footer cuando no se proyecta contenido en ese slot', async () => {
    @Component({
      imports: [BipDrawerPanel],
      template: `<bip-drawer-panel [open]="true">Solo contenido</bip-drawer-panel>`,
    })
    class NoFooterHost {}

    await render(NoFooterHost);
    expect(document.querySelector('.bip-drawer-panel-footer')).not.toBeInTheDocument();
  });
});
