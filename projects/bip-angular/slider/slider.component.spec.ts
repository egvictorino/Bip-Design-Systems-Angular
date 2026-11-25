import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { fireEvent, render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { BipSlider } from './slider.component';

@Component({
  imports: [BipSlider],
  template: `
    <bip-slider
      [label]="label"
      [helperText]="helperText"
      [error]="error"
      [errorMessage]="errorMessage"
      [showValue]="showValue"
      [min]="min"
      [max]="max"
      [step]="step"
      [(value)]="value"
    />
  `,
})
class HostComponent {
  label = 'Volumen';
  helperText = '';
  error = false;
  errorMessage = '';
  showValue = false;
  min = 0;
  max = 100;
  step = 1;
  value = 50;
}

@Component({
  imports: [BipSlider, ReactiveFormsModule],
  template: `<bip-slider [formControl]="control" label="Volumen" />`,
})
class ReactiveFormHostComponent {
  readonly control = new FormControl(0);
}

describe('BipSlider', () => {
  it('renderiza un slider con label vinculado', async () => {
    await render(HostComponent);
    expect(screen.getByRole('slider', { name: 'Volumen' })).toBeInTheDocument();
  });

  it('refleja el valor inicial', async () => {
    await render(HostComponent);
    expect(screen.getByRole('slider')).toHaveValue('50');
  });

  it('respeta min/max/step', async () => {
    await render(HostComponent, { componentProperties: { min: 10, max: 20, step: 5 } });
    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('min', '10');
    expect(slider).toHaveAttribute('max', '20');
    expect(slider).toHaveAttribute('step', '5');
  });

  it('actualiza value con [(value)] al mover el slider', async () => {
    const { fixture } = await render(HostComponent);
    const slider = screen.getByRole('slider');
    fireEvent.input(slider, { target: { value: '51' } });
    expect(fixture.componentInstance.value).toBe(51);
  });

  it('muestra el valor actual cuando showValue=true', async () => {
    await render(HostComponent, { componentProperties: { showValue: true, value: 42 } });
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('no muestra el valor cuando showValue=false', async () => {
    await render(HostComponent, { componentProperties: { value: 42 } });
    expect(screen.queryByText('42')).not.toBeInTheDocument();
  });

  it('tiene aria-invalid cuando error=true', async () => {
    await render(HostComponent, { componentProperties: { error: true } });
    expect(screen.getByRole('slider')).toHaveAttribute('aria-invalid', 'true');
  });

  it('renderiza errorMessage con role="alert"', async () => {
    await render(HostComponent, {
      componentProperties: { error: true, errorMessage: 'Requerido' },
    });
    expect(screen.getByRole('alert')).toHaveTextContent('Requerido');
  });

  it('renderiza helperText', async () => {
    await render(HostComponent, { componentProperties: { helperText: 'Ajusta el volumen' } });
    expect(screen.getByText('Ajusta el volumen')).toBeInTheDocument();
  });

  // ── ControlValueAccessor ────────────────────────────────────────────────────

  it('writeValue() vía FormControl refleja el valor inicial', async () => {
    const host = new ReactiveFormHostComponent();
    host.control.setValue(30);
    await render(ReactiveFormHostComponent, { componentProperties: { control: host.control } });
    expect(screen.getByRole('slider')).toHaveValue('30');
  });

  it('propaga los cambios al FormControl', async () => {
    const host = new ReactiveFormHostComponent();
    await render(ReactiveFormHostComponent, { componentProperties: { control: host.control } });
    const slider = screen.getByRole('slider');
    fireEvent.input(slider, { target: { value: '1' } });
    expect(host.control.value).toBe(1);
  });

  it('setDisabledState() vía FormControl deshabilita el slider', async () => {
    const host = new ReactiveFormHostComponent();
    host.control.disable();
    await render(ReactiveFormHostComponent, { componentProperties: { control: host.control } });
    expect(screen.getByRole('slider')).toBeDisabled();
  });
});
