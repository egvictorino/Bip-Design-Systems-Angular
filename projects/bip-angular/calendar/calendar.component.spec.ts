import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Component } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import type { CalendarView } from '@bip-design-systems/angular/core';
import { BipCalendar } from './calendar.component';
import type { BipCalendarEvent, BipCalendarResource } from './calendar.types';

const TODAY = new Date(2026, 5, 15);

const EVENTS: BipCalendarEvent[] = [
  {
    id: '1',
    title: 'Limpieza dental',
    start: new Date(2026, 5, 15, 9, 0),
    end: new Date(2026, 5, 15, 9, 30),
    status: 'confirmed',
    patientName: 'Ana Pérez',
  },
  {
    id: '2',
    title: 'Extracción',
    start: new Date(2026, 5, 15, 11, 0),
    end: new Date(2026, 5, 15, 12, 0),
    status: 'cancelled',
  },
];

const RESOURCES: BipCalendarResource[] = [{ id: 'dr1', name: 'Dra. López', color: '#2939cc' }];

@Component({
  imports: [BipCalendar],
  template: `
    <bip-calendar
      [events]="events"
      [resources]="resources"
      [disabled]="disabled"
      [(view)]="view"
      [(date)]="date"
      (eventClick)="onEventClick($event)"
      (eventCreate)="onEventCreate($event)"
    />
  `,
})
class HostComponent {
  events: BipCalendarEvent[] = EVENTS;
  resources: BipCalendarResource[] = [];
  disabled = false;
  view: CalendarView = 'month';
  date = TODAY;
  lastClicked: BipCalendarEvent | null = null;
  lastCreated: { start: Date; end: Date } | null = null;

  onEventClick(event: BipCalendarEvent): void {
    this.lastClicked = event;
  }

  onEventCreate(slot: { start: Date; end: Date }): void {
    this.lastCreated = slot;
  }
}

