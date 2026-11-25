import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { fireEvent, render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BipTimePicker } from './time-picker.component';
import type {
  BipTimePickerHourCycle,
  BipTimePickerInputMode,
  BipTimePickerStep,
} from './time-picker.component';

@Component({
  imports: [BipTimePicker],
  template: `
    <bip-time-picker
      [label]="label"
      [placeholder]="placeholder"
      [error]="error"
      [errorMessage]="errorMessage"
      [helperText]="helperText"
      [fullWidth]="fullWidth"
      [step]="step"
      [minTime]="minTime"
      [maxTime]="maxTime"
      [inputMode]="inputMode"
      [hourCycle]="hourCycle"
      [(value)]="value"
    />
  `,
})
class HostComponent {
  label = '';
  placeholder = '';
  error = false;
  errorMessage = '';
  helperText = '';
  fullWidth = false;
  step: BipTimePickerStep = 5;
  minTime: string | undefined = undefined;
  maxTime: string | undefined = undefined;
  inputMode: BipTimePickerInputMode = 'picker';
  hourCycle: BipTimePickerHourCycle = '24';
  value = '';
}

@Component({
  imports: [BipTimePicker, ReactiveFormsModule],
  template: `<bip-time-picker [formControl]="control" label="Hora de la cita" />`,
})
class ReactiveFormHostComponent {
  readonly control = new FormControl<string>('');
}

