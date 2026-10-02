import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { BipToggle } from './toggle.component';

@Component({
  imports: [BipToggle],
  template: `
    <bip-toggle
      [label]="label"
      [helperText]="helperText"
      [error]="error"
      [errorMessage]="errorMessage"
      [required]="required"
      [size]="size"
      [(value)]="checked"
    />
  `,
})
class HostComponent {
  label = 'Notificaciones';
  helperText = '';
  error = false;
  errorMessage = '';
  required = false;
  size: 'sm' | 'md' | 'lg' = 'md';
  checked = false;
}

@Component({
  imports: [BipToggle, ReactiveFormsModule],
  template: `<bip-toggle [formControl]="control" label="Activar" />`,
})
class ReactiveFormHostComponent {
  readonly control = new FormControl(false);
}

describe('BipToggle', () => {
  it('renderiza un switch con label vinculado', async () => {
    await render(HostComponent);
    expect(screen.getByRole('switch', { name: 'Notificaciones' })).toBeInTheDocument();
  });

  it('inicia sin marcar', async () => {
    await render(HostComponent);
    expect(screen.getByRole('switch')).not.toBeChecked();
  });

  it('actualiza value con [(value)] al hacer click', async () => {
    const { fixture } = await render(HostComponent);
    const user = userEvent.setup();
    await user.click(screen.getByRole('switch'));
    expect(fixture.componentInstance.checked).toBe(true);
    expect(screen.getByRole('switch')).toBeChecked();
  });

  it('se puede activar con teclado (Espacio)', async () => {
    await render(HostComponent);
    const user = userEvent.setup();
    const toggle = screen.getByRole('switch');
    toggle.focus();
    await user.keyboard(' ');
    expect(toggle).toBeChecked();
  });

  it('tiene aria-invalid cuando error=true', async () => {
    await render(HostComponent, { componentProperties: { error: true } });
    expect(screen.getByRole('switch')).toHaveAttribute('aria-invalid', 'true');
  });

  it('renderiza errorMessage con role="alert"', async () => {
    await render(HostComponent, { componentProperties: { error: true, errorMessage: 'Requerido' } });
    expect(screen.getByRole('alert')).toHaveTextContent('Requerido');
  });

  it('muestra el asterisco cuando required=true', async () => {
    await render(HostComponent, { componentProperties: { required: true } });
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it.each(['sm', 'md', 'lg'] as const)('tamaño %s aplica la clase correcta', async (size) => {
    await render(HostComponent, { componentProperties: { size } });
    const track = screen.getByRole('switch').parentElement!;
    expect(track).toHaveClass(`bip-toggle-track--${size}`);
  });

  // ── ControlValueAccessor ────────────────────────────────────────────────────

  it('writeValue() vía FormControl refleja el valor inicial', async () => {
    const host = new ReactiveFormHostComponent();
    host.control.setValue(true);
    await render(ReactiveFormHostComponent, { componentProperties: { control: host.control } });
    expect(screen.getByRole('switch')).toBeChecked();
  });

  it('propaga los cambios al FormControl', async () => {
    const host = new ReactiveFormHostComponent();
    await render(ReactiveFormHostComponent, { componentProperties: { control: host.control } });
    const user = userEvent.setup();
    await user.click(screen.getByRole('switch'));
    expect(host.control.value).toBe(true);
  });

  it('setDisabledState() vía FormControl deshabilita el toggle', async () => {
    const host = new ReactiveFormHostComponent();
    host.control.disable();
    await render(ReactiveFormHostComponent, { componentProperties: { control: host.control } });
    expect(screen.getByRole('switch')).toBeDisabled();
  });
});
