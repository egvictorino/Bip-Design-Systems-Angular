import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Component } from '@angular/core';
import { fireEvent, render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  enUS,
  esMX,
  mergeLocale,
  provideBipLocale,
  type CalendarView,
} from '@bip-design-systems/angular/core';
import { BipCalendar } from './calendar.component';
import type { BipCalendarDateRange, BipCalendarEvent, BipCalendarResource } from './calendar.types';

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

@Component({
  imports: [BipCalendar],
  template: `
    <div dir="rtl">
      <bip-calendar [events]="events" [view]="view" [date]="date" />
    </div>
  `,
})
class RtlHostComponent {
  events: BipCalendarEvent[] = EVENTS;
  view: CalendarView = 'week';
  date = TODAY;
}

describe('BipCalendar — aislamiento bidi de los rangos "inicio – fin"', () => {
  // jsdom no aplica el algoritmo bidi: se fija la estructura (el `dir` del span interior y el
  // texto en orden lógico), no el pintado, que cubre la baseline RTL de visual/.
  const titleSpan = (container: HTMLElement) =>
    container.querySelector<HTMLElement>('.bip-calendar-title > span')!;
  const timeSpan = (container: HTMLElement) =>
    container.querySelector<HTMLElement>('.bip-calendar-agenda-event-time > span')!;

  it('título semanal: span interior con dir="ltr" dentro de un layout RTL', async () => {
    const { container } = await render(RtlHostComponent);
    expect(titleSpan(container)).toHaveAttribute('dir', 'ltr');
    expect(titleSpan(container).textContent).toMatch(/^15 .+ – 21 .+, 2026$/);
  });

  it('el elemento exterior del título no lleva dir (conserva el layout lógico)', async () => {
    const { container } = await render(RtlHostComponent);
    expect(container.querySelector('.bip-calendar-title')).not.toHaveAttribute('dir');
  });

  it('título semanal: dir="rtl" con un locale de escritura RTL', async () => {
    const { container } = await render(RtlHostComponent, {
      providers: [provideBipLocale(mergeLocale(enUS, { locale: 'he-IL' }))],
    });
    expect(titleSpan(container)).toHaveAttribute('dir', 'rtl');
  });

  it('hora del evento en la agenda: span interior con dir="ltr" y orden lógico', async () => {
    const { container } = await render(RtlHostComponent, {
      componentProperties: { view: 'agenda' },
    });
    expect(timeSpan(container)).toHaveAttribute('dir', 'ltr');
    expect(timeSpan(container).textContent).toMatch(/^09:00.* – 09:30/);
    expect(container.querySelector('.bip-calendar-agenda-event-time')).not.toHaveAttribute('dir');
  });

  it('hora del evento en la agenda: dir="rtl" con un locale de escritura RTL', async () => {
    const { container } = await render(RtlHostComponent, {
      componentProperties: { view: 'agenda' },
      providers: [provideBipLocale(mergeLocale(enUS, { locale: 'he-IL' }))],
    });
    expect(timeSpan(container)).toHaveAttribute('dir', 'rtl');
  });
});

@Component({
  imports: [BipCalendar],
  template: `<bip-calendar
    [events]="[]"
    view="month"
    [date]="date"
    (rangeSelect)="range = $event"
  />`,
})
class RangeHostComponent {
  date = TODAY;
  range: BipCalendarDateRange | null = null;
}

describe('BipCalendar — foco del popover de rango', () => {
  /** Arrastre de la celda 0 a la 9 (el mousedown real enfoca la celda: jsdom no lo hace). */
  const dragRange = async () => {
    const cells = document.querySelectorAll<HTMLElement>('.bip-calendar-month-cell');
    const start = cells[0]!;
    start.focus();
    fireEvent.mouseDown(start, { button: 0 });
    fireEvent.mouseEnter(cells[9]!);
    fireEvent.mouseUp(document);
    return { start, dialog: await screen.findByRole('dialog') };
  };

  it('al abrir, el foco pasa al diálogo (antes se quedaba en la celda)', async () => {
    await render(RangeHostComponent);
    const { dialog } = await dragRange();
    await vi.waitFor(() => expect(dialog).toHaveFocus());
  });

  it('el diálogo atrapa el foco: anclas de cdkTrapFocus alrededor del popover', async () => {
    await render(RangeHostComponent);
    const { dialog } = await dragRange();
    // jsdom no simula Tab: el ciclo real se verifica en Docker (ver CHANGELOG).
    await vi.waitFor(() => {
      expect(dialog.previousElementSibling).toHaveClass('cdk-focus-trap-anchor');
      expect(dialog.nextElementSibling).toHaveClass('cdk-focus-trap-anchor');
    });
  });

  it('Escape cierra el popover y el foco vuelve a la celda donde empezó el arrastre', async () => {
    await render(RangeHostComponent);
    const user = userEvent.setup();
    const { start, dialog } = await dragRange();
    await vi.waitFor(() => expect(dialog).toHaveFocus());
    await user.keyboard('{Escape}');
    await vi.waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(start).toHaveFocus();
  });

  it('"Crear evento" emite el rango, cierra y devuelve el foco a la celda', async () => {
    const { fixture } = await render(RangeHostComponent);
    const user = userEvent.setup();
    const { start } = await dragRange();
    await user.click(screen.getByRole('button', { name: esMX.calendar.createEvent }));
    await vi.waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(fixture.componentInstance.range).not.toBeNull();
    expect(start).toHaveFocus();
  });

  it('el clic en la capa cancela sin emitir y devuelve el foco a la celda', async () => {
    const { fixture } = await render(RangeHostComponent);
    const { start } = await dragRange();
    fireEvent.click(document.querySelector('.bip-calendar-range-overlay')!);
    await vi.waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(fixture.componentInstance.range).toBeNull();
    expect(start).toHaveFocus();
  });

  it('"×" cancela sin emitir y devuelve el foco a la celda', async () => {
    const { fixture } = await render(RangeHostComponent);
    const user = userEvent.setup();
    const { start } = await dragRange();
    await user.click(screen.getByRole('button', { name: esMX.calendar.close }));
    await vi.waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(fixture.componentInstance.range).toBeNull();
    expect(start).toHaveFocus();
  });
});
