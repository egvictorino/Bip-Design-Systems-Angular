import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { BipMultiSelect } from './multi-select.component';
import type { BipMultiSelectOption } from './multi-select.component';

const OPTIONS: BipMultiSelectOption[] = [
  { value: 'mx', label: 'México' },
  { value: 'us', label: 'Estados Unidos' },
  { value: 'ca', label: 'Canadá', disabled: true },
];

const GROUPED_OPTIONS: BipMultiSelectOption[] = [
  { value: 'mx', label: 'México', group: 'América' },
  { value: 'es', label: 'España', group: 'Europa' },
];

@Component({
  imports: [BipMultiSelect],
  template: `
    <bip-multi-select
      [options]="options"
      [label]="label"
      [placeholder]="placeholder"
      [error]="error"
      [errorMessage]="errorMessage"
      [fullWidth]="fullWidth"
      [maxVisibleChips]="maxVisibleChips"
      [showSelectAll]="showSelectAll"
      [loading]="loading"
      [search]="search"
      [(value)]="value"
    />
  `,
})
class HostComponent {
  options: BipMultiSelectOption[] = OPTIONS;
  label = '';
  placeholder = '';
  error = false;
  errorMessage = '';
  fullWidth = false;
  maxVisibleChips: number | undefined = undefined;
  showSelectAll = false;
  loading = false;
  search = true;
  value: string[] = [];
}

@Component({
  imports: [BipMultiSelect, ReactiveFormsModule],
  template: `<bip-multi-select [formControl]="control" label="Países" [options]="options" />`,
})
class ReactiveFormHostComponent {
  readonly control = new FormControl<string[]>([]);
  readonly options = OPTIONS;
}

