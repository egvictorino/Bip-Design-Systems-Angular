import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { BipCheckbox } from './checkbox.component';
import { BipCheckboxGroup } from './checkbox-group.component';

@Component({
  imports: [BipCheckbox],
  template: `
    <bip-checkbox
      [label]="label"
      [helperText]="helperText"
      [error]="error"
      [errorMessage]="errorMessage"
      [required]="required"
      [indeterminate]="indeterminate"
      [size]="size"
      [(value)]="checked"
    />
  `,
})
class HostComponent {
  label = 'Acepto los términos';
  helperText = '';
  error = false;
  errorMessage = '';
  required = false;
  indeterminate = false;
  size: 'sm' | 'md' | 'lg' = 'md';
  checked = false;
}

@Component({
  imports: [BipCheckbox, BipCheckboxGroup],
  template: `
    <bip-checkbox-group label="Intereses" [error]="groupError" [disabled]="groupDisabled" size="lg">
      <bip-checkbox label="Deportes" />
      <bip-checkbox label="Música" />
    </bip-checkbox-group>
  `,
})
class GroupHostComponent {
  groupError = false;
  groupDisabled = false;
}

@Component({
  imports: [BipCheckbox, ReactiveFormsModule],
  template: `<bip-checkbox [formControl]="control" label="Acepto" />`,
})
class ReactiveFormHostComponent {
  readonly control = new FormControl(false);
}

describe('BipCheckbox', () => {
  it('renderiza un checkbox con label vinculado', async () => {
    await render(HostComponent);
    expect(screen.getByRole('checkbox', { name: 'Acepto los términos' })).toBeInTheDocument();
  });

  it('inicia sin marcar', async () => {
    await render(HostComponent);
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('actualiza value con [(value)] al hacer click', async () => {
    const { fixture } = await render(HostComponent);
    const user = userEvent.setup();
    await user.click(screen.getByRole('checkbox'));
    expect(fixture.componentInstance.checked).toBe(true);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('se puede marcar/desmarcar con teclado (Espacio)', async () => {
    await render(HostComponent);
    const user = userEvent.setup();
    const checkbox = screen.getByRole('checkbox');
    checkbox.focus();
    await user.keyboard(' ');
    expect(checkbox).toBeChecked();
  });

  it('tiene aria-invalid cuando error=true', async () => {
    await render(HostComponent, { componentProperties: { error: true } });
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('renderiza errorMessage con role="alert"', async () => {
    await render(HostComponent, { componentProperties: { error: true, errorMessage: 'Requerido' } });
    expect(screen.getByRole('alert')).toHaveTextContent('Requerido');
  });

  it('muestra el asterisco cuando required=true', async () => {
    await render(HostComponent, { componentProperties: { required: true } });
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('setea indeterminate en el elemento nativo', async () => {
    await render(HostComponent, { componentProperties: { indeterminate: true } });
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.indeterminate).toBe(true);
  });

  // ── CheckboxGroup: cascada de size/disabled/error ──────────────────────────

  it('BipCheckboxGroup renderiza legend y los checkboxes hijos', async () => {
    await render(GroupHostComponent);
    expect(screen.getByText('Intereses')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Deportes' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Música' })).toBeInTheDocument();
  });

  it('BipCheckboxGroup con disabled deshabilita los checkboxes hijos que no lo fijan', async () => {
    await render(GroupHostComponent, { componentProperties: { groupDisabled: true } });
    expect(screen.getByRole('checkbox', { name: 'Deportes' })).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: 'Música' })).toBeDisabled();
  });

  it('BipCheckboxGroup con error propaga aria-invalid a los checkboxes hijos', async () => {
    await render(GroupHostComponent, { componentProperties: { groupError: true } });
    expect(screen.getByRole('checkbox', { name: 'Deportes' })).toHaveAttribute('aria-invalid', 'true');
  });

  // ── ControlValueAccessor ────────────────────────────────────────────────────

  it('writeValue() vía FormControl refleja el valor inicial', async () => {
    const host = new ReactiveFormHostComponent();
    host.control.setValue(true);
    await render(ReactiveFormHostComponent, { componentProperties: { control: host.control } });
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('propaga los cambios al FormControl', async () => {
    const host = new ReactiveFormHostComponent();
    await render(ReactiveFormHostComponent, { componentProperties: { control: host.control } });
    const user = userEvent.setup();
    await user.click(screen.getByRole('checkbox'));
    expect(host.control.value).toBe(true);
  });

  it('setDisabledState() vía FormControl deshabilita el checkbox', async () => {
    const host = new ReactiveFormHostComponent();
    host.control.disable();
    await render(ReactiveFormHostComponent, { componentProperties: { control: host.control } });
    expect(screen.getByRole('checkbox')).toBeDisabled();
  });

  it('ariaLabel expone un nombre accesible cuando no hay label visible', async () => {
    @Component({
      imports: [BipCheckbox],
      template: `<bip-checkbox [ariaLabel]="'Seleccionar fila 1'" />`,
    })
    class AriaLabelHost {}

    await render(AriaLabelHost);
    expect(screen.getByRole('checkbox', { name: 'Seleccionar fila 1' })).toBeInTheDocument();
  });
});
