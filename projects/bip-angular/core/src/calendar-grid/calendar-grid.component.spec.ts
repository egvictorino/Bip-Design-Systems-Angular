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