describe('BipCalendar', () => {
  it('tiene role="application" y aria-label', async () => {
    await render(HostComponent);
    expect(screen.getByRole('application', { name: 'Calendario' })).toBeInTheDocument();
  });

  it('renderiza la vista mes por defecto', async () => {
    await render(HostComponent);
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('renderiza 42 celdas (6×7) en la vista mes', async () => {
    const { container } = await render(HostComponent);
    expect(container.querySelectorAll('.bip-calendar-month-cell')).toHaveLength(42);
  });

  it('renderiza encabezados de días', async () => {
    await render(HostComponent);
    expect(screen.getByText('Lun')).toBeInTheDocument();
    expect(screen.getByText('Dom')).toBeInTheDocument();
  });

  it('renderiza chips de eventos del mes', async () => {
    await render(HostComponent);
    expect(screen.getByText('Limpieza dental')).toBeInTheDocument();
    expect(screen.getByText('Extracción')).toBeInTheDocument();
  });

  it('renderiza los 4 botones de cambio de vista', async () => {
    await render(HostComponent);
    expect(screen.getByRole('button', { name: 'Mes' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Semana' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Día' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Agenda' })).toBeInTheDocument();
  });

  it('marca el botón de vista activa con aria-pressed="true"', async () => {
    await render(HostComponent);
    expect(screen.getByRole('button', { name: 'Mes' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Semana' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('cambia de vista al hacer click en un botón del switcher', async () => {
    const { fixture } = await render(HostComponent);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Semana' }));
    expect(fixture.componentInstance.view).toBe('week');
  });

  it('renderiza la vista semana con 7 columnas de día', async () => {
    const { container } = await render(HostComponent, { componentProperties: { view: 'week' } });
    expect(container.querySelectorAll('.bip-calendar-time-column-group')).toHaveLength(7);
  });

  it('renderiza la vista día con una sola columna', async () => {
    const { container } = await render(HostComponent, { componentProperties: { view: 'day' } });
    expect(container.querySelectorAll('.bip-calendar-time-column-group')).toHaveLength(1);
  });

  it('renderiza columnas de doctor en semana/día cuando se proveen resources', async () => {
    const { container } = await render(HostComponent, {
      componentProperties: { view: 'day', resources: RESOURCES },
    });
    expect(container.querySelectorAll('.bip-calendar-time-column')).toHaveLength(1);
  });

  it('muestra "Próximos eventos" en la vista agenda', async () => {
    await render(HostComponent, { componentProperties: { view: 'agenda' } });
    expect(screen.getByText('Próximos eventos')).toBeInTheDocument();
  });

  it('avanza la fecha al hacer click en el botón siguiente', async () => {
    const { fixture } = await render(HostComponent);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Período siguiente' }));
    expect(fixture.componentInstance.date.getMonth()).toBe(6);
  });

  it('retrocede la fecha al hacer click en el botón anterior', async () => {
    const { fixture } = await render(HostComponent);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Período anterior' }));
    expect(fixture.componentInstance.date.getMonth()).toBe(4);
  });

  it('"Hoy" fija la fecha al día actual', async () => {
    const { fixture } = await render(HostComponent, {
      componentProperties: { date: new Date(2020, 0, 1) },
    });
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Hoy' }));
    expect(fixture.componentInstance.date.getFullYear()).toBe(new Date().getFullYear());
  });

  // ── Interacción con eventos ────────────────────────────────────────────────

  it('clic en un chip de evento emite eventClick', async () => {
    const { fixture } = await render(HostComponent);
    const user = userEvent.setup();
    await user.click(screen.getByText('Limpieza dental'));
    expect(fixture.componentInstance.lastClicked?.id).toBe('1');
  });

  it('Enter en un chip de evento con foco emite eventClick', async () => {
    const { fixture } = await render(HostComponent);
    const user = userEvent.setup();
    screen.getByText('Limpieza dental').focus();
    await user.keyboard('{Enter}');
    expect(fixture.componentInstance.lastClicked?.id).toBe('1');
  });

  it('el chip de evento tiene un aria-label con título, hora y estado', async () => {
    await render(HostComponent);
    expect(screen.getByText('Limpieza dental')).toHaveAttribute(
      'aria-label',
      expect.stringContaining('Confirmada')
    );
  });

  it('Enter/Espacio en una celda vacía emite eventCreate para ese día', async () => {
    const { fixture } = await render(HostComponent);
    const user = userEvent.setup();
    const cells = screen.getAllByRole('gridcell');
    cells[10].focus();
    await user.keyboard('{Enter}');
    expect(fixture.componentInstance.lastCreated).not.toBeNull();
  });

  // ── Deshabilitado ─────────────────────────────────────────────────────────

  it('aplica aria-disabled cuando disabled=true', async () => {
    await render(HostComponent, { componentProperties: { disabled: true } });
    expect(screen.getByRole('application')).toHaveAttribute('aria-disabled', 'true');
  });

  it('no aplica aria-disabled cuando disabled=false', async () => {
    await render(HostComponent);
    expect(screen.getByRole('application')).not.toHaveAttribute('aria-disabled');
  });

  it('deshabilita los botones del switcher cuando disabled=true', async () => {
    await render(HostComponent, { componentProperties: { disabled: true } });
    expect(screen.getByRole('button', { name: 'Semana' })).toBeDisabled();
  });

  // ── Agenda: filtros de estado ───────────────────────────────────────────────

  it('renderiza 4 chips de filtro de estado, todos activos por defecto', async () => {
    await render(HostComponent, { componentProperties: { view: 'agenda' } });
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(4);
    for (const checkbox of checkboxes) expect(checkbox).toHaveAttribute('aria-checked', 'true');
  });

  it('desmarcar un filtro oculta los eventos de ese estado', async () => {
    await render(HostComponent, { componentProperties: { view: 'agenda' } });
    const user = userEvent.setup();
    await user.click(screen.getByRole('checkbox', { name: 'Cancelada' }));
    expect(screen.queryByText('Extracción')).not.toBeInTheDocument();
    expect(screen.getByText('Limpieza dental')).toBeInTheDocument();
  });

  it('muestra el mensaje de "sin eventos filtrados" cuando todos los filtros se desactivan', async () => {
    await render(HostComponent, { componentProperties: { view: 'agenda' } });
    const user = userEvent.setup();
    for (const label of ['Pendiente', 'Confirmada', 'Completada', 'Cancelada']) {
      await user.click(screen.getByRole('checkbox', { name: label }));
    }
    expect(screen.getByText('No hay eventos con los filtros seleccionados')).toBeInTheDocument();
  });
});

/**
 * jsdom no aplica la cascada, así que el contraste real lo mide axe en navegador
 * (visual/a11y-browser.spec.ts, estados `calendar-*`). Aquí se fijan las decisiones de CSS que lo
 * garantizan.
 */
describe('calendar.component.css — contraste AA', () => {
  const css = readFileSync(resolve(__dirname, 'calendar.component.css'), 'utf-8').replace(
    /\/\*[\s\S]*?\*\//g,
    ''
  );
  const bodyOf = (selector: string): string => {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
    const match = css.match(new RegExp(`(?:^|})\\s*${escaped}\\s*{([^}]*)}`));
    if (!match) throw new Error(`No se encontró el selector ${selector}`);
    return match[1];
  };

  it('días de otro mes: --color-txt-utility sin opacity y sin pisar al día de hoy', () => {
    const body = bodyOf(
      '.bip-calendar-month-cell-date--other-month:not(.bip-calendar-month-cell-date--today)'
    );
    expect(body).toContain('color: var(--color-txt-utility)');
    expect(body).not.toMatch(/opacity/);
  });

  it('días de otro mes en rango: sube a --color-txt-secondary sobre --color-secondary', () => {
    expect(
      bodyOf(
        '.bip-calendar-month-cell--in-range .bip-calendar-month-cell-date--other-month:not(.bip-calendar-month-cell-date--today)'
      )
    ).toContain('color: var(--color-txt-secondary)');
  });

  it('el hover de los botones de vista excluye el activo (texto blanco sobre --color-primary)', () => {
    expect(
      bodyOf('.bip-calendar-view-btn:hover:not(:disabled):not(.bip-calendar-view-btn--active)')
    ).toContain('background-color: var(--color-secondary)');
    expect(css).not.toMatch(/\.bip-calendar-view-btn:hover:not\(:disabled\)\s*{/);
  });

  it.each(['.bip-calendar-agenda-filter-btn', '.bip-calendar-agenda-status-badge'])(
    '%s: el color por defecto va en :where() para no pisar el par --color-txt-on-* del estado',
    (selector) => {
      expect(bodyOf(`:where(${selector})`)).toContain('color: var(--color-txt-on-primary)');
      expect(bodyOf(selector)).not.toMatch(/(^|[\s;])color:/);
    }
  );

  it('filtro inactivo de agenda: superficie neutra + texto secundario, sin opacity', () => {
    const body = bodyOf('.bip-calendar-agenda-filter-btn.bip-calendar-agenda-filter-btn--inactive');
    expect(body).toContain('background-color: var(--color-surface-3)');
    expect(body).toContain('color: var(--color-txt-secondary)');
    expect(css).not.toMatch(/filter-btn--inactive\s*{[^}]*opacity/);
  });

  it('evento cancelado de agenda: tachado y texto secundario, sin opacity en la tarjeta', () => {
    expect(
      bodyOf('.bip-calendar-agenda-event--cancelled .bip-calendar-agenda-event-title')
    ).toContain('text-decoration: line-through');
    expect(css).not.toMatch(/agenda-event--cancelled\s*{/);
  });
});
