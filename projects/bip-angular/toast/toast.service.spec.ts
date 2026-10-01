import { Component, inject } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BipToast } from './toast.service';
import type { BipToastConfig } from './toast.types';

@Component({
  template: `<button type="button" (click)="trigger()">Mostrar toast</button>`,
})
class HostComponent {
  readonly toast = inject(BipToast);
  config: BipToastConfig = { message: 'Operación completada' };
  lastId: number | undefined;

  trigger(): void {
    this.lastId = this.toast.show(this.config);
  }
}

describe('BipToast', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('region con role="region" y aria-label localizado', async () => {
    const { fixture } = await render(HostComponent);
    fixture.componentInstance.toast.show({ message: 'Hola' });
    fixture.detectChanges();
    await waitFor(() => expect(screen.getByRole('region', { name: 'Notificaciones' })).toBeInTheDocument());
  });

  it('show() muestra el mensaje en el DOM', async () => {
    const { fixture } = await render(HostComponent);
    fixture.componentInstance.toast.show({ message: 'Guardado correctamente' });
    fixture.detectChanges();
    await waitFor(() => expect(screen.getByText('Guardado correctamente')).toBeInTheDocument());
  });

  it('renderiza el título cuando se provee', async () => {
    const { fixture } = await render(HostComponent);
    fixture.componentInstance.toast.show({ title: 'Éxito', message: 'Guardado' });
    fixture.detectChanges();
    await waitFor(() => expect(screen.getByText('Éxito')).toBeInTheDocument());
  });

  it('info/success usan role="status"; warning/danger usan role="alert"', async () => {
    const { fixture } = await render(HostComponent);
    fixture.componentInstance.toast.show({ message: 'info', variant: 'info' });
    fixture.componentInstance.toast.show({ message: 'danger', variant: 'danger' });
    fixture.detectChanges();
    await waitFor(() => {
      expect(screen.getByText('info').closest('[role]')).toHaveAttribute('role', 'status');
      expect(screen.getByText('danger').closest('[role]')).toHaveAttribute('role', 'alert');
    });
  });

  it('cada toast tiene un botón de cerrar visible que lo quita del DOM', async () => {
    const { fixture } = await render(HostComponent);
    fixture.componentInstance.toast.show({ message: 'Cerrable' });
    fixture.detectChanges();
    await waitFor(() => expect(screen.getByText('Cerrable')).toBeInTheDocument());

    await userEvent.click(screen.getByRole('button', { name: 'Cerrar alerta' }));
    fixture.detectChanges();
    await waitFor(() => expect(screen.queryByText('Cerrable')).not.toBeInTheDocument(), { timeout: 1000 });
  });

  it('múltiples toasts son visibles simultáneamente', async () => {
    const { fixture } = await render(HostComponent);
    fixture.componentInstance.toast.show({ message: 'Uno' });
    fixture.componentInstance.toast.show({ message: 'Dos' });
    fixture.detectChanges();
    await waitFor(() => {
      expect(screen.getByText('Uno')).toBeInTheDocument();
      expect(screen.getByText('Dos')).toBeInTheDocument();
    });
  });

  it('respeta max — se elimina el toast más antiguo al superar el límite', async () => {
    const { fixture } = await render(HostComponent);
    for (let i = 1; i <= 4; i++) {
      fixture.componentInstance.toast.show({ message: `Toast ${i}` });
    }
    fixture.detectChanges();
    await waitFor(() => {
      expect(screen.queryByText('Toast 1')).not.toBeInTheDocument();
      expect(screen.getByText('Toast 2')).toBeInTheDocument();
      expect(screen.getByText('Toast 3')).toBeInTheDocument();
      expect(screen.getByText('Toast 4')).toBeInTheDocument();
    });
  });

  it('muestra barra de progreso cuando duration > 0', async () => {
    const { fixture } = await render(HostComponent);
    fixture.componentInstance.toast.show({ message: 'Con progreso', duration: 5000 });
    fixture.detectChanges();
    await waitFor(() => expect(screen.getByText('Con progreso')).toBeInTheDocument());
    expect(document.querySelector('.bip-toast-progress-track')).toBeInTheDocument();
  });

  it('no muestra barra de progreso para toasts persistentes (duration: 0)', async () => {
    const { fixture } = await render(HostComponent);
    fixture.componentInstance.toast.show({ message: 'Persistente', duration: 0 });
    fixture.detectChanges();
    await waitFor(() => expect(screen.getByText('Persistente')).toBeInTheDocument());
    expect(document.querySelector('.bip-toast-progress-track')).not.toBeInTheDocument();
  });

  it('posición por defecto es top-right', async () => {
    const { fixture } = await render(HostComponent);
    fixture.componentInstance.toast.show({ message: 'Hola' });
    fixture.detectChanges();
    await waitFor(() =>
      expect(document.querySelector('.bip-toast-region')).toHaveClass('bip-toast-region--top-right')
    );
  });

  it('auto-dismiss tras la duración configurada', async () => {
    vi.useFakeTimers();
    const { fixture } = await render(HostComponent);
    fixture.componentInstance.toast.show({ message: 'Temporal', duration: 100 });
    fixture.detectChanges();

    await vi.advanceTimersByTimeAsync(100 + 250 + 10);
    fixture.detectChanges();
    expect(screen.queryByText('Temporal')).not.toBeInTheDocument();
  });

  it('toast persistente (duration: 0) no se auto-descarta', async () => {
    vi.useFakeTimers();
    const { fixture } = await render(HostComponent);
    fixture.componentInstance.toast.show({ message: 'No se va', duration: 0 });
    fixture.detectChanges();

    await vi.advanceTimersByTimeAsync(10000);
    fixture.detectChanges();
    expect(screen.getByText('No se va')).toBeInTheDocument();
  });
});
