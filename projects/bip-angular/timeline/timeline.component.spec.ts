import { Component } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { BipTimeline } from './timeline.component';
import { BipTimelineItem } from './timeline-item.component';

@Component({
  imports: [BipTimeline, BipTimelineItem],
  template: `
    <bip-timeline [orientation]="orientation" [attr.aria-label]="ariaLabel">
      <bip-timeline-item date="2024-01-01" title="Creado" description="Se creó el expediente" />
      <bip-timeline-item title="Revisado" variant="success" />
      <bip-timeline-item title="Alerta" variant="danger">
        <p>Contenido extra</p>
      </bip-timeline-item>
    </bip-timeline>
  `,
})
class HostComponent {
  orientation: 'vertical' | 'horizontal' = 'vertical';
  ariaLabel: string | null = null;
}

describe('BipTimeline', () => {
  it('renderiza role="list" y un role="listitem" por cada item', async () => {
    await render(HostComponent);
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('no trae aria-label por defecto (responsabilidad del consumidor)', async () => {
    await render(HostComponent);
    expect(screen.getByRole('list')).not.toHaveAttribute('aria-label');
  });

  it('expone el aria-label del consumidor cuando se provee', async () => {
    await render(HostComponent, { componentProperties: { ariaLabel: 'Historial del expediente' } });
    expect(screen.getByRole('list', { name: 'Historial del expediente' })).toBeInTheDocument();
  });

  it('aplica la clase horizontal cuando orientation="horizontal"', async () => {
    await render(HostComponent, { componentProperties: { orientation: 'horizontal' } });
    expect(screen.getByRole('list')).toHaveClass('bip-timeline--horizontal');
  });

  it('lanza si <bip-timeline-item> se usa fuera de <bip-timeline>', async () => {
    @Component({
      imports: [BipTimelineItem],
      template: `<bip-timeline-item title="Huérfano" />`,
    })
    class OrphanItemHost {}

    await expect(render(OrphanItemHost)).rejects.toThrow(
      '<bip-timeline-item> debe usarse dentro de <bip-timeline>'
    );
  });
});

describe('BipTimelineItem', () => {
  it('renderiza título, fecha y descripción cuando se proveen', async () => {
    await render(HostComponent);
    expect(screen.getByText('Creado')).toBeInTheDocument();
    expect(screen.getByText('2024-01-01')).toBeInTheDocument();
    expect(screen.getByText('Se creó el expediente')).toBeInTheDocument();
  });

  it('omite fecha y descripción cuando no se proveen', async () => {
    await render(HostComponent);
    expect(screen.getByText('Revisado').closest('[role="listitem"]')).not.toHaveTextContent(
      '2024-01-01'
    );
  });

  it('renderiza el contenido extra proyectado', async () => {
    await render(HostComponent);
    expect(screen.getByText('Contenido extra')).toBeInTheDocument();
  });

  it('aplica la clase de variante correspondiente', async () => {
    await render(HostComponent);
    expect(screen.getByText('Revisado').closest('[role="listitem"]')).toHaveClass(
      'bip-timeline-item--success'
    );
    expect(screen.getByText('Alerta').closest('[role="listitem"]')).toHaveClass(
      'bip-timeline-item--danger'
    );
  });
});
