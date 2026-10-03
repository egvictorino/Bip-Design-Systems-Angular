import { Component } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { BipStatsCard } from './stats-card.component';
import { BipStatsCardIcon } from './stats-card-icon.directive';

@Component({
  imports: [BipStatsCard],
  template: `<bip-stats-card
    data-testid="host"
    title="Ingresos"
    [value]="value"
    [trend]="trend"
    [loading]="loading"
  />`,
})
class HostComponent {
  value: string | number = '$12,400';
  trend: number | undefined;
  loading = false;
}

@Component({
  imports: [BipStatsCard, BipStatsCardIcon],
  template: `
    <bip-stats-card data-testid="host" title="Ingresos" value="$12,400">
      <svg bipStatsCardIcon data-testid="icon"></svg>
    </bip-stats-card>
  `,
})
class HostWithIcon {}

describe('BipStatsCard', () => {
  it('tiene role="region" con aria-label del title', async () => {
    await render(HostComponent);
    expect(screen.getByRole('region', { name: 'Ingresos' })).toBeInTheDocument();
  });

  it('renderiza title y value', async () => {
    await render(HostComponent);
    expect(screen.getByText('Ingresos')).toBeInTheDocument();
    expect(screen.getByText('$12,400')).toBeInTheDocument();
  });

  it('sin trend, no renderiza el indicador de tendencia', async () => {
    const { container } = await render(HostComponent);
    expect(container.querySelector('.bip-stats-card-trend')).not.toBeInTheDocument();
  });

  it('trend positivo muestra "+N%" con aria-label localizado', async () => {
    await render(HostComponent, { componentProperties: { trend: 12 } });
    expect(screen.getByText('+12%')).toBeInTheDocument();
    expect(screen.getByLabelText('Tendencia: +12%')).toBeInTheDocument();
  });

  it('trend negativo muestra "N%" sin signo positivo', async () => {
    await render(HostComponent, { componentProperties: { trend: -5 } });
    expect(screen.getByText('-5%')).toBeInTheDocument();
  });

  it('loading=true setea aria-busy y aria-label de carga', async () => {
    await render(HostComponent, { componentProperties: { loading: true } });
    const host = screen.getByTestId('host');
    expect(host).toHaveAttribute('aria-busy', 'true');
    expect(host).toHaveAttribute('aria-label', 'Cargando estadística');
  });

  it('loading=true oculta title/value reales y muestra skeleton', async () => {
    const { container } = await render(HostComponent, { componentProperties: { loading: true } });
    expect(screen.queryByText('Ingresos')).not.toBeInTheDocument();
    expect(container.querySelector('.bip-stats-card-loading-value')).toBeInTheDocument();
  });

  it('el ícono proyectado se muestra y el slot es aria-hidden', async () => {
    const { container } = await render(HostWithIcon);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    const iconSlot = container.querySelector('.bip-stats-card-icon-slot') as HTMLElement;
    expect(iconSlot).toHaveAttribute('aria-hidden', 'true');
    expect(iconSlot.style.display).not.toBe('none');
  });

  it('sin ícono proyectado, el slot queda oculto (display:none)', async () => {
    const { container } = await render(HostComponent);
    const iconSlot = container.querySelector('.bip-stats-card-icon-slot') as HTMLElement;
    expect(iconSlot.style.display).toBe('none');
  });
});
