import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { BipDatePicker } from './date-picker.component';

@Component({
  imports: [BipDatePicker],
  template: `
    <bip-date-picker
      [label]="label"
      [placeholder]="placeholder"
      [min]="min"
      [max]="max"
      [disabledDates]="disabledDates"
      [error]="error"
      [errorMessage]="errorMessage"
      [helperText]="helperText"
      [fullWidth]="fullWidth"
      [(value)]="value"
    />
  `,
})
class HostComponent {
  label = '';
  placeholder = '';
  min: Date | undefined = undefined;
  max: Date | undefined = undefined;
  disabledDates: Date[] = [];
  error = false;
  errorMessage = '';
  helperText = '';
  fullWidth = false;
  value: Date | null = null;
}

@Component({
  imports: [BipDatePicker, ReactiveFormsModule],
  template: `<bip-date-picker [formControl]="control" label="Fecha de nacimiento" />`,
})
class ReactiveFormHostComponent {
  readonly control = new FormControl<Date | null>(null);
}

describe('BipDatePicker', () => {
  it('muestra el placeholder por defecto cuando no hay valor', async () => {
    await render(HostComponent);
    expect(screen.getByText('DD/MM/AAAA')).toBeInTheDocument();
  });

  it('muestra la fecha formateada cuando hay un valor', async () => {
    await render(HostComponent, { componentProperties: { value: new Date(2026, 5, 15) } });
    expect(screen.getByText('15/06/2026')).toBeInTheDocument();
  });

  it('el trigger tiene aria-expanded=false cerrado y true abierto', async () => {
    await render(HostComponent);
    const trigger = screen.getByRole('button', { name: /DD\/MM\/AAAA/ });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    const user = userEvent.setup();
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('abre el calendario al hacer click en el trigger', async () => {
    await render(HostComponent);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /DD\/MM\/AAAA/ }));
    expect(screen.getByRole('dialog', { name: 'Calendario' })).toBeInTheDocument();
  });

  it('cierra el calendario con Escape y devuelve el foco al trigger', async () => {
    await render(HostComponent);
    const user = userEvent.setup();
    const trigger = screen.getByRole('button', { name: /DD\/MM\/AAAA/ });
    await user.click(trigger);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('selecciona un día y cierra el calendario', async () => {
    const { fixture } = await render(HostComponent, { componentProperties: { value: new Date(2026, 5, 1) } });
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /01\/06\/2026/ }));
    await user.click(screen.getByRole('button', { name: /^lunes, 15 de junio de 2026$/ }));
    expect(fixture.componentInstance.value?.getDate()).toBe(15);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renderiza el botón "Hoy" y selecciona la fecha de hoy', async () => {
    const { fixture } = await render(HostComponent);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /DD\/MM\/AAAA/ }));
    await user.click(screen.getByRole('button', { name: 'Hoy' }));
    expect(fixture.componentInstance.value).not.toBeNull();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renderiza un botón de limpiar cuando hay valor y lo vacía al hacer click', async () => {
    const { fixture } = await render(HostComponent, { componentProperties: { value: new Date(2026, 5, 1) } });
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Limpiar fecha' }));
    expect(fixture.componentInstance.value).toBeNull();
  });

  it('no renderiza el botón de limpiar cuando no hay valor', async () => {
    await render(HostComponent);
    expect(screen.queryByRole('button', { name: 'Limpiar fecha' })).not.toBeInTheDocument();
  });

  it('activa aria-invalid cuando error=true', async () => {
    await render(HostComponent, { componentProperties: { error: true } });
    expect(screen.getByRole('button', { name: /DD\/MM\/AAAA/ })).toHaveAttribute('aria-invalid', 'true');
  });

  it('renderiza errorMessage con role="alert"', async () => {
    await render(HostComponent, { componentProperties: { error: true, errorMessage: 'Fecha requerida' } });
    expect(screen.getByRole('alert')).toHaveTextContent('Fecha requerida');
  });

  it('renderiza helperText vinculado vía aria-describedby', async () => {
    await render(HostComponent, { componentProperties: { helperText: 'Formato día/mes/año' } });
    const trigger = screen.getByRole('button', { name: /DD\/MM\/AAAA/ });
    const helperId = trigger.getAttribute('aria-describedby');
    expect(document.getElementById(helperId!)).toHaveTextContent('Formato día/mes/año');
  });

  it('deshabilita "Mes anterior" al llegar al mes mínimo', async () => {
    await render(HostComponent, {
      componentProperties: { value: new Date(2026, 5, 15), min: new Date(2026, 5, 10) },
    });
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /15\/06\/2026/ }));
    expect(screen.getByRole('button', { name: 'Mes anterior' })).toBeDisabled();
  });

  it('deshabilita una fecha de disabledDates', async () => {
    await render(HostComponent, {
      componentProperties: { value: new Date(2026, 5, 15), disabledDates: [new Date(2026, 5, 10)] },
    });
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /15\/06\/2026/ }));
    expect(screen.getByRole('button', { name: /^miércoles, 10 de junio de 2026$/ })).toBeDisabled();
  });

  it('aplica la clase full-width al host', async () => {
    const { container } = await render(HostComponent, { componentProperties: { fullWidth: true } });
    expect(container.querySelector('bip-date-picker')).toHaveClass('bip-date-picker-wrapper--full-width');
  });

  // ── ControlValueAccessor ────────────────────────────────────────────────────

  it('writeValue() vía FormControl refleja el valor inicial', async () => {
    const host = new ReactiveFormHostComponent();
    host.control.setValue(new Date(2026, 0, 20));
    await render(ReactiveFormHostComponent, { componentProperties: { control: host.control } });
    expect(screen.getByText('20/01/2026')).toBeInTheDocument();
  });

  it('propaga los cambios al FormControl', async () => {
    const host = new ReactiveFormHostComponent();
    await render(ReactiveFormHostComponent, { componentProperties: { control: host.control } });
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Fecha de nacimiento' }));
    await user.click(screen.getByRole('button', { name: 'Hoy' }));
    expect(host.control.value).not.toBeNull();
  });

  it('setDisabledState() vía FormControl deshabilita el trigger', async () => {
    const host = new ReactiveFormHostComponent();
    host.control.disable();
    await render(ReactiveFormHostComponent, { componentProperties: { control: host.control } });
    expect(screen.getByRole('button', { name: 'Fecha de nacimiento' })).toBeDisabled();
  });
});
