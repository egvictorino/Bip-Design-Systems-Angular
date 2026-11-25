import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { BipInput } from './input.component';

@Component({
  imports: [BipInput],
  template: `
    <bip-input
      [variant]="variant"
      [size]="size"
      [type]="type"
      [label]="label"
      [helperText]="helperText"
      [error]="error"
      [errorMessage]="errorMessage"
      [fullWidth]="fullWidth"
      [required]="required"
      [clearable]="clearable"
      [(value)]="value"
    />
  `,
})
class HostComponent {
  variant: 'outlined' | 'filled' | 'bare' = 'outlined';
  size: 'sm' | 'md' | 'lg' = 'md';
  type: 'text' | 'email' | 'password' | 'tel' | 'url' = 'text';
  label = '';
  helperText = '';
  error = false;
  errorMessage = '';
  fullWidth = false;
  required = false;
  clearable = false;
  value = '';
}

@Component({
  imports: [BipInput, ReactiveFormsModule],
  template: `<bip-input [formControl]="control" label="Campo" />`,
})
class ReactiveFormHostComponent {
  readonly control = new FormControl('', { validators: Validators.required });
}

describe('BipInput', () => {
  it('renderiza un input de texto', async () => {
    await render(HostComponent);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('siempre tiene un id (para aria-describedby)', async () => {
    await render(HostComponent);
    expect(screen.getByRole('textbox').id).toBeTruthy();
  });

  it('renderiza un label vinculado al input vía for/id', async () => {
    await render(HostComponent, { componentProperties: { label: 'Nombre' } });
    const input = screen.getByRole('textbox', { name: 'Nombre' });
    const label = screen.getByText('Nombre');
    expect(label.tagName).toBe('LABEL');
    expect(label).toHaveAttribute('for', input.id);
  });

  it('renderiza como input de password cuando type="password"', async () => {
    const { container } = await render(HostComponent, {
      componentProperties: { type: 'password' },
    });
    expect(container.querySelector('input[type="password"]')).toBeInTheDocument();
  });

  it('tiene aria-invalid cuando error=true', async () => {
    await render(HostComponent, { componentProperties: { label: 'Campo', error: true } });
    expect(screen.getByRole('textbox', { name: 'Campo' })).toHaveAttribute('aria-invalid', 'true');
  });

  it('no tiene aria-invalid cuando error=false', async () => {
    await render(HostComponent, { componentProperties: { label: 'Campo' } });
    expect(screen.getByRole('textbox', { name: 'Campo' })).not.toHaveAttribute('aria-invalid');
  });

  it('renderiza errorMessage con role="alert" cuando error=true', async () => {
    await render(HostComponent, {
      componentProperties: { error: true, errorMessage: 'Campo requerido' },
    });
    expect(screen.getByRole('alert')).toHaveTextContent('Campo requerido');
  });

  it('el input está vinculado al error vía aria-describedby', async () => {
    await render(HostComponent, {
      componentProperties: { label: 'Campo', error: true, errorMessage: 'Error' },
    });
    const input = screen.getByRole('textbox', { name: 'Campo' });
    const alert = screen.getByRole('alert');
    expect(input).toHaveAttribute('aria-describedby', alert.id);
  });

  it('renderiza helperText', async () => {
    await render(HostComponent, { componentProperties: { helperText: 'Texto de ayuda' } });
    expect(screen.getByText('Texto de ayuda')).toBeInTheDocument();
  });

  it.each(['sm', 'md', 'lg'] as const)('tamaño %s aplica la clase correcta', async (size) => {
    await render(HostComponent, { componentProperties: { size } });
    expect(screen.getByRole('textbox')).toHaveClass(`bip-input--${size}`);
  });

  it('variante por defecto es outlined', async () => {
    await render(HostComponent);
    expect(screen.getByRole('textbox')).toHaveClass('bip-input--outlined');
  });

  it.each(['filled', 'bare'] as const)('aplica la clase de la variante %s', async (variant) => {
    await render(HostComponent, { componentProperties: { variant } });
    expect(screen.getByRole('textbox')).toHaveClass(`bip-input--${variant}`);
  });

  it('muestra el asterisco cuando required=true', async () => {
    await render(HostComponent, { componentProperties: { label: 'Campo', required: true } });
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('no muestra el asterisco cuando required=false', async () => {
    await render(HostComponent, { componentProperties: { label: 'Campo' } });
    expect(screen.queryByText('*')).not.toBeInTheDocument();
  });

  it('actualiza el signal value con [(value)] al escribir', async () => {
    const { fixture } = await render(HostComponent);
    const user = userEvent.setup();
    await user.type(screen.getByRole('textbox'), 'hola');
    expect(fixture.componentInstance.value).toBe('hola');
  });

  it('muestra el botón de limpiar cuando clearable=true y hay valor', async () => {
    await render(HostComponent, { componentProperties: { clearable: true, value: 'algo' } });
    expect(screen.getByRole('button', { name: 'Limpiar campo' })).toBeInTheDocument();
  });

  it('no muestra el botón de limpiar cuando el valor está vacío', async () => {
    await render(HostComponent, { componentProperties: { clearable: true, value: '' } });
    expect(screen.queryByRole('button', { name: 'Limpiar campo' })).not.toBeInTheDocument();
  });

  it('el botón de limpiar vacía el valor', async () => {
    const { fixture } = await render(HostComponent, {
      componentProperties: { clearable: true, value: 'algo' },
    });
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Limpiar campo' }));
    expect(fixture.componentInstance.value).toBe('');
  });

  it('renderiza el botón de mostrar/ocultar contraseña cuando type="password"', async () => {
    await render(HostComponent, { componentProperties: { type: 'password' } });
    expect(screen.getByRole('button', { name: 'Mostrar contraseña' })).toBeInTheDocument();
  });

  it('alterna la visibilidad de la contraseña al hacer click', async () => {
    const { container } = await render(HostComponent, {
      componentProperties: { type: 'password' },
    });
    const user = userEvent.setup();
    const input = container.querySelector('input')!;
    expect(input).toHaveAttribute('type', 'password');

    await user.click(screen.getByRole('button', { name: 'Mostrar contraseña' }));
    expect(input).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: 'Ocultar contraseña' })).toBeInTheDocument();
  });

  // ── ControlValueAccessor ────────────────────────────────────────────────────

  it('con un FormControl inválido, aria-invalid se activa recién tras el blur', async () => {
    await render(ReactiveFormHostComponent);
    const input = screen.getByRole('textbox', { name: 'Campo' });
    expect(input).not.toHaveAttribute('aria-invalid');

    input.dispatchEvent(new Event('blur', { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('writeValue() vía FormControl refleja el valor inicial', async () => {
    const host = new ReactiveFormHostComponent();
    host.control.setValue('inicial');
    await render(ReactiveFormHostComponent, { componentProperties: { control: host.control } });
    expect(screen.getByRole('textbox')).toHaveValue('inicial');
  });

  it('setDisabledState() vía FormControl deshabilita el input', async () => {
    const host = new ReactiveFormHostComponent();
    host.control.disable();
    await render(ReactiveFormHostComponent, { componentProperties: { control: host.control } });
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('propaga los cambios al FormControl', async () => {
    const host = new ReactiveFormHostComponent();
    await render(ReactiveFormHostComponent, { componentProperties: { control: host.control } });
    const user = userEvent.setup();
    await user.type(screen.getByRole('textbox'), 'hola');
    expect(host.control.value).toBe('hola');
  });
});
