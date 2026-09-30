import { Component } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { BipGrid, type BipGridColumnsOrResponsive, type BipGridGap } from './grid.component';

@Component({
  imports: [BipGrid],
  template: `<div bipGrid data-testid="host" [columns]="columns" [gap]="gap">content</div>`,
})
class HostComponent {
  columns: BipGridColumnsOrResponsive = 'responsive';
  gap: BipGridGap = '4';
}

describe('BipGrid', () => {
  it('renderiza el contenido proyectado', async () => {
    await render(HostComponent);
    expect(screen.getByTestId('host')).toHaveTextContent('content');
  });

  it('por defecto es responsive con gap 4', async () => {
    await render(HostComponent);
    expect(screen.getByTestId('host')).toHaveClass('bip-grid', 'bip-grid--cols-responsive', 'bip-grid--gap-4');
  });

  it('columns=3 aplica bip-grid--cols-3', async () => {
    await render(HostComponent, { componentProperties: { columns: 3 } });
    expect(screen.getByTestId('host')).toHaveClass('bip-grid--cols-3');
  });

  it('gap=0 aplica bip-grid--gap-0', async () => {
    await render(HostComponent, { componentProperties: { gap: '0' } });
    expect(screen.getByTestId('host')).toHaveClass('bip-grid--gap-0');
  });
});
