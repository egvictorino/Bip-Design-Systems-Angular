import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { BipRadio } from './radio.component';
import { BipRadioGroup } from './radio-group.component';

@Component({
  imports: [BipRadio, BipRadioGroup],
  template: `
    <bip-radio-group
      label="Plan"
      [helperText]="helperText"
      [error]="error"
      [errorMessage]="errorMessage"
      [(value)]="selected"
    >
      <bip-radio value="free" label="Gratis" />
      <bip-radio value="pro" label="Pro" />
      <bip-radio value="enterprise" label="Empresa" [disabled]="true" />
    </bip-radio-group>
  `,
})
class HostComponent {
  helperText = '';
  error = false;
  errorMessage = '';
  selected: string | null = null;
}

@Component({
  imports: [BipRadio, BipRadioGroup, ReactiveFormsModule],
  template: `
    <bip-radio-group label="Plan" [formControl]="control">
      <bip-radio value="free" label="Gratis" />
      <bip-radio value="pro" label="Pro" />
    </bip-radio-group>
  `,
})
class ReactiveFormHostComponent {
  readonly control = new FormControl<string | null>(null);
}

@Component({ template: `<bip-radio value="solo" label="Solo" />`, imports: [BipRadio] })
class RadioWithoutGroupComponent {}

describe('BipRadioGroup + BipRadio', () => {
  it('renderiza el legend y los radios hijos', async () => {
    await render(HostComponent);
    expect(screen.getByText('Plan')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Gratis' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Pro' })).toBeInTheDocument();
  });

  it('todos los radios comparten el mismo name nativo', async () => {
    await render(HostComponent);
    const free = screen.getByRole('radio', { name: 'Gratis' }) as HTMLInputElement;
    const pro = screen.getByRole('radio', { name: 'Pro' }) as HTMLInputElement;
    expect(free.name).toBe(pro.name);
    expect(free.name).toBeTruthy();
  });

  it('seleccionar un radio actualiza el value del grupo ([(value)])', async () => {
    const { fixture } = await render(HostComponent);
    const user = userEvent.setup();
    await user.click(screen.getByRole('radio', { name: 'Pro' }));
    expect(fixture.componentInstance.selected).toBe('pro');
  });

  it('solo un radio puede estar marcado a la vez', async () => {
    await render(HostComponent);
    const user = userEvent.setup();
    await user.click(screen.getByRole('radio', { name: 'Gratis' }));
    await user.click(screen.getByRole('radio', { name: 'Pro' }));
    expect(screen.getByRole('radio', { name: 'Gratis' })).not.toBeChecked();
    expect(screen.getByRole('radio', { name: 'Pro' })).toBeChecked();
  });

  it('un radio individual puede fijar su propio disabled', async () => {
    await render(HostComponent);
    expect(screen.getByRole('radio', { name: 'Empresa' })).toBeDisabled();
    expect(screen.getByRole('radio', { name: 'Gratis' })).not.toBeDisabled();
  });

  it('el radio NO lleva aria-invalid aunque el grupo tenga error', async () => {
    await render(HostComponent, { componentProperties: { error: true } });
    expect(screen.getByRole('radio', { name: 'Gratis' })).not.toHaveAttribute('aria-invalid');
  });

  it('renderiza errorMessage del grupo con role="alert"', async () => {
    await render(HostComponent, {
      componentProperties: { error: true, errorMessage: 'Elige un plan' },
    });
    expect(screen.getByRole('alert')).toHaveTextContent('Elige un plan');
  });

  it('lanza un error si <bip-radio> se usa sin <bip-radio-group>', async () => {
    await expect(render(RadioWithoutGroupComponent)).rejects.toThrow(
      '<bip-radio> debe usarse dentro de <bip-radio-group>'
    );
  });

  // ── ControlValueAccessor (grupo) ────────────────────────────────────────────

  it('writeValue() vía FormControl refleja el valor inicial', async () => {
    const host = new ReactiveFormHostComponent();
    host.control.setValue('pro');
    await render(ReactiveFormHostComponent, { componentProperties: { control: host.control } });
    expect(screen.getByRole('radio', { name: 'Pro' })).toBeChecked();
  });

  it('propaga la selección al FormControl', async () => {
    const host = new ReactiveFormHostComponent();
    await render(ReactiveFormHostComponent, { componentProperties: { control: host.control } });
    const user = userEvent.setup();
    await user.click(screen.getByRole('radio', { name: 'Gratis' }));
    expect(host.control.value).toBe('free');
  });
});
