import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Component } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { esMX } from '../i18n';
import { BipCalendarGrid } from './calendar-grid.component';
import type { BipCalendarGridMode } from './calendar-grid.component';

const STRINGS = esMX.datePicker;

@Component({
  imports: [BipCalendarGrid],
  template: `
    <bip-calendar-grid
      [mode]="mode"
      [(viewDate)]="viewDate"
      [min]="min"
      [max]="max"
      [disabledDates]="disabledDates"
      [selected]="selected"
      [strings]="strings"
      [todayLabel]="todayLabel"
      (daySelected)="onDaySelected($event)"
    />
  `,
})
class HostComponent {
  mode: BipCalendarGridMode = 'single';
  viewDate = new Date(2026, 5, 1);
  min: Date | undefined = undefined;
  max: Date | undefined = undefined;
  disabledDates: Date[] = [];
  selected: Date | null = null;
  strings = STRINGS;
  todayLabel = '';
  lastSelected: Date | null = null;

  onDaySelected(date: Date): void {
    this.lastSelected = date;
  }
}

describe('BipCalendarGrid', () => {
  it('renderiza la cuadrícula de días con role="grid"', async () => {
    await render(HostComponent);
    expect(screen.getByRole('grid', { name: /junio 2026/i })).toBeInTheDocument();
  });

  it('muestra los 7 encabezados de columna lunes-primero', async () => {
    await render(HostComponent);
    const headers = screen.getAllByRole('columnheader');
    expect(headers.map((h) => h.textContent)).toEqual(['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do']);
  });

  it('selecciona un día al hacer click y emite daySelected', async () => {
    const { fixture } = await render(HostComponent);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /15 de junio de 2026/i }));
    expect(fixture.componentInstance.lastSelected?.getDate()).toBe(15);
  });

  it('navega al mes siguiente con el botón "Mes siguiente"', async () => {
    await render(HostComponent);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Mes siguiente' }));
    expect(screen.getByRole('button', { name: 'Julio 2026' })).toBeInTheDocument();
  });

  it('deshabilita "Mes anterior" al llegar al mes mínimo', async () => {
    await render(HostComponent, { componentProperties: { min: new Date(2026, 5, 1) } });
    expect(screen.getByRole('button', { name: 'Mes anterior' })).toBeDisabled();
  });

  it('deshabilita fechas listadas en disabledDates', async () => {
    await render(HostComponent, {
      componentProperties: { disabledDates: [new Date(2026, 5, 10)] },
    });
    expect(screen.getByRole('button', { name: /^miércoles, 10 de junio de 2026$/ })).toBeDisabled();
  });

  it('ArrowRight mueve el foco al día siguiente', async () => {
    await render(HostComponent);
    const user = userEvent.setup();
    const day1 = screen.getByRole('button', { name: /^lunes, 1 de junio de 2026$/ });
    day1.focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: /^martes, 2 de junio de 2026$/ })).toHaveFocus();
  });

  it('ArrowDown mueve el foco una semana adelante', async () => {
    await render(HostComponent);
    const user = userEvent.setup();
    screen.getByRole('button', { name: /^lunes, 1 de junio de 2026$/ }).focus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('button', { name: /^lunes, 8 de junio de 2026$/ })).toHaveFocus();
  });

  it('Enter selecciona el día con foco', async () => {
    const { fixture } = await render(HostComponent);
    const user = userEvent.setup();
    screen.getByRole('button', { name: /^lunes, 1 de junio de 2026$/ }).focus();
    await user.keyboard('{Enter}');
    expect(fixture.componentInstance.lastSelected?.getDate()).toBe(1);
  });

  it('abre el selector de mes/año al hacer click en el encabezado', async () => {
    await render(HostComponent);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Junio 2026' }));
    expect(screen.getByRole('grid', { name: 'Seleccionar mes' })).toBeInTheDocument();
    expect(screen.getAllByRole('gridcell')).toHaveLength(12);
  });

  it('seleccionar un mes vuelve a la vista de días en ese mes', async () => {
    await render(HostComponent);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Junio 2026' }));
    await user.click(screen.getByRole('button', { name: 'Agosto 2026' }));
    expect(screen.getByRole('button', { name: 'Agosto 2026' })).toBeInTheDocument();
  });

  it('renderiza el botón "Hoy" cuando se provee todayLabel', async () => {
    await render(HostComponent, { componentProperties: { todayLabel: 'Hoy' } });
    expect(screen.getByRole('button', { name: 'Hoy' })).toBeInTheDocument();
  });
});

