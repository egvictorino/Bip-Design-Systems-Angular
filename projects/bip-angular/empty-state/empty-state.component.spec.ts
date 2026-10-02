import { Component } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { BipEmptyState } from './empty-state.component';

@Component({
  imports: [BipEmptyState],
  template: `
    <bip-empty-state title="Sin resultados" description="Prueba con otros filtros">
      <button bipEmptyStateAction>Reintentar</button>
    </bip-empty-state>
  `,
})
class HostWithAction {}

@Component({
  imports: [BipEmptyState],
  template: `<bip-empty-state title="Sin resultados" />`,
})
class HostMinimal {}

@Component({
  imports: [BipEmptyState],
  template: `
    <bip-empty-state title="Sin resultados">
      <svg bipEmptyStateIcon data-testid="custom-icon"></svg>
    </bip-empty-state>
  `,
})
class HostWithCustomIcon {}

describe('BipEmptyState', () => {
  it('renderiza el título', async () => {
    await render(HostMinimal);
    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
  });

  it('renderiza el ícono por defecto (svg) cuando no se proyecta uno custom', async () => {
    const { container } = await render(HostMinimal);
    expect(container.querySelector('.bip-empty-state-icon-full')).toBeInTheDocument();
  });

  it('renderiza el ícono custom en vez del default cuando se proyecta', async () => {
    const { container } = await render(HostWithCustomIcon);
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    expect(container.querySelector('.bip-empty-state-icon-full')).not.toBeInTheDocument();
  });

  it('renderiza la description cuando se provee', async () => {
    await render(HostWithAction);
    expect(screen.getByText('Prueba con otros filtros')).toBeInTheDocument();
  });

  it('renderiza la acción proyectada', async () => {
    await render(HostWithAction);
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
  });

  it('el icon box es aria-hidden', async () => {
    const { container } = await render(HostMinimal);
    expect(container.querySelector('.bip-empty-state-icon-box')).toHaveAttribute('aria-hidden', 'true');
  });
});