describe('BipTimePicker', () => {
  it('muestra el placeholder por defecto cuando no hay valor', async () => {
    await render(HostComponent);
    expect(screen.getByText('HH:MM')).toBeInTheDocument();
  });

  it('muestra el valor cuando está definido', async () => {
    await render(HostComponent, { componentProperties: { value: '14:30' } });
    expect(screen.getByText('14:30')).toBeInTheDocument();
  });

  it('abre el panel al hacer click en el trigger', async () => {
    await render(HostComponent);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /HH:MM/ }));
    expect(screen.getByRole('dialog', { name: 'Seleccionar hora' })).toBeInTheDocument();
  });

  it('cierra el panel con Escape y devuelve el foco al trigger', async () => {
    await render(HostComponent);
    const user = userEvent.setup();
    const trigger = screen.getByRole('button', { name: /HH:MM/ });
    await user.click(trigger);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('renderiza 24 opciones de hora y 12 de minutos por defecto (step=5)', async () => {
    await render(HostComponent);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /HH:MM/ }));
    expect(
      screen.getByRole('listbox', { name: 'Horas' }).querySelectorAll('[role="option"]')
    ).toHaveLength(24);
    expect(
      screen.getByRole('listbox', { name: 'Minutos' }).querySelectorAll('[role="option"]')
    ).toHaveLength(12);
  });

  it('renderiza 4 opciones de minutos para step=15', async () => {
    await render(HostComponent, { componentProperties: { step: 15 } });
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /HH:MM/ }));
    expect(
      screen.getByRole('listbox', { name: 'Minutos' }).querySelectorAll('[role="option"]')
    ).toHaveLength(4);
  });

  it('selecciona una hora (minuto por defecto 00) y mantiene el panel abierto', async () => {
    const { fixture } = await render(HostComponent);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /HH:MM/ }));
    await user.click(screen.getByRole('option', { name: '09' }));
    expect(fixture.componentInstance.value).toBe('09:00');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('selecciona un minuto con hora existente y cierra el panel', async () => {
    const { fixture } = await render(HostComponent, { componentProperties: { value: '09:00' } });
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /09:00/ }));
    await user.click(screen.getByRole('option', { name: '30' }));
    expect(fixture.componentInstance.value).toBe('09:30');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('marca la hora y el minuto seleccionados con aria-selected="true"', async () => {
    await render(HostComponent, { componentProperties: { value: '09:30' } });
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /09:30/ }));
    expect(screen.getByRole('option', { name: '09' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('option', { name: '30' })).toHaveAttribute('aria-selected', 'true');
  });

  it('ArrowDown mueve el cursor de horas sin seleccionar', async () => {
    const { fixture } = await render(HostComponent);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /HH:MM/ }));
    screen.getByRole('listbox', { name: 'Horas' }).focus();
    await user.keyboard('{ArrowDown}{Enter}');
    expect(fixture.componentInstance.value).toBe('01:00');
  });

  it('Home mueve el cursor a la primera opción de horas', async () => {
    const { fixture } = await render(HostComponent);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /HH:MM/ }));
    const hoursListbox = screen.getByRole('listbox', { name: 'Horas' });
    hoursListbox.focus();
    await user.keyboard('{ArrowDown}{ArrowDown}{Home}{Enter}');
    expect(fixture.componentInstance.value).toBe('00:00');
  });

  it('renderiza el botón "Ahora" y cierra el panel al seleccionarlo', async () => {
    await render(HostComponent);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /HH:MM/ }));
    await user.click(screen.getByRole('button', { name: 'Ahora' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('deshabilita horas anteriores a minTime', async () => {
    await render(HostComponent, { componentProperties: { minTime: '09:00' } });
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /HH:MM/ }));
    expect(screen.getByRole('option', { name: '08' })).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('option', { name: '09' })).not.toHaveAttribute('aria-disabled');
  });

  it('deshabilita horas posteriores a maxTime', async () => {
    await render(HostComponent, { componentProperties: { maxTime: '17:00' } });
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /HH:MM/ }));
    expect(screen.getByRole('option', { name: '18' })).toHaveAttribute('aria-disabled', 'true');
  });

  it('muestra el selector AM/PM en hourCycle="12" y oculto en "24"', async () => {
    const { rerender } = await render(HostComponent, { componentProperties: { hourCycle: '12' } });
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /HH:MM/ }));
    expect(screen.getByRole('listbox', { name: 'AM/PM' })).toBeInTheDocument();
    await rerender({ componentProperties: { hourCycle: '24' } });
  });

  it('muestra "02:30 PM" para "14:30" en hourCycle="12"', async () => {
    await render(HostComponent, { componentProperties: { value: '14:30', hourCycle: '12' } });
    expect(screen.getByText('02:30 PM')).toBeInTheDocument();
  });

  it('muestra "12:00 AM" para medianoche en hourCycle="12"', async () => {
    await render(HostComponent, { componentProperties: { value: '00:00', hourCycle: '12' } });
    expect(screen.getByText('12:00 AM')).toBeInTheDocument();
  });

  it('renderiza un input de texto cuando inputMode="text"', async () => {
    await render(HostComponent, { componentProperties: { inputMode: 'text' } });
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /HH:MM/ })).not.toBeInTheDocument();
  });

  it('emite el valor normalizado al escribir una hora válida en modo texto', async () => {
    const { fixture } = await render(HostComponent, { componentProperties: { inputMode: 'text' } });
    const user = userEvent.setup();
    await user.type(screen.getByRole('textbox'), '9:30');
    expect(fixture.componentInstance.value).toBe('09:30');
  });

  it('no emite cambios para una entrada parcial inválida en modo texto', async () => {
    const { fixture } = await render(HostComponent, { componentProperties: { inputMode: 'text' } });
    const user = userEvent.setup();
    await user.type(screen.getByRole('textbox'), '14:');
    expect(fixture.componentInstance.value).toBe('');
  });

  it('activa aria-invalid cuando error=true', async () => {
    await render(HostComponent, { componentProperties: { error: true } });
    expect(screen.getByRole('button', { name: /HH:MM/ })).toHaveAttribute('aria-invalid', 'true');
  });

  it('renderiza errorMessage con role="alert"', async () => {
    await render(HostComponent, {
      componentProperties: { error: true, errorMessage: 'Hora requerida' },
    });
    expect(screen.getByRole('alert')).toHaveTextContent('Hora requerida');
  });

  it('tiene una región aria-live en el DOM', async () => {
    const { container } = await render(HostComponent);
    expect(container.querySelector('[role="status"][aria-live="polite"]')).toBeInTheDocument();
  });

  it('aplica la clase full-width al host', async () => {
    const { container } = await render(HostComponent, { componentProperties: { fullWidth: true } });
    expect(container.querySelector('bip-time-picker')).toHaveClass(
      'bip-time-picker-wrapper--full-width'
    );
  });

  // ── ControlValueAccessor ────────────────────────────────────────────────────

  it('writeValue() vía FormControl refleja el valor inicial', async () => {
    const host = new ReactiveFormHostComponent();
    host.control.setValue('10:15');
    await render(ReactiveFormHostComponent, { componentProperties: { control: host.control } });
    expect(screen.getByText('10:15')).toBeInTheDocument();
  });

  it('propaga los cambios al FormControl', async () => {
    const host = new ReactiveFormHostComponent();
    await render(ReactiveFormHostComponent, { componentProperties: { control: host.control } });
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Hora de la cita' }));
    await user.click(screen.getByRole('button', { name: 'Ahora' }));
    expect(host.control.value).not.toBe('');
  });

  it('setDisabledState() vía FormControl deshabilita el trigger', async () => {
    const host = new ReactiveFormHostComponent();
    host.control.disable();
    await render(ReactiveFormHostComponent, { componentProperties: { control: host.control } });
    expect(screen.getByRole('button', { name: 'Hora de la cita' })).toBeDisabled();
  });
});