describe('BipCalendarGrid — regresión a11y (axe en navegador, date-picker-open)', () => {
  const rowsOf = () =>
    screen
      .getAllByRole('row')
      .filter((row) => !row.classList.contains('bip-calendar-grid-row--header'));

  it.each([
    ['enero 2026', new Date(2026, 0, 1), 5],
    ['febrero 2027', new Date(2027, 1, 1), 4],
    ['agosto 2026', new Date(2026, 7, 1), 6],
  ])(
    '%s renderiza solo las semanas necesarias, todas con 7 gridcells',
    async (_name, viewDate, weeks) => {
      await render(HostComponent, { componentProperties: { viewDate } });
      const rows = rowsOf();
      expect(rows).toHaveLength(weeks);
      for (const row of rows) {
        expect(row.querySelectorAll('[role="gridcell"]')).toHaveLength(7);
      }
    }
  );

  it('data-date es ISO con mes base 1 (31-dic-2025 visible en enero 2026)', async () => {
    await render(HostComponent, { componentProperties: { viewDate: new Date(2026, 0, 1) } });
    const dates = Array.from(document.querySelectorAll('[data-date]')).map((el) =>
      el.getAttribute('data-date')
    );
    expect(dates).toContain('2025-12-31');
    expect(dates).toContain('2026-01-01');
    expect(dates).not.toContain('2025-11-31');
    for (const date of dates) expect(date).toMatch(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/);
  });

  it('el foco entre meses sigue encontrando el botón por su data-date ISO', async () => {
    await render(HostComponent, { componentProperties: { viewDate: new Date(2026, 0, 1) } });
    const user = userEvent.setup();
    const first = document.querySelector<HTMLButtonElement>('[data-date="2026-01-01"]')!;
    first.focus();
    await user.keyboard('{ArrowLeft}');
    await new Promise((resolve) => setTimeout(resolve));
    expect(document.activeElement).toBe(document.querySelector('[data-date="2025-12-31"]'));
  });
});

/**
 * jsdom no aplica la cascada, así que el contraste real lo mide axe en navegador
 * (visual/a11y-browser.spec.ts). Aquí se fijan las decisiones de CSS que lo garantizan.
 */
describe('calendar-grid.component.css — días de otro mes', () => {
  const css = readFileSync(resolve(__dirname, 'calendar-grid.component.css'), 'utf-8').replace(
    /\/\*[\s\S]*?\*\//g,
    ''
  );
  const bodyOf = (selector: string): string => {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = css.match(new RegExp(`(?:^|})\\s*${escaped}\\s*{([^}]*)}`));
    if (!match) throw new Error(`No se encontró el selector ${selector}`);
    return match[1];
  };

  it('usa --color-txt-utility sin opacity (opacity bajaba el contraste a 2.2:1)', () => {
    const body = bodyOf('.bip-calendar-grid-day--other-month');
    expect(body).toContain('color: var(--color-txt-utility)');
    expect(body).not.toMatch(/opacity/);
  });

  it('sube a --color-txt-secondary sobre --color-secondary (en rango / hover)', () => {
    expect(css).toMatch(
      /\.bip-calendar-grid-cell--in-range \.bip-calendar-grid-day--other-month,\s*\.bip-calendar-grid-day--other-month:hover:not\(:disabled\)\s*{\s*color: var\(--color-txt-secondary\)/
    );
  });

  it('el hover del seleccionado/actual conserva el relleno de marca (no cae a --color-secondary)', () => {
    expect(bodyOf('.bip-calendar-grid-day--selected:hover:not(:disabled)')).toContain(
      'background-color: var(--color-primary-hover)'
    );
    expect(
      bodyOf(
        '.bip-calendar-grid-month-btn--current:hover:not(:disabled),\n.bip-calendar-grid-year-btn--current:hover:not(:disabled)'
      )
    ).toContain('background-color: var(--color-primary-hover)');
  });
});
