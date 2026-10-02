import { Component } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { BipPagination } from './pagination.component';
import { getPageRange } from './pagination-range';

@Component({
  imports: [BipPagination],
  template: `
    <bip-pagination
      [page]="page"
      [totalPages]="totalPages"
      [siblingCount]="siblingCount"
      [disabled]="disabled"
      (pageChange)="onPageChange($event)"
    />
  `,
})
class HostComponent {
  page = 5;
  totalPages = 10;
  siblingCount = 1;
  disabled = false;
  onPageChange = vi.fn();
}

describe('getPageRange', () => {
  it('muestra todas las páginas cuando totalPages cabe en los slots', () => {
    expect(getPageRange(1, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it('elipsis solo a la derecha cuando la página actual está al inicio', () => {
    expect(getPageRange(1, 20)).toEqual([1, 2, 3, 4, 5, 'ellipsis', 20]);
  });

  it('elipsis solo a la izquierda cuando la página actual está al final', () => {
    expect(getPageRange(20, 20)).toEqual([1, 'ellipsis', 16, 17, 18, 19, 20]);
  });

  it('elipsis en ambos extremos cuando la página actual está en el medio', () => {
    expect(getPageRange(10, 20)).toEqual([1, 'ellipsis', 9, 10, 11, 'ellipsis', 20]);
  });
});

describe('BipPagination', () => {
  it('no renderiza nada cuando totalPages <= 1', async () => {
    await render(HostComponent, { componentProperties: { totalPages: 1 } });
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('nav con aria-label localizado', async () => {
    await render(HostComponent);
    expect(screen.getByRole('navigation', { name: 'Paginación' })).toBeInTheDocument();
  });

  it('botón anterior deshabilitado en la primera página', async () => {
    await render(HostComponent, { componentProperties: { page: 1 } });
    expect(screen.getByRole('button', { name: 'Página anterior' })).toBeDisabled();
  });

  it('botón siguiente deshabilitado en la última página', async () => {
    await render(HostComponent, { componentProperties: { page: 10 } });
    expect(screen.getByRole('button', { name: 'Página siguiente' })).toBeDisabled();
  });

  it('ambos botones habilitados en una página intermedia', async () => {
    await render(HostComponent);
    expect(screen.getByRole('button', { name: 'Página anterior' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Página siguiente' })).toBeEnabled();
  });

  it('aria-current="page" solo en la página activa', async () => {
    await render(HostComponent);
    expect(screen.getByRole('button', { name: 'Página 5' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Página 4' })).not.toHaveAttribute('aria-current');
  });

  it('clic en una página emite pageChange con esa página', async () => {
    const { fixture } = await render(HostComponent);
    await userEvent.click(screen.getByRole('button', { name: 'Página 4' }));
    expect(fixture.componentInstance.onPageChange).toHaveBeenCalledWith(4);
  });

  it('clic en anterior/siguiente emite page-1/page+1', async () => {
    const { fixture } = await render(HostComponent);
    await userEvent.click(screen.getByRole('button', { name: 'Página anterior' }));
    expect(fixture.componentInstance.onPageChange).toHaveBeenCalledWith(4);

    await userEvent.click(screen.getByRole('button', { name: 'Página siguiente' }));
    expect(fixture.componentInstance.onPageChange).toHaveBeenCalledWith(6);
  });

  it('con pocas páginas, las renderiza todas sin elipsis', async () => {
    await render(HostComponent, { componentProperties: { page: 1, totalPages: 3 } });
    expect(screen.queryByText('…')).not.toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(5); // anterior + 3 páginas + siguiente
  });

  it('elipsis es aria-hidden', async () => {
    await render(HostComponent, { componentProperties: { page: 10, totalPages: 20 } });
    const ellipses = screen.getAllByText('…');
    expect(ellipses.length).toBeGreaterThan(0);
    ellipses.forEach((el) => expect(el).toHaveAttribute('aria-hidden', 'true'));
  });

  describe('disabled', () => {
    it('deshabilita anterior, siguiente y los botones de página', async () => {
      await render(HostComponent, { componentProperties: { disabled: true } });
      expect(screen.getByRole('button', { name: 'Página anterior' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Página siguiente' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Página 4' })).toBeDisabled();
    });

    it('no emite pageChange al hacer clic', async () => {
      const { fixture } = await render(HostComponent, { componentProperties: { disabled: true } });
      await userEvent.click(screen.getByRole('button', { name: 'Página 4' }));
      expect(fixture.componentInstance.onPageChange).not.toHaveBeenCalled();
    });
  });
});
