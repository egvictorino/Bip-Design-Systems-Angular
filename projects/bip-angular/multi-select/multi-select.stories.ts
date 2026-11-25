import { Component, OnDestroy, signal } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { BipMultiSelect } from './multi-select.component';
import type { BipMultiSelectOption } from './multi-select.component';

const OPTIONS: BipMultiSelectOption[] = [
  { value: 'mx', label: 'México' },
  { value: 'us', label: 'Estados Unidos' },
  { value: 'ca', label: 'Canadá' },
  { value: 'br', label: 'Brasil' },
  { value: 'ar', label: 'Argentina', disabled: true },
];

const GROUPED_OPTIONS: BipMultiSelectOption[] = [
  { value: 'mx', label: 'México', group: 'América' },
  { value: 'us', label: 'Estados Unidos', group: 'América' },
  { value: 'es', label: 'España', group: 'Europa' },
  { value: 'fr', label: 'Francia', group: 'Europa' },
];

const meta: Meta<BipMultiSelect> = {
  title: 'Components/MultiSelect',
  component: BipMultiSelect,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: 'select', options: ['outlined', 'filled', 'bare'] },
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
    searchPlacement: { control: 'radio', options: ['panel', 'trigger'] },
  },
};

export default meta;
type Story = StoryObj<BipMultiSelect>;

export const Default: Story = {
  args: { label: 'Países', placeholder: 'Selecciona países', options: OPTIONS },
};

export const Preselected: Story = {
  args: { ...Default.args, value: ['mx', 'us'] },
};

export const Variants: Story = {
  parameters: { layout: 'padded' },
  render: () => ({
    props: { options: OPTIONS, value: ['mx', 'us'] },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px; max-width: 360px;">
        <bip-multi-select variant="outlined" label="Outlined" [options]="options" [value]="value" />
        <bip-multi-select variant="filled" label="Filled" [options]="options" [value]="value" />
        <bip-multi-select variant="bare" label="Bare" [options]="options" [value]="value" />
      </div>
    `,
  }),
};

export const Grouped: Story = {
  args: { label: 'Países', placeholder: 'Selecciona países', options: GROUPED_OPTIONS },
};

export const WithSelectAll: Story = {
  args: { ...Default.args, showSelectAll: true },
};

export const WithMaxVisibleChips: Story = {
  args: { ...Default.args, value: ['mx', 'us', 'ca', 'br'], maxVisibleChips: 2 },
};

export const WithHelperText: Story = {
  args: { ...Default.args, helperText: 'Puedes seleccionar varios países' },
};

export const WithError: Story = {
  args: { ...Default.args, error: true, errorMessage: 'Debes seleccionar al menos un país' },
};

export const Loading: Story = {
  args: { ...Default.args, loading: true },
};

export const FullWidth: Story = {
  args: { ...Default.args, fullWidth: true },
};

export const WithoutSearch: Story = {
  args: { ...Default.args, search: false },
};

/** Con `searchPlacement="trigger"` se escribe junto a los chips: ↓↑ Enter Escape, Backspace quita el último chip. */
export const TriggerSearch: Story = {
  args: { ...Default.args, searchPlacement: 'trigger', value: ['mx', 'us'], showSelectAll: true },
};

export const TriggerSearchGrouped: Story = {
  args: {
    label: 'Países',
    placeholder: 'Escribe para buscar',
    options: GROUPED_OPTIONS,
    searchPlacement: 'trigger',
  },
};

const API_COUNTRIES: BipMultiSelectOption[] = [
  { value: 'ar', label: 'Argentina' },
  { value: 'br', label: 'Brasil' },
  { value: 'cl', label: 'Chile' },
  { value: 'co', label: 'Colombia' },
  { value: 'es', label: 'España' },
  { value: 'mx', label: 'México' },
  { value: 'pe', label: 'Perú' },
];

/**
 * Búsqueda remota con el buscador en el trigger: `externalFilter` + `(searchQuery)` con debounce y
 * `loading`. Los chips elegidos se conservan aunque ya no estén en `options` (se recuerdan); un valor
 * inicial debe venir en la primera carga, como `mx` aquí.
 */
@Component({
  selector: 'bip-multi-select-remote-demo',
  imports: [BipMultiSelect],
  template: `
    <bip-multi-select
      label="Países"
      placeholder="Escribe para buscar"
      searchPlacement="trigger"
      [externalFilter]="true"
      [loading]="loading()"
      [options]="options()"
      [(value)]="value"
      (searchQuery)="onQuery($event)"
    />
  `,
})
class RemoteTriggerSearchDemo implements OnDestroy {
  readonly options = signal<BipMultiSelectOption[]>(API_COUNTRIES.filter((c) => c.value === 'mx'));
  readonly loading = signal(false);
  readonly value = signal<string[]>(['mx']);
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

export const TriggerSearchRemote: Story = {
  render: () => ({
    moduleMetadata: { imports: [RemoteTriggerSearchDemo] },
    template: `<bip-multi-select-remote-demo />`,
  }),
};
