import { Component } from '@angular/core';
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
  { label: 'América', options: [{ value: 'mx', label: 'México' }, { value: 'us', label: 'Estados Unidos' }] },
  { label: 'Europa', options: [{ value: 'es', label: 'España' }, { value: 'fr', label: 'Francia' }] },
];

const meta: Meta<BipSelect> = {
  title: 'Components/Select',
  component: BipSelect,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: 'select', options: ['outlined', 'filled', 'bare'] },
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
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
