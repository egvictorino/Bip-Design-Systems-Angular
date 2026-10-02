import { Component } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { BipInput } from './input.component';

const meta: Meta<BipInput> = {
  title: 'Components/Input',
  component: BipInput,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: 'select', options: ['outlined', 'filled', 'bare'] },
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
    type: { control: 'select', options: ['text', 'email', 'password', 'tel', 'url'] },
  },
};

export default meta;
type Story = StoryObj<BipInput>;

export const Default: Story = {
  args: { label: 'Nombre', variant: 'outlined', size: 'md', type: 'text' },
};

export const WithHelperText: Story = {
  args: { ...Default.args, helperText: 'Como aparece en tu identificación' },
};

export const WithError: Story = {
  args: { ...Default.args, error: true, errorMessage: 'Este campo es requerido' },
};

export const Password: Story = {
  args: { label: 'Contraseña', type: 'password' },
};

export const Clearable: Story = {
  args: { label: 'Buscar', clearable: true, value: 'algo' },
};

@Component({
  selector: 'bip-input-disabled-demo',
  imports: [BipInput, ReactiveFormsModule],
  template: `<bip-input label="Nombre" [formControl]="control" />`,
})
class DisabledDemo {
  readonly control = new FormControl({ value: 'No editable', disabled: true });
}

export const Disabled: Story = {
  render: () => ({ moduleMetadata: { imports: [DisabledDemo] }, template: `<bip-input-disabled-demo />` }),
};

export const FullWidth: Story = {
  args: { ...Default.args, fullWidth: true },
};

@Component({
  selector: 'bip-input-reactive-forms-demo',
  imports: [BipInput, ReactiveFormsModule],
  template: `
    <bip-input
      label="Correo electrónico"
      helperText="Nunca lo compartimos"
      [formControl]="control"
      [error]="control.invalid && control.touched"
      errorMessage="Correo inválido"
    />
  `,
})
class ReactiveFormsDemo {
  readonly control = new FormControl('', { validators: [Validators.required, Validators.email] });
}

export const ReactiveForms: Story = {
  render: () => ({ moduleMetadata: { imports: [ReactiveFormsDemo] }, template: `<bip-input-reactive-forms-demo />` }),
};
