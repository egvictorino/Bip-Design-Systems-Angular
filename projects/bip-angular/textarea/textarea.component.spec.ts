import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { BipTextarea } from './textarea.component';

@Component({
  imports: [BipTextarea],
  template: `
    <bip-textarea
      [variant]="variant"
      [size]="size"
      [label]="label"
      [helperText]="helperText"
      [error]="error"
      [errorMessage]="errorMessage"
      [fullWidth]="fullWidth"
      [required]="required"
      [maxLength]="maxLength"
      [autoGrow]="autoGrow"
      [(value)]="value"
    />
  `,
})
class HostComponent {
  variant: 'outlined' | 'filled' | 'bare' = 'outlined';
  size: 'sm' | 'md' | 'lg' = 'md';
  label = '';
  helperText = '';
  error = false;
  errorMessage = '';
  fullWidth = false;
  required = false;
  maxLength: number | undefined = undefined;
  autoGrow = false;
  value = '';
}

@Component({
  imports: [BipTextarea, ReactiveFormsModule],
  template: `<bip-textarea [formControl]="control" label="Comentario" />`,
})
class ReactiveFormHostComponent {
  readonly control = new FormControl('', { validators: Validators.required });
}

describe('BipTextarea', () => {
  it('renderiza un textarea', async () => {
    await render(HostComponent);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renderiza un label vinculado vía for/id', async () => {
    await render(HostComponent, { componentProperties: { label: 'Comentario' } });
    const textarea = screen.getByRole('textbox', { name: 'Comentario' });
    const label = screen.getByText('Comentario');
    expect(label.tagName).toBe('LABEL');
    expect(label).toHaveAttribute('for', textarea.id);
  });

  it('tiene aria-invalid cuando error=true', async () => {
    await render(HostComponent, { componentProperties: { error: true } });
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('renderiza errorMessage con role="alert"', async () => {
    await render(HostComponent, { componentProperties: { error: true, errorMessage: 'Requerido' } });
    expect(screen.getByRole('alert')).toHaveTextContent('Requerido');
  });

  it('renderiza helperText', async () => {
    await render(HostComponent, { componentProperties: { helperText: 'Ayuda' } });
    expect(screen.getByText('Ayuda')).toBeInTheDocument();
  });

  it.each(['sm', 'md', 'lg'] as const)('tamaño %s aplica la clase correcta', async (size) => {
    await render(HostComponent, { componentProperties: { size } });
    expect(screen.getByRole('textbox')).toHaveClass(`bip-textarea--${size}`);
  });

  it.each(['outlined', 'filled', 'bare'] as const)('aplica la clase de la variante %s', async (variant) => {
    await render(HostComponent, { componentProperties: { variant } });
    expect(screen.getByRole('textbox')).toHaveClass(`bip-textarea--${variant}`);
  });

  it('muestra el asterisco cuando required=true', async () => {
    await render(HostComponent, { componentProperties: { label: 'Campo', required: true } });
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('actualiza el signal value con [(value)] al escribir', async () => {
    const { fixture } = await render(HostComponent);
    const user = userEvent.setup();
    await user.type(screen.getByRole('textbox'), 'hola');
    expect(fixture.componentInstance.value).toBe('hola');
  });

  it('muestra el contador de caracteres cuando maxLength está definido', async () => {
    await render(HostComponent, { componentProperties: { maxLength: 10, value: 'abc' } });
    expect(screen.getByText('3 / 10')).toBeInTheDocument();
  });

  it('no muestra el contador cuando maxLength es undefined', async () => {
    await render(HostComponent);
    expect(screen.queryByText(/\/ /)).not.toBeInTheDocument();
  });

  it('marca el límite alcanzado con la clase de contador límite', async () => {
    await render(HostComponent, { componentProperties: { maxLength: 3, value: 'abc' } });
    expect(screen.getByText('3 / 3')).toHaveClass('bip-textarea-counter--limit');
  });

  // ── ControlValueAccessor ────────────────────────────────────────────────────

  it('con un FormControl inválido, aria-invalid se activa recién tras el blur', async () => {
    await render(ReactiveFormHostComponent);
    const textarea = screen.getByRole('textbox', { name: 'Comentario' });
    expect(textarea).not.toHaveAttribute('aria-invalid');

    textarea.dispatchEvent(new Event('blur', { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
  });

  it('writeValue() vía FormControl refleja el valor inicial', async () => {
    const host = new ReactiveFormHostComponent();
    host.control.setValue('inicial');
    await render(ReactiveFormHostComponent, { componentProperties: { control: host.control } });
    expect(screen.getByRole('textbox')).toHaveValue('inicial');
  });

  it('setDisabledState() vía FormControl deshabilita el textarea', async () => {
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
