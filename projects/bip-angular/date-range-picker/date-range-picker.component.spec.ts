import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { BipDateRangePicker } from './date-range-picker.component';
import type { BipDateRange } from './date-range-picker.component';

@Component({
  imports: [BipDateRangePicker],
  template: `
    <bip-date-range-picker
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
  value: BipDateRange = { from: null, to: null };
}

@Component({
  imports: [BipDateRangePicker, ReactiveFormsModule],
  template: `<bip-date-range-picker [formControl]="control" label="Rango de estadía" />`,
})
class ReactiveFormHostComponent {
  readonly control = new FormControl<BipDateRange>({ from: null, to: null });
}

describe('BipDateRangePicker', () => {
  it('muestra el placeholder por defecto cuando no hay rango', async () => {
    await render(HostComponent);
    expect(screen.getByText('DD/MM/AAAA – DD/MM/AAAA')).toBeInTheDocument();
  });

  it('muestra solo "from" con puntos suspensivos cuando falta "to"', async () => {
    await render(HostComponent, { componentProperties: { value: { from: new Date(2026, 5, 10), to: null } } });
    expect(screen.getByText('10/06/2026 – ...')).toBeInTheDocument();
  });

  it('muestra el rango completo cuando ambas fechas están definidas', async () => {
    await render(HostComponent, {
      componentProperties: { value: { from: new Date(2026, 5, 10), to: new Date(2026, 5, 15) } },
    });
    expect(screen.getByText('10/06/2026 – 15/06/2026')).toBeInTheDocument();
  });

  it('abre el calendario al hacer click en el trigger', async () => {
    await render(HostComponent);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /DD\/MM\/AAAA/ }));
    expect(screen.getByRole('dialog', { name: 'Seleccionar rango de fechas' })).toBeInTheDocument();
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

  it('fija "from" en el primer click sin valor previo', async () => {
    const { fixture } = await render(HostComponent);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /DD\/MM\/AAAA/ }));
    const dialog = screen.getByRole('dialog');
    const day = dialog.querySelector<HTMLButtonElement>('[data-date]:not(:disabled)')!;
    await user.click(day);
    expect(fixture.componentInstance.value.from).not.toBeNull();
    expect(fixture.componentInstance.value.to).toBeNull();
  });

  it('completa el rango en el segundo click (from < to) y cierra el calendario', async () => {
    const { fixture } = await render(HostComponent, {
      componentProperties: { value: { from: new Date(2026, 5, 10), to: null } },
    });
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /10\/06\/2026/ }));
    await user.click(screen.getByRole('button', { name: /^lunes, 15 de junio de 2026$/ }));
    expect(fixture.componentInstance.value.from?.getDate()).toBe(10);
    expect(fixture.componentInstance.value.to?.getDate()).toBe(15);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('intercambia from/to cuando el segundo click es anterior a from', async () => {
    const { fixture } = await render(HostComponent, {
      componentProperties: { value: { from: new Date(2026, 5, 15), to: null } },
    });
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /15\/06\/2026/ }));
    await user.click(screen.getByRole('button', { name: /^miércoles, 10 de junio de 2026$/ }));
    expect(fixture.componentInstance.value.from?.getDate()).toBe(10);
    expect(fixture.componentInstance.value.to?.getDate()).toBe(15);
  });

  it('limpia el rango al hacer click de nuevo en el mismo día que from', async () => {
    const { fixture } = await render(HostComponent, {
      componentProperties: { value: { from: new Date(2026, 5, 15), to: null } },
    });
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /15\/06\/2026/ }));
    await user.click(screen.getByRole('button', { name: /^lunes, 15 de junio de 2026$/ }));
    expect(fixture.componentInstance.value.from).toBeNull();
    expect(fixture.componentInstance.value.to).toBeNull();
  });

  it('empieza un nuevo rango cuando ya había uno completo', async () => {
    const { fixture } = await render(HostComponent, {
      componentProperties: { value: { from: new Date(2026, 5, 10), to: new Date(2026, 5, 15) } },
    });
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /10\/06\/2026/ }));
    await user.click(screen.getByRole('button', { name: /^lunes, 1 de junio de 2026$/ }));
    expect(fixture.componentInstance.value.from?.getDate()).toBe(1);
    expect(fixture.componentInstance.value.to).toBeNull();
  });

  it('muestra el botón de limpiar cuando from está definido y lo vacía al hacer click', async () => {
    const { fixture } = await render(HostComponent, {
      componentProperties: { value: { from: new Date(2026, 5, 10), to: null } },
    });
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Limpiar selección' }));
    expect(fixture.componentInstance.value).toEqual({ from: null, to: null });
  });

  it('no muestra el botón de limpiar cuando no hay selección', async () => {
    await render(HostComponent);
    expect(screen.queryByRole('button', { name: 'Limpiar selección' })).not.toBeInTheDocument();
  });

  it('activa aria-invalid cuando error=true', async () => {
    await render(HostComponent, { componentProperties: { error: true } });
    expect(screen.getByRole('button', { name: /DD\/MM\/AAAA/ })).toHaveAttribute('aria-invalid', 'true');
  });

  it('renderiza errorMessage con role="alert"', async () => {
    await render(HostComponent, { componentProperties: { error: true, errorMessage: 'Rango requerido' } });
    expect(screen.getByRole('alert')).toHaveTextContent('Rango requerido');
  });

  it('deshabilita "Mes anterior" al llegar al mes mínimo', async () => {
    await render(HostComponent, {
      componentProperties: { value: { from: new Date(2026, 5, 15), to: null }, min: new Date(2026, 5, 10) },
    });
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /15\/06\/2026/ }));
    expect(screen.getByRole('button', { name: 'Mes anterior' })).toBeDisabled();
  });

  it('deshabilita una fecha de disabledDates', async () => {
    await render(HostComponent, {
      componentProperties: {
        value: { from: new Date(2026, 5, 15), to: null },
        disabledDates: [new Date(2026, 5, 10)],
      },
    });
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /15\/06\/2026/ }));
    expect(screen.getByRole('button', { name: /^miércoles, 10 de junio de 2026$/ })).toBeDisabled();
  });

  it('ArrowRight mueve el foco al día siguiente dentro de la grilla', async () => {
    await render(HostComponent, { componentProperties: { value: { from: new Date(2026, 5, 1), to: null } } });
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /01\/06\/2026/ }));
    screen.getByRole('button', { name: /^lunes, 1 de junio de 2026$/ }).focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: /^martes, 2 de junio de 2026$/ })).toHaveFocus();
  });

  it('aplica la clase full-width al host', async () => {
    const { container } = await render(HostComponent, { componentProperties: { fullWidth: true } });
    expect(container.querySelector('bip-date-range-picker')).toHaveClass(
      'bip-date-range-picker-wrapper--full-width'
    );
  });

  // ── ControlValueAccessor ────────────────────────────────────────────────────

  it('writeValue() vía FormControl refleja el valor inicial', async () => {
    const host = new ReactiveFormHostComponent();
    host.control.setValue({ from: new Date(2026, 0, 10), to: new Date(2026, 0, 20) });
    await render(ReactiveFormHostComponent, { componentProperties: { control: host.control } });
    expect(screen.getByText('10/01/2026 – 20/01/2026')).toBeInTheDocument();
  });

  it('propaga los cambios al FormControl', async () => {
    const host = new ReactiveFormHostComponent();
    await render(ReactiveFormHostComponent, { componentProperties: { control: host.control } });
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Rango de estadía' }));
    const dialog = screen.getByRole('dialog');
    const firstDay = dialog.querySelector<HTMLButtonElement>('[data-date]:not(:disabled)');
    await user.click(firstDay!);
    expect(host.control.value?.from).not.toBeNull();
  });

  it('setDisabledState() vía FormControl deshabilita el trigger', async () => {
    const host = new ReactiveFormHostComponent();
    host.control.disable();
    await render(ReactiveFormHostComponent, { componentProperties: { control: host.control } });
    expect(screen.getByRole('button', { name: 'Rango de estadía' })).toBeDisabled();
  });
});
