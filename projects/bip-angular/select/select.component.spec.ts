import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { enUS, provideBipLocale } from '@bip-design-systems/angular/core';
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
      [search]="search"
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
  search = false;
  value = '';
}

@Component({
  imports: [BipSelect, ReactiveFormsModule],
  template: `<bip-select [formControl]="control" label="País" [options]="options" [search]="true" />`,
})
class SearchReactiveFormHostComponent {
  readonly control = new FormControl('', { validators: Validators.required });
  readonly options = OPTIONS;
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

  describe('search', () => {
    const search = (extra: Partial<HostComponent> = {}) => ({
      componentProperties: { search: true, label: 'País', ...extra },
    });

    it('sin search renderiza el <select> nativo (sin listbox)', async () => {
      await render(HostComponent);
      expect(screen.getByRole('combobox').tagName).toBe('SELECT');
    });

    it('con search renderiza un <input> combobox asociado a su label', async () => {
      await render(HostComponent, search());
      const combobox = screen.getByRole('combobox', { name: 'País' });
      expect(combobox.tagName).toBe('INPUT');
      expect(combobox).toHaveAttribute('aria-expanded', 'false');
      expect(combobox).toHaveAttribute('aria-autocomplete', 'list');
    });

    it('abre el listbox al hacer click y marca aria-expanded', async () => {
      await render(HostComponent, search());
      const user = userEvent.setup();
      await user.click(screen.getByRole('combobox'));
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getAllByRole('option')).toHaveLength(3);
    });

    it('filtra las opciones al escribir, ignorando acentos', async () => {
      await render(HostComponent, search());
      const user = userEvent.setup();
      await user.type(screen.getByRole('combobox'), 'mexico');
      expect(screen.getByRole('option', { name: 'México' })).toBeInTheDocument();
      expect(screen.queryByRole('option', { name: 'Estados Unidos' })).not.toBeInTheDocument();
    });

    it('muestra "Sin resultados" cuando nada coincide', async () => {
      await render(HostComponent, search());
      const user = userEvent.setup();
      await user.type(screen.getByRole('combobox'), 'zzz');
      expect(screen.getByText('Sin resultados')).toBeInTheDocument();
    });

    it('usa los textos del locale activo', async () => {
      await render(HostComponent, { ...search(), providers: [provideBipLocale(enUS)] });
      const user = userEvent.setup();
      await user.type(screen.getByRole('combobox'), 'zzz');
      expect(screen.getByText('No results')).toBeInTheDocument();
    });

    it('filtra grupos y oculta los que quedan vacíos', async () => {
      await render(HostComponent, search({ options: [], groups: GROUPS }));
      const user = userEvent.setup();
      await user.type(screen.getByRole('combobox'), 'espa');
      expect(screen.getByRole('option', { name: 'España' })).toBeInTheDocument();
      expect(screen.getByText('Europa')).toBeInTheDocument();
      expect(screen.queryByText('América')).not.toBeInTheDocument();
    });

    it('selecciona con click, actualiza [(value)] y muestra el label elegido', async () => {
      const { fixture } = await render(HostComponent, search());
      const user = userEvent.setup();
      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: 'Estados Unidos' }));
      expect(fixture.componentInstance.value).toBe('us');
      expect(screen.getByRole('combobox')).toHaveValue('Estados Unidos');
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('no selecciona una opción deshabilitada', async () => {
      const { fixture } = await render(HostComponent, search());
      const user = userEvent.setup();
      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: 'Canadá' }));
      expect(fixture.componentInstance.value).toBe('');
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('↓ mueve la opción activa saltando las deshabilitadas y Enter la elige', async () => {
      const { fixture } = await render(HostComponent, search());
      const user = userEvent.setup();
      const combobox = screen.getByRole('combobox');
      await user.click(combobox);
      const mx = screen.getByRole('option', { name: 'México' });
      const us = screen.getByRole('option', { name: 'Estados Unidos' });
      expect(combobox).toHaveAttribute('aria-activedescendant', mx.id);
      await user.keyboard('{ArrowDown}');
      expect(combobox).toHaveAttribute('aria-activedescendant', us.id);
      await user.keyboard('{ArrowDown}'); // Canadá deshabilitada: se queda en el borde
      expect(combobox).toHaveAttribute('aria-activedescendant', us.id);
      await user.keyboard('{Enter}');
      expect(fixture.componentInstance.value).toBe('us');
      expect(combobox).toHaveFocus();
    });

    it('Escape cierra y descarta lo escrito, restaurando el label elegido', async () => {
      await render(HostComponent, search({ value: 'mx' }));
      const user = userEvent.setup();
      const combobox = screen.getByRole('combobox');
      expect(combobox).toHaveValue('México');
      await user.clear(combobox);
      await user.type(combobox, 'est');
      await user.keyboard('{Escape}');
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(combobox).toHaveValue('México');
    });

    it('conserva aria-invalid y aria-describedby con error', async () => {
      await render(HostComponent, search({ error: true, errorMessage: 'Requerido' }));
      const combobox = screen.getByRole('combobox');
      expect(combobox).toHaveAttribute('aria-invalid', 'true');
      expect(combobox).toHaveAccessibleDescription('Requerido');
    });

    it('FormControl: propaga el valor y marca touched solo al salir del campo', async () => {
      const host = new SearchReactiveFormHostComponent();
      await render(SearchReactiveFormHostComponent, { componentProperties: { control: host.control } });
      const user = userEvent.setup();
      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: 'México' }));
      expect(host.control.value).toBe('mx');
      expect(host.control.touched).toBe(false);
      await user.tab();
      expect(host.control.touched).toBe(true);
    });

    it('FormControl: writeValue() refleja el valor y disabled deshabilita el input', async () => {
      const host = new SearchReactiveFormHostComponent();
      host.control.setValue('us');
      host.control.disable();
      await render(SearchReactiveFormHostComponent, { componentProperties: { control: host.control } });
      const combobox = screen.getByRole('combobox');
      expect(combobox).toHaveValue('Estados Unidos');
      expect(combobox).toBeDisabled();
    });
  });
});
