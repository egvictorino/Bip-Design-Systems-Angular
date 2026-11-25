import { Component, OnDestroy, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { BipSelect } from './select.component';
import type { BipSelectOption, BipSelectOptionGroup } from './select.component';

const OPTIONS: BipSelectOption[] = [
  { value: 'mx', label: 'México' },
  { value: 'us', label: 'Estados Unidos' },
  { value: 'ca', label: 'Canadá' },
];

const GROUPS: BipSelectOptionGroup[] = [
  {
    label: 'América',
    options: [
      { value: 'mx', label: 'México' },
      { value: 'us', label: 'Estados Unidos' },
    ],
  },
  {
    label: 'Europa',
    options: [
      { value: 'es', label: 'España' },
      { value: 'fr', label: 'Francia' },
    ],
  },
];

const meta: Meta<BipSelect> = {
  title: 'Components/Select',
  component: BipSelect,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: 'select', options: ['outlined', 'filled', 'bare'] },
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
    search: { control: 'boolean' },
    externalFilter: { control: 'boolean' },
    loading: { control: 'boolean' },
    clearable: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<BipSelect>;

export const Default: Story = {
  args: { label: 'País', placeholder: 'Selecciona un país', options: OPTIONS },
};

export const WithHelperText: Story = {
  args: { ...Default.args, helperText: 'Usaremos esto para calcular impuestos' },
};

export const WithError: Story = {
  args: { ...Default.args, error: true, errorMessage: 'Debes seleccionar un país' },
};

export const Grouped: Story = {
  args: { label: 'País', placeholder: 'Selecciona un país', groups: GROUPS },
};

export const FullWidth: Story = {
  args: { ...Default.args, fullWidth: true },
};

export const Searchable: Story = {
  args: { label: 'País', placeholder: 'Escribe para buscar', search: true, options: OPTIONS },
};

export const SearchableGrouped: Story = {
  args: { label: 'País', placeholder: 'Escribe para buscar', search: true, groups: GROUPS },
};

@Component({
  selector: 'bip-select-search-reactive-forms-demo',
  imports: [BipSelect, ReactiveFormsModule],
  template: `
    <bip-select
      label="País"
      placeholder="Escribe para buscar"
      [search]="true"
      [options]="options"
      [formControl]="control"
      [error]="control.invalid && control.touched"
      errorMessage="Debes seleccionar un país"
    />
  `,
})
class SearchReactiveFormsDemo {
  readonly options = OPTIONS;
  readonly control = new FormControl('', { validators: Validators.required });
}

export const SearchableReactiveForms: Story = {
  render: () => ({
    moduleMetadata: { imports: [SearchReactiveFormsDemo] },
    template: `<bip-select-search-reactive-forms-demo />`,
  }),
};

export const SearchableClearable: Story = {
  args: {
    label: 'País',
    placeholder: 'Escribe para buscar',
    search: true,
    clearable: true,
    options: OPTIONS,
    value: 'mx',
  },
};

const API_COUNTRIES: BipSelectOption[] = [
  { value: 'ar', label: 'Argentina' },
  { value: 'br', label: 'Brasil' },
  { value: 'ca', label: 'Canadá' },
  { value: 'cl', label: 'Chile' },
  { value: 'co', label: 'Colombia' },
  { value: 'es', label: 'España' },
  { value: 'mx', label: 'México' },
  { value: 'pe', label: 'Perú' },
  { value: 'us', label: 'Estados Unidos' },
];

/**
 * Búsqueda remota: con `externalFilter` el componente no filtra; el consumidor reemplaza `options`
 * a partir de `(searchQuery)` (aquí con debounce y una API simulada). La opción elegida conserva su
 * label aunque ya no esté en `options` (se recuerda la última elegida); un valor inicial debe venir
 * en la primera carga, como `mx` aquí.
 */
@Component({
  selector: 'bip-select-remote-demo',
  imports: [BipSelect],
  template: `
    <bip-select
      label="País"
      placeholder="Escribe para buscar"
      [search]="true"
      [clearable]="true"
      [externalFilter]="true"
      [loading]="loading()"
      [options]="options()"
      [(value)]="value"
      (searchQuery)="onQuery($event)"
    />
  `,
})
class RemoteSearchDemo implements OnDestroy {
  readonly options = signal<BipSelectOption[]>([API_COUNTRIES.find((c) => c.value === 'mx')!]);
  readonly loading = signal(false);
  readonly value = signal('mx');
  private timer: ReturnType<typeof setTimeout> | undefined;

  onQuery(query: string): void {
    clearTimeout(this.timer);
    this.loading.set(true);
    this.timer = setTimeout(() => {
      const q = query.trim().toLowerCase();
      this.options.set(API_COUNTRIES.filter((c) => c.label.toLowerCase().includes(q)));
      this.loading.set(false);
    }, 600);
  }

  ngOnDestroy(): void {
    clearTimeout(this.timer);
  }
}

export const SearchableRemote: Story = {
  render: () => ({
    moduleMetadata: { imports: [RemoteSearchDemo] },
    template: `<bip-select-remote-demo />`,
  }),
};
