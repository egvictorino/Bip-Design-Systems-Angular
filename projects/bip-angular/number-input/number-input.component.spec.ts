import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { BipNumberInput } from './number-input.component';

@Component({
  imports: [BipNumberInput],
  template: `
    <bip-number-input
      [label]="label"
      [helperText]="helperText"
      [error]="error"
      [errorMessage]="errorMessage"
      [min]="min"
      [max]="max"
      [step]="step"
      [decimals]="decimals"
      [prefix]="prefix"
      [suffix]="suffix"
      [(value)]="value"
    />
  `,
})
class HostComponent {
  label = 'Cantidad';
  helperText = '';
  error = false;
  errorMessage = '';
  min: number | undefined = undefined;
  max: number | undefined = undefined;
  step = 1;
  decimals: number | undefined = undefined;
  prefix = '';
  suffix = '';
  value: number | null = null;
}

@Component({
  imports: [BipNumberInput, ReactiveFormsModule],
  template: `<bip-number-input [formControl]="control" label="Cantidad" />`,
})
class ReactiveFormHostComponent {
  readonly control = new FormControl<number | null>(null);
}

describe('BipNumberInput', () => {
  it('renderiza un spinbutton con label vinculado', async () => {
    await render(HostComponent);
    expect(screen.getByRole('spinbutton', { name: 'Cantidad' })).toBeInTheDocument();
  });

  it('incrementa el valor al hacer click en el botón de incrementar', async () => {
    const { fixture } = await render(HostComponent, { componentProperties: { value: 5 } });
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Incrementar' }));
    expect(fixture.componentInstance.value).toBe(6);
  });

  it('decrementa el valor al hacer click en el botón de decrementar', async () => {
    const { fixture } = await render(HostComponent, { componentProperties: { value: 5 } });
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Decrementar' }));
    expect(fixture.componentInstance.value).toBe(4);
  });

  it('incrementa con la flecha arriba del teclado', async () => {
    const { fixture } = await render(HostComponent, { componentProperties: { value: 1 } });
    const spinbutton = screen.getByRole('spinbutton');
    spinbutton.focus();
    const user = userEvent.setup();
    await user.keyboard('{ArrowUp}');
    expect(fixture.componentInstance.value).toBe(2);
  });

  it('decrementa con la flecha abajo del teclado', async () => {
    const { fixture } = await render(HostComponent, { componentProperties: { value: 1 } });
    const spinbutton = screen.getByRole('spinbutton');
    spinbutton.focus();
    const user = userEvent.setup();
    await user.keyboard('{ArrowDown}');
    expect(fixture.componentInstance.value).toBe(0);
  });

  it('respeta min: no decrementa por debajo del mínimo', async () => {
    await render(HostComponent, { componentProperties: { value: 0, min: 0 } });
    expect(screen.getByRole('button', { name: 'Decrementar' })).toBeDisabled();
  });

  it('respeta max: no incrementa por encima del máximo', async () => {
    await render(HostComponent, { componentProperties: { value: 10, max: 10 } });
    expect(screen.getByRole('button', { name: 'Incrementar' })).toBeDisabled();
  });

  it('al escribir un valor válido actualiza [(value)]', async () => {
    const { fixture } = await render(HostComponent);
    const user = userEvent.setup();
    await user.type(screen.getByRole('spinbutton'), '42');
    expect(fixture.componentInstance.value).toBe(42);
  });

  it('al perder el foco, clampa el valor fuera de rango', async () => {
    const { fixture } = await render(HostComponent, { componentProperties: { max: 10 } });
    const spinbutton = screen.getByRole('spinbutton');
    const user = userEvent.setup();
    await user.type(spinbutton, '99');
    spinbutton.blur();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(fixture.componentInstance.value).toBe(10);
  });

  it('al perder el foco, formatea al número de decimales especificado', async () => {
    const { fixture } = await render(HostComponent, { componentProperties: { decimals: 2 } });
    const spinbutton = screen.getByRole('spinbutton');
    const user = userEvent.setup();
    await user.type(spinbutton, '3.1');
    spinbutton.blur();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(fixture.componentInstance.value).toBe(3.1);
    expect(spinbutton).toHaveValue('3.10');
  });

  it('renderiza prefix y suffix', async () => {
    await render(HostComponent, { componentProperties: { prefix: '$', suffix: 'MXN' } });
    expect(screen.getByText('$')).toBeInTheDocument();
    expect(screen.getByText('MXN')).toBeInTheDocument();
  });

  it('tiene aria-invalid cuando error=true', async () => {
    await render(HostComponent, { componentProperties: { error: true } });
    expect(screen.getByRole('spinbutton')).toHaveAttribute('aria-invalid', 'true');
  });

  it('renderiza errorMessage con role="alert"', async () => {
    await render(HostComponent, { componentProperties: { error: true, errorMessage: 'Requerido' } });
    expect(screen.getByRole('alert')).toHaveTextContent('Requerido');
  });

  // ── ControlValueAccessor ────────────────────────────────────────────────────

  it('writeValue() vía FormControl refleja el valor inicial', async () => {
    const host = new ReactiveFormHostComponent();
    host.control.setValue(7);
    await render(ReactiveFormHostComponent, { componentProperties: { control: host.control } });
    expect(screen.getByRole('spinbutton')).toHaveValue('7');
  });

  it('propaga los cambios al FormControl', async () => {
    const host = new ReactiveFormHostComponent();
    await render(ReactiveFormHostComponent, { componentProperties: { control: host.control } });
    const user = userEvent.setup();
    await user.type(screen.getByRole('spinbutton'), '9');
    expect(host.control.value).toBe(9);
  });

  it('setDisabledState() vía FormControl deshabilita el input', async () => {
    const host = new ReactiveFormHostComponent();
    host.control.disable();
    await render(ReactiveFormHostComponent, { componentProperties: { control: host.control } });
    expect(screen.getByRole('spinbutton')).toBeDisabled();
  });
});
