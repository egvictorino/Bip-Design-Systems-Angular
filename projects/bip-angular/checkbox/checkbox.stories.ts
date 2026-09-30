import { Component } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { BipCheckbox } from './checkbox.component';
import { BipCheckboxGroup } from './checkbox-group.component';

const meta: Meta<BipCheckbox> = {
  title: 'Components/Checkbox',
  component: BipCheckbox,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
  },
};

export default meta;
type Story = StoryObj<BipCheckbox>;

export const Default: Story = { args: { label: 'Acepto los términos y condiciones' } };
export const WithHelperText: Story = {
  args: { ...Default.args, helperText: 'Debes aceptar para continuar' },
};
export const WithError: Story = {
  args: { ...Default.args, error: true, errorMessage: 'Debes aceptar los términos' },
};
export const Indeterminate: Story = { args: { label: 'Seleccionar todo', indeterminate: true } };
export const Required: Story = { args: { ...Default.args, required: true } };

@Component({
  selector: 'bip-checkbox-group-demo',
  imports: [BipCheckbox, BipCheckboxGroup],
  template: `
    <bip-checkbox-group label="Intereses" helperText="Selecciona al menos uno">
      <bip-checkbox label="Deportes" />
      <bip-checkbox label="Música" />
      <bip-checkbox label="Tecnología" />
    </bip-checkbox-group>
  `,
})
class CheckboxGroupDemo {}

export const Group: Story = {
  render: () => ({ moduleMetadata: { imports: [CheckboxGroupDemo] }, template: `<bip-checkbox-group-demo />` }),
};
