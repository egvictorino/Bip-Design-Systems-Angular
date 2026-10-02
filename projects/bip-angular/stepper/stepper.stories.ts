import { Component, signal } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { BipStepper } from './stepper.component';
import { BipStepperStep } from './stepper-step.component';

@Component({
  selector: 'bip-stepper-demo',
  imports: [BipStepper, BipStepperStep],
  template: `
    <bip-stepper [value]="value()" (valueChange)="value.set($event)" style="max-width: 32rem">
      <bip-stepper-step [value]="0" label="Datos personales" description="Nombre y contacto" />
      <bip-stepper-step [value]="1" label="Dirección" description="Domicilio de envío" />
      <bip-stepper-step [value]="2" label="Pago" description="Método de pago" />
      <bip-stepper-step [value]="3" label="Confirmación" />
    </bip-stepper>
  `,
})
class StepperDemo {
  readonly value = signal(1);
}

const meta: Meta<StepperDemo> = {
  title: 'Components/Stepper',
  component: StepperDemo,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<StepperDemo>;

export const Circle: Story = {};

export const Dot: Story = {
  render: () => ({
    moduleMetadata: { imports: [BipStepper, BipStepperStep] },
    template: `
      <bip-stepper [value]="1" variant="dot" style="max-width: 32rem">
        <bip-stepper-step [value]="0" label="Uno" />
        <bip-stepper-step [value]="1" label="Dos" />
        <bip-stepper-step [value]="2" label="Tres" />
      </bip-stepper>
    `,
  }),
};

export const WithStatus: Story = {
  render: () => ({
    moduleMetadata: { imports: [BipStepper, BipStepperStep] },
    template: `
      <bip-stepper [value]="2" style="max-width: 32rem">
        <bip-stepper-step [value]="0" label="Datos" variant="success" />
        <bip-stepper-step [value]="1" label="Validación" variant="loading" />
        <bip-stepper-step [value]="2" label="Pago" variant="danger" />
        <bip-stepper-step [value]="3" label="Confirmación" />
      </bip-stepper>
    `,
  }),
};

export const Vertical: Story = {
  render: () => ({
    moduleMetadata: { imports: [BipStepper, BipStepperStep] },
    template: `
      <bip-stepper [value]="1" orientation="vertical" style="max-width: 20rem">
        <bip-stepper-step [value]="0" label="Datos personales" description="Nombre y contacto" />
        <bip-stepper-step [value]="1" label="Dirección" description="Domicilio de envío" />
        <bip-stepper-step [value]="2" label="Confirmación" />
      </bip-stepper>
    `,
  }),
};
