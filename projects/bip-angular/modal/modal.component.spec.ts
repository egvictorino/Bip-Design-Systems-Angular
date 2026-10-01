import { Component } from '@angular/core';
import { render, screen, fireEvent } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { BipModal, type BipModalSize } from './modal.component';
import { BipModalHeader } from './modal-header.component';
import { BipModalBody } from './modal-body.component';
import { BipModalFooter } from './modal-footer.component';

@Component({
  imports: [BipModal, BipModalBody, BipModalFooter],
  template: `
    <bip-modal
      [(open)]="open"
      [title]="title"
      [size]="size"
      [closeOnBackdrop]="closeOnBackdrop"
      [closeOnEscape]="closeOnEscape"
      (closed)="onClosed()"
    >
      <bip-modal-body>Contenido del modal</bip-modal-body>
      <bip-modal-footer [align]="footerAlign">
        <button type="button">Aceptar</button>
      </bip-modal-footer>
    </bip-modal>
  `,
})
class HostComponent {
  open = false;
  title: string | undefined = 'Título';
  size: BipModalSize = 'md';
  closeOnBackdrop = true;
  closeOnEscape = true;
  footerAlign: 'left' | 'center' | 'right' = 'right';
  onClosed = vi.fn();
}

describe('BipModal', () => {
  it('no renderiza el diálogo cuando open=false', async () => {
    await render(HostComponent, { componentProperties: { open: false } });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renderiza el diálogo cuando open=true', async () => {
    await render(HostComponent, { componentProperties: { open: true } });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('aria-modal="true" y aria-labelledby apunta al título', async () => {
    await render(HostComponent, { componentProperties: { open: true } });
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    const titleId = dialog.getAttribute('aria-labelledby');
    expect(titleId).toBeTruthy();
    expect(document.getElementById(titleId as string)).toHaveTextContent('Título');
  });

  it('renderiza el contenido proyectado (body y footer)', async () => {
    await render(HostComponent, { componentProperties: { open: true } });
    expect(screen.getByText('Contenido del modal')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Aceptar' })).toBeInTheDocument();
  });

  it('el botón de cerrar del header tiene aria-label localizado y cierra el modal', async () => {
    const { fixture } = await render(HostComponent, { componentProperties: { open: true } });
    const closeBtn = screen.getByRole('button', { name: 'Cerrar modal' });
    await userEvent.click(closeBtn);
    expect(fixture.componentInstance.onClosed).toHaveBeenCalled();
    expect(fixture.componentInstance.open).toBe(false);
  });

  it('Escape cierra el modal cuando closeOnEscape=true (default)', async () => {
    const { fixture } = await render(HostComponent, { componentProperties: { open: true } });
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(fixture.componentInstance.onClosed).toHaveBeenCalled();
  });

  it('Escape NO cierra el modal cuando closeOnEscape=false', async () => {
    const { fixture } = await render(HostComponent, {
      componentProperties: { open: true, closeOnEscape: false },
    });
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(fixture.componentInstance.onClosed).not.toHaveBeenCalled();
  });

  it('clic en el backdrop cierra el modal cuando closeOnBackdrop=true (default)', async () => {
    const { fixture } = await render(HostComponent, { componentProperties: { open: true } });
    const backdrop = document.querySelector('.bip-modal-backdrop') as HTMLElement;
    await userEvent.click(backdrop);
    expect(fixture.componentInstance.onClosed).toHaveBeenCalled();
  });

  it('clic en el backdrop NO cierra el modal cuando closeOnBackdrop=false', async () => {
    const { fixture } = await render(HostComponent, {
      componentProperties: { open: true, closeOnBackdrop: false },
    });
    const backdrop = document.querySelector('.bip-modal-backdrop') as HTMLElement;
    await userEvent.click(backdrop);
    expect(fixture.componentInstance.onClosed).not.toHaveBeenCalled();
  });

  it('clic dentro del diálogo no cierra el modal', async () => {
    const { fixture } = await render(HostComponent, { componentProperties: { open: true } });
    await userEvent.click(screen.getByText('Contenido del modal'));
    expect(fixture.componentInstance.onClosed).not.toHaveBeenCalled();
  });

  it('aplica la clase de tamaño correspondiente', async () => {
    await render(HostComponent, { componentProperties: { open: true, size: 'lg' } });
    expect(document.querySelector('.bip-modal-dialog')).toHaveClass('bip-modal-dialog--lg');
  });

  it('footer alinea a la derecha por defecto', async () => {
    await render(HostComponent, { componentProperties: { open: true } });
    expect(screen.getByRole('button', { name: 'Aceptar' }).parentElement).toHaveClass(
      'bip-modal-footer--right'
    );
  });

  it('no renderiza <bip-modal-header> cuando no se provee title', async () => {
    await render(HostComponent, { componentProperties: { open: true, title: undefined } });
    expect(screen.queryByRole('button', { name: 'Cerrar modal' })).not.toBeInTheDocument();
  });
});

describe('BipModalHeader', () => {
  it('lanza si se usa fuera de <bip-modal>', async () => {
    @Component({
      imports: [BipModalHeader],
      template: `<bip-modal-header>Título</bip-modal-header>`,
    })
    class OrphanHeaderHost {}

    await expect(render(OrphanHeaderHost)).rejects.toThrow(
      '<bip-modal-header> debe usarse dentro de <bip-modal>'
    );
  });
});
