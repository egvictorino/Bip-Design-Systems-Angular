import { Component } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { BipTimeline } from './timeline.component';
import { BipTimelineItem } from './timeline-item.component';

@Component({
  selector: 'bip-timeline-demo',
  imports: [BipTimeline, BipTimelineItem],
  template: `
    <bip-timeline aria-label="Historial del pedido" style="max-width: 24rem">
      <bip-timeline-item
        date="12 ene 2026"
        title="Pedido creado"
        description="El cliente realizó el pedido"
        variant="success"
      />
      <bip-timeline-item
        date="13 ene 2026"
        title="En preparación"
        description="El equipo está armando el pedido"
      />
      <bip-timeline-item
        date="14 ene 2026"
        title="Incidencia"
        description="Falta un insumo en bodega"
        variant="danger"
      />
      <bip-timeline-item
        title="Entrega estimada"
        description="Pendiente de confirmación"
        variant="warning"
      />
    </bip-timeline>
  `,
})
class TimelineDemo {}

const meta: Meta<TimelineDemo> = {
  title: 'Components/Timeline',
  component: TimelineDemo,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<TimelineDemo>;

export const Vertical: Story = {};

export const Horizontal: Story = {
  render: () => ({
    moduleMetadata: { imports: [BipTimeline, BipTimelineItem] },
    template: `
      <bip-timeline orientation="horizontal" aria-label="Fases del proyecto">
        <bip-timeline-item title="Diseño" variant="success" />
        <bip-timeline-item title="Desarrollo" variant="success" />
        <bip-timeline-item title="QA" />
        <bip-timeline-item title="Lanzamiento" />
      </bip-timeline>
    `,
  }),
};