describe('BipMultiSelect', () => {
  it('muestra el placeholder cuando no hay selección', async () => {
    await render(HostComponent, { componentProperties: { placeholder: 'Selecciona países' } });
    expect(screen.getByText('Selecciona países')).toBeInTheDocument();
  });

  it('muestra chips para los valores pre-seleccionados', async () => {
    await render(HostComponent, { componentProperties: { value: ['mx', 'us'] } });
    expect(screen.getByText('México')).toBeInTheDocument();
    expect(screen.getByText('Estados Unidos')).toBeInTheDocument();
  });

  it('abre el panel al hacer click en el trigger', async () => {
    await render(HostComponent);
    const user = userEvent.setup();
    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('cierra el panel con Escape y devuelve el foco al trigger', async () => {
    await render(HostComponent);
    const user = userEvent.setup();
    const trigger = screen.getByRole('combobox');
    await user.click(trigger);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('filtra opciones al escribir en el buscador', async () => {
    await render(HostComponent);
    const user = userEvent.setup();
    await user.click(screen.getByRole('combobox'));
    await user.type(screen.getByRole('textbox', { name: 'Buscar opciones' }), 'méx');
    expect(screen.getByRole('option', { name: 'México' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Estados Unidos' })).not.toBeInTheDocument();
  });

  it('muestra "Sin resultados" cuando la búsqueda no encuentra nada', async () => {
    await render(HostComponent);
    const user = userEvent.setup();
    await user.click(screen.getByRole('combobox'));
    await user.type(screen.getByRole('textbox', { name: 'Buscar opciones' }), 'zzz');
    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
  });

  it('agrega un chip al seleccionar una opción', async () => {
    const { fixture } = await render(HostComponent);
    const user = userEvent.setup();
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'México' }));
    expect(fixture.componentInstance.value).toEqual(['mx']);
  });

  it('quita un chip al hacer click en su botón de eliminar', async () => {
    const { fixture } = await render(HostComponent, { componentProperties: { value: ['mx'] } });
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Eliminar México' }));
    expect(fixture.componentInstance.value).toEqual([]);
  });

  it('limpia todas las selecciones con el botón "Eliminar todas las selecciones"', async () => {
    const { fixture } = await render(HostComponent, { componentProperties: { value: ['mx', 'us'] } });
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Eliminar todas las selecciones' }));
    expect(fixture.componentInstance.value).toEqual([]);
  });

  it('marca el combobox como no interactuable cuando está disabled vía FormControl', async () => {
    const host = new ReactiveFormHostComponent();
    host.control.disable();
    await render(ReactiveFormHostComponent, { componentProperties: { control: host.control } });
    const combobox = screen.getByRole('combobox');
    expect(combobox).toHaveAttribute('aria-disabled', 'true');
    expect(combobox).toHaveAttribute('tabindex', '-1');
  });

  it('no alterna una opción disabled al hacer click', async () => {
    const { fixture } = await render(HostComponent);
    const user = userEvent.setup();
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Canadá' }));
    expect(fixture.componentInstance.value).toEqual([]);
  });

  it('activa aria-invalid cuando error=true', async () => {
    await render(HostComponent, { componentProperties: { error: true } });
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('renderiza errorMessage con role="alert"', async () => {
    await render(HostComponent, { componentProperties: { error: true, errorMessage: 'Requerido' } });
    expect(screen.getByRole('alert')).toHaveTextContent('Requerido');
  });

  it('renderiza listbox con aria-multiselectable="true"', async () => {
    await render(HostComponent);
    const user = userEvent.setup();
    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toHaveAttribute('aria-multiselectable', 'true');
  });

  it('marca las opciones seleccionadas con aria-selected="true"', async () => {
    await render(HostComponent, { componentProperties: { value: ['mx'] } });
    const user = userEvent.setup();
    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('option', { name: 'México' })).toHaveAttribute('aria-selected', 'true');
  });

  it('abre y mueve el foco a la primera opción con ArrowDown desde el trigger', async () => {
    await render(HostComponent);
    const user = userEvent.setup();
    screen.getByRole('combobox').focus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('alterna la selección con Espacio en una opción con foco', async () => {
    const { fixture } = await render(HostComponent);
    const user = userEvent.setup();
    await user.click(screen.getByRole('combobox'));
    const option = screen.getByRole('option', { name: 'México' });
    option.focus();
    await user.keyboard(' ');
    expect(fixture.componentInstance.value).toEqual(['mx']);
  });

  it('renderiza encabezados de grupo con role="presentation"', async () => {
    await render(HostComponent, { componentProperties: { options: GROUPED_OPTIONS } });
    const user = userEvent.setup();
    await user.click(screen.getByRole('combobox'));
    const header = screen.getByText('América');
    expect(header).toHaveAttribute('role', 'presentation');
  });

  it('renderiza "Seleccionar todo" cuando showSelectAll es true', async () => {
    await render(HostComponent, { componentProperties: { showSelectAll: true } });
    const user = userEvent.setup();
    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('option', { name: /Seleccionar todo/ })).toBeInTheDocument();
  });

  it('selecciona todas las opciones no deshabilitadas al hacer click en "Seleccionar todo"', async () => {
    const { fixture } = await render(HostComponent, { componentProperties: { showSelectAll: true } });
    const user = userEvent.setup();
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: /Seleccionar todo/ }));
    expect(fixture.componentInstance.value.sort()).toEqual(['mx', 'us']);
  });

  it('muestra "+N más" cuando las selecciones exceden maxVisibleChips', async () => {
    await render(HostComponent, { componentProperties: { value: ['mx', 'us'], maxVisibleChips: 1 } });
    expect(screen.getByText('+1 más')).toBeInTheDocument();
  });

  it('renderiza el estado de carga cuando loading es true', async () => {
    await render(HostComponent, { componentProperties: { loading: true } });
    const user = userEvent.setup();
    await user.click(screen.getByRole('combobox'));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  it('aplica la clase full-width al host', async () => {
    const { container } = await render(HostComponent, { componentProperties: { fullWidth: true } });
    expect(container.querySelector('bip-multi-select')).toHaveClass('bip-multi-select-wrapper--full-width');
  });

  // ── ControlValueAccessor ────────────────────────────────────────────────────

  it('writeValue() vía FormControl refleja el valor inicial', async () => {
    const host = new ReactiveFormHostComponent();
    host.control.setValue(['us']);
    await render(ReactiveFormHostComponent, { componentProperties: { control: host.control } });
    expect(screen.getByText('Estados Unidos')).toBeInTheDocument();
  });

  it('propaga los cambios al FormControl', async () => {
    const host = new ReactiveFormHostComponent();
    await render(ReactiveFormHostComponent, { componentProperties: { control: host.control } });
    const user = userEvent.setup();
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'México' }));
    expect(host.control.value).toEqual(['mx']);
  });

  it('setDisabledState() vía FormControl deshabilita el combobox', async () => {
    const host = new ReactiveFormHostComponent();
    host.control.disable();
    await render(ReactiveFormHostComponent, { componentProperties: { control: host.control } });
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-disabled', 'true');
  });

  it('filtra ignorando acentos ("mexico" encuentra "México")', async () => {
    await render(HostComponent);
    const user = userEvent.setup();
    await user.click(screen.getByRole('combobox'));
    await user.type(screen.getByRole('textbox', { name: 'Buscar opciones' }), 'mexico');
    expect(screen.getByRole('option', { name: 'México' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Estados Unidos' })).not.toBeInTheDocument();
  });

  describe('search=false', () => {
    it('no renderiza el buscador y enfoca la primera opción al abrir', async () => {
      await render(HostComponent, { componentProperties: { search: false } });
      const user = userEvent.setup();
      await user.click(screen.getByRole('combobox'));
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      await vi.waitFor(() => expect(screen.getByRole('option', { name: 'México' })).toHaveFocus());
    });

    it('Shift+Tab desde una opción cierra el panel y devuelve el foco al trigger', async () => {
      await render(HostComponent, { componentProperties: { search: false } });
      const user = userEvent.setup();
      await user.click(screen.getByRole('combobox'));
      await vi.waitFor(() => expect(screen.getByRole('option', { name: 'México' })).toHaveFocus());
      await user.keyboard('{Shift>}{Tab}{/Shift}');
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(screen.getByRole('combobox')).toHaveFocus();
    });
  });
});
