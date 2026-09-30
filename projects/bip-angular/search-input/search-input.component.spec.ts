import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { fireEvent } from '@testing-library/angular';
import { describe, expect, it, vi } from 'vitest';
import { BipSearchInput } from './search-input.component';

@Component({
  imports: [BipSearchInput],
  template: `
    <bip-search-input
      [label]="label"
      [helperText]="helperText"
      [error]="error"
      [errorMessage]="errorMessage"
      [loading]="loading"
      [debounceMs]="debounceMs"
      [searchOnEnter]="searchOnEnter"
      [(value)]="value"
      (searched)="onSearch($event)"
      (cleared)="onClear()"
    />
  `,
})
class HostComponent {
  label = 'Buscar';
  helperText = '';
  error = false;
  errorMessage = '';
  loading = false;
  debounceMs = 0;
  searchOnEnter = false;
  value = '';
  onSearch = vi.fn();
  onClear = vi.fn();
}

@Component({
  imports: [BipSearchInput, ReactiveFormsModule],
  template: `<bip-search-input [formControl]="control" label="Buscar" />`,
})
class ReactiveFormHostComponent {
  readonly control = new FormControl('');
}

describe('BipSearchInput', () => {
  it('renderiza un input type=search con label vinculado', async () => {
    await render(HostComponent);
    const input = screen.getByRole('searchbox', { name: 'Buscar' });
    expect(input).toBeInTheDocument();
  });

  it('el wrapper tiene role=search', async () => {
    const { container } = await render(HostComponent);
    expect(container.querySelector('[role="search"]')).toBeInTheDocument();
  });

  it('actualiza value con [(value)] al escribir', async () => {
    const { fixture } = await render(HostComponent);
    const user = userEvent.setup();
    await user.type(screen.getByRole('searchbox'), 'hola');
    expect(fixture.componentInstance.value).toBe('hola');
  });

  it('emite search en cada tecla cuando no hay debounce ni searchOnEnter', async () => {
    const { fixture } = await render(HostComponent);
    const user = userEvent.setup();
    await user.type(screen.getByRole('searchbox'), 'ab');
    expect(fixture.componentInstance.onSearch).toHaveBeenCalledWith('a');
    expect(fixture.componentInstance.onSearch).toHaveBeenCalledWith('ab');
  });

  it('con debounceMs, solo emite search una vez tras el delay', async () => {
    vi.useFakeTimers();
    const { fixture } = await render(HostComponent, { componentProperties: { debounceMs: 300 } });
    const input = screen.getByRole('searchbox');
    fireEvent.input(input, { target: { value: 'a' } });
    fireEvent.input(input, { target: { value: 'ab' } });
    expect(fixture.componentInstance.onSearch).not.toHaveBeenCalled();
    vi.advanceTimersByTime(300);
    expect(fixture.componentInstance.onSearch).toHaveBeenCalledOnce();
    expect(fixture.componentInstance.onSearch).toHaveBeenCalledWith('ab');
    vi.useRealTimers();
  });

  it('con searchOnEnter, no emite search al escribir y sí al presionar Enter', async () => {
    const { fixture } = await render(HostComponent, { componentProperties: { searchOnEnter: true } });
    const input = screen.getByRole('searchbox');
    const user = userEvent.setup();
    await user.type(input, 'ab');
    expect(fixture.componentInstance.onSearch).not.toHaveBeenCalled();
    await user.keyboard('{Enter}');
    expect(fixture.componentInstance.onSearch).toHaveBeenCalledWith('ab');
  });

  it('muestra el botón de limpiar cuando hay valor', async () => {
    await render(HostComponent, { componentProperties: { value: 'algo' } });
    expect(screen.getByRole('button', { name: 'Limpiar búsqueda' })).toBeInTheDocument();
  });

  it('no muestra el botón de limpiar cuando el valor está vacío', async () => {
    await render(HostComponent);
    expect(screen.queryByRole('button', { name: 'Limpiar búsqueda' })).not.toBeInTheDocument();
  });

  it('no muestra el botón de limpiar mientras loading=true', async () => {
    await render(HostComponent, { componentProperties: { value: 'algo', loading: true } });
    expect(screen.queryByRole('button', { name: 'Limpiar búsqueda' })).not.toBeInTheDocument();
  });

  it('el botón de limpiar vacía el valor y emite clear', async () => {
    const { fixture } = await render(HostComponent, { componentProperties: { value: 'algo' } });
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Limpiar búsqueda' }));
    expect(fixture.componentInstance.value).toBe('');
    expect(fixture.componentInstance.onClear).toHaveBeenCalledOnce();
  });

  it('setea aria-busy cuando loading=true', async () => {
    await render(HostComponent, { componentProperties: { loading: true } });
    expect(screen.getByRole('searchbox')).toHaveAttribute('aria-busy', 'true');
  });

  it('tiene aria-invalid cuando error=true', async () => {
    await render(HostComponent, { componentProperties: { error: true } });
    expect(screen.getByRole('searchbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('renderiza errorMessage con role="alert"', async () => {
    await render(HostComponent, { componentProperties: { error: true, errorMessage: 'Requerido' } });
    expect(screen.getByRole('alert')).toHaveTextContent('Requerido');
  });

  // ── ControlValueAccessor ────────────────────────────────────────────────────

  it('writeValue() vía FormControl refleja el valor inicial', async () => {
    const host = new ReactiveFormHostComponent();
    host.control.setValue('inicial');
    await render(ReactiveFormHostComponent, { componentProperties: { control: host.control } });
    expect(screen.getByRole('searchbox')).toHaveValue('inicial');
  });

  it('propaga los cambios al FormControl', async () => {
    const host = new ReactiveFormHostComponent();
    await render(ReactiveFormHostComponent, { componentProperties: { control: host.control } });
    const user = userEvent.setup();
    await user.type(screen.getByRole('searchbox'), 'hola');
    expect(host.control.value).toBe('hola');
  });

  it('setDisabledState() vía FormControl deshabilita el input', async () => {
    const host = new ReactiveFormHostComponent();
    host.control.disable();
    await render(ReactiveFormHostComponent, { componentProperties: { control: host.control } });
    expect(screen.getByRole('searchbox')).toBeDisabled();
  });
});
