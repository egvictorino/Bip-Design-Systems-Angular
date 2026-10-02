import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { BipSelect } from './select.component';
import type { BipSelectOption, BipSelectOptionGroup } from './select.component';

const OPTIONS: BipSelectOption[] = [
  { value: 'mx', label: 'México' },
  { value: 'us', label: 'Estados Unidos' },
  { value: 'ca', label: 'Canadá', disabled: true },
];

const GROUPS: BipSelectOptionGroup[] = [
  { label: 'América', options: [{ value: 'mx', label: 'México' }] },
  { label: 'Europa', options: [{ value: 'es', label: 'España' }] },
];

@Component({
  imports: [BipSelect],
  template: `
    <bip-select
      [variant]="variant"
      [size]="size"
      [label]="label"
      [helperText]="helperText"
      [error]="error"
      [errorMessage]="errorMessage"
      [placeholder]="placeholder"
      [options]="options"
      [groups]="groups"
      [required]="required"
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
  placeholder = '';
  options: BipSelectOption[] = OPTIONS;
  groups: BipSelectOptionGroup[] = [];
  required = false;
  value = '';
}

@Component({
  imports: [BipSelect, ReactiveFormsModule],
  template: `<bip-select [formControl]="control" label="País" [options]="options" />`,
})
class ReactiveFormHostComponent {
  readonly control = new FormControl('', { validators: Validators.required });
  readonly options = OPTIONS;
}

describe('BipSelect', () => {
  it('renderiza un select con sus opciones', async () => {
    await render(HostComponent);
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'México' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Estados Unidos' })).toBeInTheDocument();
  });

  it('renderiza un label vinculado vía for/id', async () => {
    await render(HostComponent, { componentProperties: { label: 'País' } });
    const select = screen.getByRole('combobox', { name: 'País' });
    const label = screen.getByText('País');
    expect(label.tagName).toBe('LABEL');
    expect(label).toHaveAttribute('for', select.id);
  });

  it('renderiza un placeholder deshabilitado cuando se provee', async () => {
    await render(HostComponent, { componentProperties: { placeholder: 'Selecciona un país' } });
    const placeholderOption = screen.getByRole('option', { name: 'Selecciona un país' });
    expect(placeholderOption).toBeDisabled();
  });

  it('renderiza opciones agrupadas con optgroup', async () => {
    const { container } = await render(HostComponent, {
      componentProperties: { options: [], groups: GROUPS },
    });
    const optgroups = container.querySelectorAll('optgroup');
    expect(optgroups).toHaveLength(2);
    expect(optgroups[0]).toHaveAttribute('label', 'América');
  });

  it('respeta option.disabled', async () => {
    await render(HostComponent);
    expect(screen.getByRole('option', { name: 'Canadá' })).toBeDisabled();
  });

  it('tiene aria-invalid cuando error=true', async () => {
    await render(HostComponent, { componentProperties: { error: true } });
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('renderiza errorMessage con role="alert"', async () => {
    await render(HostComponent, { componentProperties: { error: true, errorMessage: 'Requerido' } });
    expect(screen.getByRole('alert')).toHaveTextContent('Requerido');
  });

  it.each(['sm', 'md', 'lg'] as const)('tamaño %s aplica la clase correcta', async (size) => {
    await render(HostComponent, { componentProperties: { size } });
    expect(screen.getByRole('combobox')).toHaveClass(`bip-select--${size}`);
  });

  it.each(['outlined', 'filled', 'bare'] as const)('aplica la clase de la variante %s', async (variant) => {
    await render(HostComponent, { componentProperties: { variant } });
    expect(screen.getByRole('combobox')).toHaveClass(`bip-select--${variant}`);
  });

  it('actualiza value con [(value)] al seleccionar una opción', async () => {
    const { fixture } = await render(HostComponent);
    const user = userEvent.setup();
    await user.selectOptions(screen.getByRole('combobox'), 'us');
    expect(fixture.componentInstance.value).toBe('us');
  });

  // ── ControlValueAccessor ────────────────────────────────────────────────────

  it('con un FormControl inválido, aria-invalid se activa recién tras el blur', async () => {
    await render(ReactiveFormHostComponent);
    const select = screen.getByRole('combobox', { name: 'País' });
    expect(select).not.toHaveAttribute('aria-invalid');

    select.dispatchEvent(new Event('blur', { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(select).toHaveAttribute('aria-invalid', 'true');
  });

  it('writeValue() vía FormControl refleja el valor inicial', async () => {
    const host = new ReactiveFormHostComponent();
    host.control.setValue('us');
    await render(ReactiveFormHostComponent, { componentProperties: { control: host.control } });
    expect(screen.getByRole('combobox')).toHaveValue('us');
  });

  it('propaga los cambios al FormControl', async () => {
    const host = new ReactiveFormHostComponent();
    await render(ReactiveFormHostComponent, { componentProperties: { control: host.control } });
    const user = userEvent.setup();
    await user.selectOptions(screen.getByRole('combobox'), 'mx');
    expect(host.control.value).toBe('mx');
  });

  it('setDisabledState() vía FormControl deshabilita el select', async () => {
    const host = new ReactiveFormHostComponent();
    host.control.disable();
    await render(ReactiveFormHostComponent, { componentProperties: { control: host.control } });
    expect(screen.getByRole('combobox')).toBeDisabled();
  });
});
