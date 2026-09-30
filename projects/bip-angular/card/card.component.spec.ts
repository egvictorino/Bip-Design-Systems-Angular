import { Component } from '@angular/core';
import { fireEvent, render, screen } from '@testing-library/angular';
import { describe, expect, it, vi } from 'vitest';
import { BipCard } from './card.component';

@Component({
  imports: [BipCard],
  template: `<bip-card data-testid="host" [variant]="variant" [loading]="loading" [clickable]="clickable" (click)="onClick()">contenido</bip-card>`,
})
class HostComponent {
  variant: 'elevated' | 'outlined' | 'flat' = 'elevated';
  loading = false;
  clickable = false;
  onClick = vi.fn();
}

describe('BipCard', () => {
  it('renderiza el contenido proyectado', async () => {
    await render(HostComponent);
    expect(screen.getByText('contenido')).toBeInTheDocument();
  });

  it('aplica la clase del variant por defecto (elevated)', async () => {
    await render(HostComponent);
    expect(screen.getByTestId('host')).toHaveClass('bip-card--elevated');
  });

  it('loading=true muestra un skeleton y oculta el contenido proyectado', async () => {
    await render(HostComponent, { componentProperties: { loading: true } });
    expect(screen.queryByText('contenido')).not.toBeInTheDocument();
    const loadingContainer = screen.getByTestId('host').querySelector('.bip-card-loading-container');
    expect(loadingContainer).toHaveAttribute('aria-busy', 'true');
    expect(loadingContainer).toHaveAttribute('aria-label', 'Cargando...');
  });

  it('clickable=true añade role="button" y tabindex=0', async () => {
    await render(HostComponent, { componentProperties: { clickable: true } });
    const host = screen.getByTestId('host');
    expect(host).toHaveAttribute('role', 'button');
    expect(host).toHaveAttribute('tabindex', '0');
  });

  it('sin clickable, no tiene role ni tabindex', async () => {
    await render(HostComponent);
    const host = screen.getByTestId('host');
    expect(host).not.toHaveAttribute('role');
    expect(host).not.toHaveAttribute('tabindex');
  });

  it('clickable: Enter dispara el click del consumidor', async () => {
    const { fixture } = await render(HostComponent, { componentProperties: { clickable: true } });
    fireEvent.keyDown(screen.getByTestId('host'), { key: 'Enter' });
    expect(fixture.componentInstance.onClick).toHaveBeenCalled();
  });

  it('clickable: Espacio dispara el click del consumidor', async () => {
    const { fixture } = await render(HostComponent, { componentProperties: { clickable: true } });
    fireEvent.keyDown(screen.getByTestId('host'), { key: ' ' });
    expect(fixture.componentInstance.onClick).toHaveBeenCalled();
  });

  it('no clickable: Enter no dispara click', async () => {
    const { fixture } = await render(HostComponent);
    fireEvent.keyDown(screen.getByTestId('host'), { key: 'Enter' });
    expect(fixture.componentInstance.onClick).not.toHaveBeenCalled();
  });
});
