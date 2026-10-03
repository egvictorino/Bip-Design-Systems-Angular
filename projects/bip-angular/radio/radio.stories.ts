import { Component } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { BipRadio } from './radio.component';
import { BipRadioGroup } from './radio-group.component';

@Component({
  selector: 'bip-radio-group-demo',
  imports: [BipRadio, BipRadioGroup],
  template: `
    <bip-radio-group
      label="Plan"
      [helperText]="helperText"
      [error]="error"
      [errorMessage]="errorMessage"
      size="md"
    >
      <bip-radio value="free" label="Gratis" />
      <bip-radio value="pro" label="Pro" />
      <bip-radio value="enterprise" label="Empresa" />
    </bip-radio-group>
  `,
})
class RadioGroupDemo {
  helperText = '';
  error = false;
  errorMessage = '';
}

const meta: Meta<RadioGroupDemo> = {
  title: 'Components/Radio',
  component: RadioGroupDemo,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<RadioGroupDemo>;

export const Default: Story = {};

export const WithHelperText: Story = {
  args: { helperText: 'Puedes cambiar de plan en cualquier momento' },
};

export const WithError: Story = { args: { error: true, errorMessage: 'Debes elegir un plan' } };

@Component({
  selector: 'bip-radio-disabled-demo',
  imports: [BipRadio, BipRadioGroup],
  template: `
    <bip-radio-group label="Plan">
      <bip-radio value="free" label="Gratis" />
      <bip-radio value="pro" label="Pro" [disabled]="true" />
    </bip-radio-group>
  `,
})
class RadioDisabledDemo {}

export const DisabledOption: Story = {
  render: () => ({
    moduleMetadata: { imports: [RadioDisabledDemo] },
    template: `<bip-radio-disabled-demo />`,
  }),
};
