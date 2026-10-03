import { Component } from '@angular/core';
import { render, screen, fireEvent } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { BipStepper } from './stepper.component';
import { BipStepperStep } from './stepper-step.component';

@Component({
  imports: [BipStepper, BipStepperStep],
  template: `
    <bip-stepper [value]="value" [orientation]="orientation" (valueChange)="onValueChange($event)">
      <bip-stepper-step [value]="0" label="Datos personales" description="Nombre y contacto" />
      <bip-stepper-step [value]="1" label="Dirección" />
      <bip-stepper-step [value]="2" label="Pago" variant="danger" />
      <bip-stepper-step [value]="3" label="Confirmación" />
    </bip-stepper>
  `,
})
class HostComponent {
  value = 1;
  orientation: 'horizontal' | 'vertical' = 'horizontal';
  onValueChange = vi.fn();
}

describe('BipStepper', () => {
  it('role="list" con aria-label localizado y un listitem por paso', async () => {
    await render(HostComponent);
    expect(screen.getByRole('list', { name: 'Pasos del proceso' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
  });

  it('el paso activo es un div no interactivo con aria-current="step"', async () => {
    await render(HostComponent);
    const active = screen.getByText('Dirección').closest('[role="listitem"]') as HTMLElement;
    const marker = active.querySelector('[aria-current="step"]') as HTMLElement;
    expect(marker.tagName).toBe('DIV');
  });

  it('pasos no activos son <button>', async () => {
    await render(HostComponent);
    expect(screen.getByRole('button', { name: 'Datos personales' })).toBeInTheDocument();
  });

  it('clic en un paso pendiente cambia el valor', async () => {
    const { fixture } = await render(HostComponent);
    await userEvent.click(screen.getByRole('button', { name: 'Confirmación' }));
    expect(fixture.componentInstance.onValueChange).toHaveBeenCalledWith(3);
  });

  it('el paso activo no se puede clickear (no es un botón)', async () => {
    await render(HostComponent);
    expect(screen.queryByRole('button', { name: 'Dirección' })).not.toBeInTheDocument();
  });

  it('paso con variant de estado muestra un icono, no el número', async () => {
    await render(HostComponent);
    const dangerStep = screen.getByText('Pago').closest('[role="listitem"]') as HTMLElement;
    expect(dangerStep.querySelector('svg')).toBeInTheDocument();
    expect(dangerStep).not.toHaveTextContent('3');
  });

  it('aria-describedby apunta a la descripción, con id único', async () => {
    await render(HostComponent);
    const firstMarker = screen.getByRole('button', { name: 'Datos personales' });
    const descId = firstMarker.getAttribute('aria-describedby');
    expect(descId).toBeTruthy();
    expect(document.getElementById(descId as string)).toHaveTextContent('Nombre y contacto');
  });

  it('conector ausente en el último paso', async () => {
    await render(HostComponent);
    const lastStep = screen.getByText('Confirmación').closest('[role="listitem"]') as HTMLElement;
    expect(lastStep.querySelector('.bip-stepper-step-connector')).not.toBeInTheDocument();
  });

  describe('teclado (horizontal)', () => {
    it('ArrowRight en un paso pendiente avanza el valor activo', async () => {
      const { fixture } = await render(HostComponent, { componentProperties: { value: 2 } });
      const step = screen.getByRole('button', { name: 'Datos personales' });
      fireEvent.keyDown(step, { key: 'ArrowRight' });
      expect(fixture.componentInstance.onValueChange).toHaveBeenCalledWith(1);
    });

    it('ArrowLeft en un paso pendiente retrocede el valor activo', async () => {
      const { fixture } = await render(HostComponent);
      const step = screen.getByRole('button', { name: 'Confirmación' });
      fireEvent.keyDown(step, { key: 'ArrowLeft' });
      expect(fixture.componentInstance.onValueChange).toHaveBeenCalledWith(2);
    });

    it('ArrowLeft en el primer paso no hace nada', async () => {
      const { fixture } = await render(HostComponent, { componentProperties: { value: 2 } });
      const step = screen.getByRole('button', { name: 'Datos personales' });
      fireEvent.keyDown(step, { key: 'ArrowLeft' });
      expect(fixture.componentInstance.onValueChange).not.toHaveBeenCalledWith(-1);
    });
  });

  describe('orientation="vertical"', () => {
    it('ArrowDown/ArrowUp mueven el valor activo, ArrowRight no hace nada', async () => {
      const { fixture } = await render(HostComponent, {
        componentProperties: { orientation: 'vertical', value: 2 },
      });
      const step = screen.getByRole('button', { name: 'Datos personales' });
      fireEvent.keyDown(step, { key: 'ArrowRight' });
      expect(fixture.componentInstance.onValueChange).not.toHaveBeenCalled();

      fireEvent.keyDown(step, { key: 'ArrowDown' });
      expect(fixture.componentInstance.onValueChange).toHaveBeenCalledWith(1);
    });
  });

  it('lanza si <bip-stepper-step> se usa fuera de <bip-stepper>', async () => {
    @Component({
      imports: [BipStepperStep],
      template: `<bip-stepper-step [value]="0" label="Huérfano" />`,
    })
    class OrphanHost {}

    await expect(render(OrphanHost)).rejects.toThrow(
      '<bip-stepper-step> debe usarse dentro de <bip-stepper>'
    );
  });
});
