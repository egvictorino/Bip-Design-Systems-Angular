import { Component } from '@angular/core';
import { render, screen, fireEvent } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { BipConfirmDialog, type BipConfirmDialogVariant } from './confirm-dialog.component';

@Component({
  imports: [BipConfirmDialog],
  template: `
    <bip-confirm-dialog
      [(open)]="open"
      [title]="title"
      [description]="description"
      [confirmLabel]="confirmLabel"
      [cancelLabel]="cancelLabel"
      [variant]="variant"
      (confirmed)="onConfirmed()"
      (closed)="onClosed()"
    />
  `,
})
class HostComponent {
  open = true;
  title = 'Confirmar eliminación';
  description: string | undefined = '¿Estás seguro? Esta acción no se puede deshacer.';
  confirmLabel: string | undefined;
  cancelLabel: string | undefined;
  variant: BipConfirmDialogVariant = 'info';
  onConfirmed = vi.fn();
  onClosed = vi.fn();
}

describe('BipConfirmDialog', () => {
  it('renderiza título y descripción cuando open=true', async () => {
    await render(HostComponent);
    expect(screen.getByText('Confirmar eliminación')).toBeInTheDocument();
    expect(
      screen.getByText('¿Estás seguro? Esta acción no se puede deshacer.')
    ).toBeInTheDocument();
  });

  it('no renderiza nada cuando open=false', async () => {
    await render(HostComponent, { componentProperties: { open: false } });
    expect(screen.queryByText('Confirmar eliminación')).not.toBeInTheDocument();
  });

  it('renderiza sin descripción', async () => {
    await render(HostComponent, { componentProperties: { description: undefined } });
    expect(screen.getByText('Confirmar eliminación')).toBeInTheDocument();
  });

  it('etiquetas por defecto localizadas', async () => {
    await render(HostComponent);
    expect(screen.getByRole('button', { name: 'Confirmar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
  });

  it('etiquetas custom', async () => {
    await render(HostComponent, {
      componentProperties: { confirmLabel: 'Eliminar', cancelLabel: 'Volver' },
    });
    expect(screen.getByRole('button', { name: 'Eliminar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Volver' })).toBeInTheDocument();
  });

  it('clic en confirmar emite confirmed', async () => {
    const { fixture } = await render(HostComponent);
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar' }));
    expect(fixture.componentInstance.onConfirmed).toHaveBeenCalledTimes(1);
  });

  it('clic en cancelar emite closed y cierra', async () => {
    const { fixture } = await render(HostComponent);
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(fixture.componentInstance.onClosed).toHaveBeenCalledTimes(1);
    expect(fixture.componentInstance.open).toBe(false);
  });

  it('role="dialog"', async () => {
    await render(HostComponent);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('Escape emite closed', async () => {
    const { fixture } = await render(HostComponent);
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(fixture.componentInstance.onClosed).toHaveBeenCalledTimes(1);
  });

  it('clic en el backdrop NO cierra (closeOnBackdrop fijo en false)', async () => {
    const { fixture } = await render(HostComponent);
    const backdrop = document.querySelector('.bip-modal-backdrop') as HTMLElement;
    await userEvent.click(backdrop);
    expect(fixture.componentInstance.onClosed).not.toHaveBeenCalled();
  });

  it('variant danger aplica la variante danger al botón de confirmar', async () => {
    await render(HostComponent, { componentProperties: { variant: 'danger' } });
    expect(screen.getByRole('button', { name: 'Confirmar' })).toHaveClass('bip-button--danger');
  });

  it('variant warning aplica la clase de override al botón de confirmar', async () => {
    await render(HostComponent, { componentProperties: { variant: 'warning' } });
    expect(screen.getByRole('button', { name: 'Confirmar' })).toHaveClass(
      'bip-confirm-dialog-confirm-btn--warning'
    );
  });
});
