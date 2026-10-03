import { Component, signal } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { BipAccordion } from './accordion.component';
import { BipAccordionItem } from './accordion-item.component';
import { BipAccordionTrigger } from './accordion-trigger.component';
import { BipAccordionContent } from './accordion-content.component';

@Component({
  selector: 'bip-accordion-demo',
  imports: [BipAccordion, BipAccordionItem, BipAccordionTrigger, BipAccordionContent],
  template: `
    <bip-accordion [value]="value()" (valueChange)="value.set($event)" style="max-width: 28rem">
      <bip-accordion-item value="envio">
        <button type="button" bipAccordionTrigger>¿Cuánto tarda el envío?</button>
        <bip-accordion-content>Entre 2 y 5 días hábiles, según tu ubicación.</bip-accordion-content>
      </bip-accordion-item>
      <bip-accordion-item value="devolucion">
        <button type="button" bipAccordionTrigger>¿Puedo devolver un producto?</button>
        <bip-accordion-content
          >Sí, dentro de los primeros 30 días desde la compra.</bip-accordion-content
        >
      </bip-accordion-item>
      <bip-accordion-item value="pago" disabled>
        <button type="button" bipAccordionTrigger>
          Métodos de pago (deshabilitado en este demo)
        </button>
        <bip-accordion-content>Tarjeta de crédito, débito y transferencia.</bip-accordion-content>
      </bip-accordion-item>
    </bip-accordion>
  `,
})
class AccordionDemo {
  readonly value = signal<string | readonly string[]>('');
}

const meta: Meta<AccordionDemo> = {
  title: 'Components/Accordion',
  component: AccordionDemo,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<AccordionDemo>;

export const Single: Story = {};

export const Multiple: Story = {
  render: () => ({
    moduleMetadata: {
      imports: [BipAccordion, BipAccordionItem, BipAccordionTrigger, BipAccordionContent],
    },
    template: `
      <bip-accordion type="multiple" [value]="['envio']" variant="bordered" style="max-width: 28rem">
        <bip-accordion-item value="envio">
          <button type="button" bipAccordionTrigger>¿Cuánto tarda el envío?</button>
          <bip-accordion-content>Entre 2 y 5 días hábiles, según tu ubicación.</bip-accordion-content>
        </bip-accordion-item>
        <bip-accordion-item value="devolucion">
          <button type="button" bipAccordionTrigger>¿Puedo devolver un producto?</button>
          <bip-accordion-content>Sí, dentro de los primeros 30 días desde la compra.</bip-accordion-content>
        </bip-accordion-item>
      </bip-accordion>
    `,
  }),
};
