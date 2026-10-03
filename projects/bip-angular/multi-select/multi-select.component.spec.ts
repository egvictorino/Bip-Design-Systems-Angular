import { readFileSync } from 'fs';
import { resolve } from 'path';
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
      [searchPlacement]="searchPlacement"
      [externalFilter]="externalFilter"
      (searchQuery)="queries.push($event)"
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
  searchPlacement: 'trigger' | 'panel' = 'panel';
  externalFilter = false;
  queries: string[] = [];
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

@Component({
  imports: [BipMultiSelect, ReactiveFormsModule],
  template: `<bip-multi-select
    [formControl]="control"
    label="Países"
    [options]="options"
    searchPlacement="trigger"
  />`,
})
class InlineReactiveFormHostComponent {
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
    const { fixture } = await render(HostComponent, {
      componentProperties: { value: ['mx', 'us'] },
    });
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
    await render(HostComponent, {
      componentProperties: { error: true, errorMessage: 'Requerido' },
    });
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
    const { fixture } = await render(HostComponent, {
      componentProperties: { showSelectAll: true },
    });
    const user = userEvent.setup();
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: /Seleccionar todo/ }));
    expect(fixture.componentInstance.value.sort()).toEqual(['mx', 'us']);
  });

  it('muestra "+N más" cuando las selecciones exceden maxVisibleChips', async () => {
    await render(HostComponent, {
      componentProperties: { value: ['mx', 'us'], maxVisibleChips: 1 },
    });
    expect(screen.getByText('+1 más')).toBeInTheDocument();
  });

  it('renderiza el estado de carga cuando loading es true', async () => {
    await render(HostComponent, { componentProperties: { loading: true } });
    const user = userEvent.setup();
    await user.click(screen.getByRole('combobox'));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  it('la región de carga está montada fuera del panel, también cerrado (regresión)', async () => {
    const { fixture } = await render(HostComponent);
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('');
    fixture.componentInstance.loading = true;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(screen.getByRole('status')).toBe(status);
    expect(status).toHaveTextContent('Cargando opciones');
  });

  it('Enter sobre el botón de un chip lo quita sin abrir el panel (regresión)', async () => {
    const { fixture } = await render(HostComponent, {
      componentProperties: { value: ['mx', 'us'] },
    });
    const user = userEvent.setup();
    screen.getByRole('button', { name: 'Eliminar México' }).focus();
    await user.keyboard('{Enter}');
    expect(fixture.componentInstance.value).toEqual(['us']);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('deshabilitar el control con el panel abierto lo cierra (regresión)', async () => {
    const host = new ReactiveFormHostComponent();
    const { fixture } = await render(ReactiveFormHostComponent, {
      componentProperties: { control: host.control },
    });
    const user = userEvent.setup();
    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    host.control.disable();
    fixture.detectChanges();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('aplica la clase full-width al host', async () => {
    const { container } = await render(HostComponent, { componentProperties: { fullWidth: true } });
    expect(container.querySelector('bip-multi-select')).toHaveClass(
      'bip-multi-select-wrapper--full-width'
    );
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

  describe('externalFilter', () => {
    it('conserva los chips elegidos aunque salgan de options() (regresión)', async () => {
      const { fixture } = await render(HostComponent, {
        componentProperties: { externalFilter: true, value: ['mx'] },
      });
      expect(screen.getByText('México')).toBeInTheDocument();
      fixture.componentInstance.options = [{ value: 'es', label: 'España' }];
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      expect(screen.getByText('México')).toBeInTheDocument();
    });

    it('los chips siguen el orden de value() aunque cambie options() (regresión)', async () => {
      const { fixture } = await render(HostComponent, {
        componentProperties: {
          externalFilter: true,
          options: [
            { value: 'mx', label: 'México' },
            { value: 'es', label: 'España' },
          ],
          value: ['mx', 'es'],
        },
      });
      const chipLabels = () =>
        Array.from(document.querySelectorAll('.bip-multi-select-chip-remove'), (b) =>
          b.getAttribute('aria-label')
        );
      expect(chipLabels()).toEqual(['Eliminar México', 'Eliminar España']);
      fixture.componentInstance.options = [{ value: 'es', label: 'España' }];
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      expect(chipLabels()).toEqual(['Eliminar México', 'Eliminar España']);
    });

    it('sin externalFilter, un valor que sale de options() pierde su chip (regresión)', async () => {
      const { fixture } = await render(HostComponent, { componentProperties: { value: ['mx'] } });
      expect(screen.getByText('México')).toBeInTheDocument();
      fixture.componentInstance.options = [{ value: 'es', label: 'España' }];
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      expect(screen.queryByText('México')).not.toBeInTheDocument();
    });
  });

  describe('searchPlacement="trigger"', () => {
    const inline = (extra: Partial<HostComponent> = {}) => ({
      componentProperties: { searchPlacement: 'trigger' as const, label: 'Países', ...extra },
    });

    it('el combobox es un <input> asociado al label y el marco no tiene rol', async () => {
      await render(HostComponent, inline());
      const combobox = screen.getByRole('combobox', { name: 'Países' });
      expect(combobox.tagName).toBe('INPUT');
      expect(combobox).toHaveAttribute('aria-autocomplete', 'list');
      expect(screen.getAllByRole('combobox')).toHaveLength(1);
    });

    it('no renderiza un buscador dentro del panel', async () => {
      await render(HostComponent, inline());
      const user = userEvent.setup();
      await user.click(screen.getByRole('combobox'));
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      expect(document.querySelectorAll('input')).toHaveLength(1);
    });

    it('escribir junto a los chips abre y filtra', async () => {
      const { fixture } = await render(HostComponent, inline({ value: ['us'] }));
      const user = userEvent.setup();
      await user.type(screen.getByRole('combobox'), 'mex');
      expect(screen.getAllByRole('option')).toHaveLength(1);
      expect(screen.getByRole('option', { name: 'México' })).toBeInTheDocument();
      expect(fixture.componentInstance.queries.at(-1)).toBe('mex');
    });

    it('↓↑ mueven aria-activedescendant saltando deshabilitadas, y Enter alterna sin cerrar', async () => {
      const { fixture } = await render(HostComponent, inline());
      const user = userEvent.setup();
      const combobox = screen.getByRole('combobox');
      await user.click(combobox);
      const [mx, us] = screen.getAllByRole('option');
      expect(combobox).toHaveAttribute('aria-activedescendant', mx.id);
      await user.keyboard('{ArrowDown}');
      expect(combobox).toHaveAttribute('aria-activedescendant', us.id);
      await user.keyboard('{ArrowDown}');
      expect(combobox).toHaveAttribute('aria-activedescendant', us.id); // "Canadá" está deshabilitada
      await user.keyboard('{Enter}');
      expect(fixture.componentInstance.value).toEqual(['us']);
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      expect(combobox).toHaveFocus();
    });

    it('Enter con "Seleccionar todo" activo selecciona las no deshabilitadas', async () => {
      const { fixture } = await render(HostComponent, inline({ showSelectAll: true }));
      const user = userEvent.setup();
      await user.click(screen.getByRole('combobox'));
      await user.keyboard('{Enter}');
      expect(fixture.componentInstance.value).toEqual(['mx', 'us']);
    });

    it('tras filtrar, Enter deja activa la misma opción y no la de su posición (regresión)', async () => {
      const { fixture } = await render(HostComponent, inline());
      const user = userEvent.setup();
      const combobox = screen.getByRole('combobox');
      await user.type(combobox, 'est');
      await user.keyboard('{Enter}');
      expect(fixture.componentInstance.value).toEqual(['us']);
      expect(combobox).toHaveValue('');
      expect(combobox).toHaveAttribute(
        'aria-activedescendant',
        screen.getByRole('option', { name: 'Estados Unidos' }).id
      );
      await user.keyboard('{Enter}');
      expect(fixture.componentInstance.value).toEqual([]);
    });

    it('Backspace quita el último chip aunque esté oculto por maxVisibleChips (regresión)', async () => {
      const { fixture } = await render(
        HostComponent,
        inline({ value: ['mx', 'us'], maxVisibleChips: 1 })
      );
      const user = userEvent.setup();
      await user.click(screen.getByRole('combobox'));
      await user.keyboard('{Backspace}');
      expect(fixture.componentInstance.value).toEqual(['mx']);
    });

    it('Backspace salta los chips de opciones deshabilitadas (regresión)', async () => {
      const { fixture } = await render(HostComponent, inline({ value: ['mx', 'ca'] }));
      const user = userEvent.setup();
      await user.click(screen.getByRole('combobox'));
      await user.keyboard('{Backspace}');
      expect(fixture.componentInstance.value).toEqual(['ca']);
    });

    it('Backspace con el campo vacío quita el último chip; con texto, no', async () => {
      const { fixture } = await render(HostComponent, inline({ value: ['mx', 'us'] }));
      const user = userEvent.setup();
      await user.click(screen.getByRole('combobox'));
      await user.keyboard('a{Backspace}');
      expect(fixture.componentInstance.value).toEqual(['mx', 'us']);
      await user.keyboard('{Backspace}');
      expect(fixture.componentInstance.value).toEqual(['mx']);
    });

    it('Escape cierra y descarta lo escrito; Tab cierra sin elegir', async () => {
      const { fixture } = await render(HostComponent, inline());
      const user = userEvent.setup();
      const combobox = screen.getByRole('combobox');
      await user.type(combobox, 'mex');
      await user.keyboard('{Escape}');
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(combobox).toHaveValue('');
      await user.click(combobox);
      await user.tab();
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(fixture.componentInstance.value).toEqual([]);
    });

    it('click en una opción alterna sin quitarle el foco al input', async () => {
      const { fixture } = await render(HostComponent, inline());
      const user = userEvent.setup();
      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: 'México' }));
      expect(fixture.componentInstance.value).toEqual(['mx']);
      expect(screen.getByRole('combobox')).toHaveFocus();
    });

    it('los botones de los chips no son tabulables (tabindex=-1)', async () => {
      await render(HostComponent, inline({ value: ['mx'] }));
      expect(screen.getByRole('button', { name: 'Eliminar México' })).toHaveAttribute(
        'tabindex',
        '-1'
      );
    });

    it('placeholder solo mientras no hay chips', async () => {
      const { fixture } = await render(HostComponent, inline({ placeholder: 'Elige' }));
      expect(screen.getByRole('combobox')).toHaveAttribute('placeholder', 'Elige');
      fixture.componentInstance.value = ['mx'];
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      expect(screen.getByRole('combobox')).toHaveAttribute('placeholder', '');
    });

    it('loading anuncia el estado (status polite) y oculta el listbox', async () => {
      await render(HostComponent, inline({ loading: true }));
      const user = userEvent.setup();
      await user.click(screen.getByRole('combobox'));
      expect(screen.getByRole('status')).toHaveTextContent('Cargando opciones');
      expect(screen.getByText('Cargando...')).toBeInTheDocument();
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(screen.getByRole('combobox')).not.toHaveAttribute('aria-controls');
    });

    it('FormControl: propaga el valor y marca touched solo al salir del campo', async () => {
      const host = new InlineReactiveFormHostComponent();
      await render(InlineReactiveFormHostComponent, {
        componentProperties: { control: host.control },
      });
      const user = userEvent.setup();
      await user.click(screen.getByRole('combobox'));
      await user.keyboard('{Enter}');
      expect(host.control.value).toEqual(['mx']);
      expect(host.control.touched).toBe(false);
      await user.tab();
      expect(host.control.touched).toBe(true);
    });

    it('disabled deshabilita el input', async () => {
      const host = new InlineReactiveFormHostComponent();
      host.control.disable();
      await render(InlineReactiveFormHostComponent, {
        componentProperties: { control: host.control },
      });
      expect(screen.getByRole('combobox')).toBeDisabled();
    });
  });

  describe('variant="filled"', () => {
    it('los chips se renderizan dentro del campo filled (precondición del contraste chip/campo)', async () => {
      await render(BipMultiSelect, {
        inputs: { options: OPTIONS, value: ['mx', 'us'], variant: 'filled', label: 'Países' },
      });
      const chips = document.querySelectorAll(
        '.bip-multi-select-chip:not(.bip-multi-select-chip--overflow)'
      );
      expect(chips).toHaveLength(2);
      chips.forEach((chip) => expect(chip.closest('.bip-multi-select--filled')).not.toBeNull());
    });

    it('el CSS distingue el chip del campo: surface-3 por defecto y --color-field en filled', () => {
      const css = readFileSync(resolve(__dirname, 'multi-select.component.css'), 'utf-8');
      const bg = (selector: string) =>
        new RegExp(
          `${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{[^}]*background-color:\\s*([^;]+);`
        ).exec(css)?.[1];
      expect(bg('.bip-multi-select-chip')).toBe('var(--color-surface-3)');
      expect(bg('.bip-multi-select--filled .bip-multi-select-chip')).toBe('var(--color-field)');
      // el campo filled sigue siendo --color-secondary: el chip nunca debe igualarlo
      expect(bg('.bip-multi-select--filled')).toBe('var(--color-secondary)');
    });
  });
});
