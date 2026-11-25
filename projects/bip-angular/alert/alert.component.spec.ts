import { Component } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { describe, expect, it, vi } from 'vitest';
import { BipAlert, type BipAlertVariant } from './alert.component';

@Component({
  imports: [BipAlert],
  template: `
    <bip-alert
      data-testid="host"
      [variant]="variant"
      [title]="title"
      [closable]="closable"
      (closed)="onClosed()"
    >
      Mensaje de la alerta
    </bip-alert>
  `,
})
class HostComponent {
  variant: BipAlertVariant = 'info';
  title: string | undefined;
  closable = false;
  onClosed = vi.fn();
}

describe('BipAlert', () => {
  it('info usa role="status"', async () => {
    await render(HostComponent, { componentProperties: { variant: 'info' } });
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('success usa role="status"', async () => {
    await render(HostComponent, { componentProperties: { variant: 'success' } });
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('warning usa role="alert"', async () => {
    await render(HostComponent, { componentProperties: { variant: 'warning' } });
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('danger usa role="alert"', async () => {
    await render(HostComponent, { componentProperties: { variant: 'danger' } });
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renderiza el contenido proyectado', async () => {
    await render(HostComponent);
    expect(screen.getByText('Mensaje de la alerta')).toBeInTheDocument();
  });

  it('renderiza el title cuando se provee', async () => {
    await render(HostComponent, { componentProperties: { title: 'Atención' } });
    expect(screen.getByText('Atención')).toBeInTheDocument();
  });

  it('closable=false no renderiza el botón de cerrar', async () => {
    await render(HostComponent);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('closable=true renderiza el botón con aria-label localizado', async () => {
    await render(HostComponent, { componentProperties: { closable: true } });
    expect(screen.getByRole('button', { name: 'Cerrar alerta' })).toBeInTheDocument();
  });

  it('clic en el botón de cerrar emite closed', async () => {
    const { fixture } = await render(HostComponent, { componentProperties: { closable: true } });
    screen.getByRole('button', { name: 'Cerrar alerta' }).click();
    expect(fixture.componentInstance.onClosed).toHaveBeenCalled();
  });

  it('aplica la clase del variant en el host', async () => {
    await render(HostComponent, { componentProperties: { variant: 'danger' } });
    expect(screen.getByTestId('host')).toHaveClass('bip-alert--danger');
  });
});