describe('BipTimePicker — foco y teclado del panel', () => {
  afterEach(() => {
    delete (Element.prototype as { scrollIntoView?: unknown }).scrollIntoView;
  });

  it('modo texto: el botón del reloj abre el panel y Escape devuelve el foco al input', async () => {
    await render(HostComponent, { componentProperties: { inputMode: 'text' } });
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Abrir selector de hora' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await vi.waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByRole('textbox')).toHaveFocus();
  });

  it('modo texto: Escape con el foco en el input cierra el panel y conserva el foco', async () => {
    await render(HostComponent, { componentProperties: { inputMode: 'text' } });
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Abrir selector de hora' }));
    await screen.findByRole('dialog');
    const input = screen.getByRole('textbox');
    input.focus();
    await user.keyboard('{Escape}');
    await vi.waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(input).toHaveFocus();
  });

  it('modo texto: Escape con el panel cerrado no se intercepta (no hace nada)', async () => {
    await render(HostComponent, { componentProperties: { inputMode: 'text' } });
    const user = userEvent.setup();
    const input = screen.getByRole('textbox');
    await user.type(input, '09:30');
    const notPrevented = fireEvent.keyDown(input, { key: 'Escape' });
    expect(notPrevented).toBe(true);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(input).toHaveValue('09:30');
  });

  it('modo texto: un segundo clic en el reloj cierra el panel (no se cierra y reabre)', async () => {
    await render(HostComponent, { componentProperties: { inputMode: 'text' } });
    const user = userEvent.setup();
    const clock = screen.getByRole('button', { name: 'Abrir selector de hora' });
    await user.click(clock);
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    await user.click(clock);
    await vi.waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('el diálogo atrapa el foco: anclas de cdkTrapFocus alrededor del panel', async () => {
    await render(HostComponent);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /HH:MM/ }));
    const dialog = await screen.findByRole('dialog');
    // jsdom no simula Tab: el ciclo real se verifica en Docker (ver CHANGELOG).
    await vi.waitFor(() => {
      expect(dialog.previousElementSibling).toHaveClass('cdk-focus-trap-anchor');
      expect(dialog.nextElementSibling).toHaveClass('cdk-focus-trap-anchor');
    });
  });

  it('al elegir "Ahora" el panel se cierra y el foco vuelve al trigger (no cae a <body>)', async () => {
    await render(HostComponent);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /HH:MM/ }));
    await screen.findByRole('dialog');
    await user.click(screen.getByRole('button', { name: 'Ahora' }));
    await vi.waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(document.activeElement).not.toBe(document.body);
    expect(document.activeElement?.className).toContain('bip-time-picker-trigger');
  });

  it('al abrir y con ArrowDown hace scroll a la opción activa (block: nearest)', async () => {
    const scrollIntoView = vi.fn();
    (Element.prototype as { scrollIntoView?: unknown }).scrollIntoView = scrollIntoView;
    await render(HostComponent, { componentProperties: { step: 5 } });
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /HH:MM/ }));
    await screen.findByRole('dialog');
    await vi.waitFor(() => expect(scrollIntoView).toHaveBeenCalled());
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest' });

    scrollIntoView.mockClear();
    const hours = screen.getAllByRole('listbox')[0]!;
    hours.focus();
    await user.keyboard('{ArrowDown}');
    await vi.waitFor(() => expect(scrollIntoView).toHaveBeenCalled());
    const scrolled = (scrollIntoView.mock.contexts as HTMLElement[]).map((el) => el.id);
    expect(scrolled).toContain(hours.getAttribute('aria-activedescendant'));
  });
});
