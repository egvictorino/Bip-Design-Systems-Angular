import { Component } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { BipBadge, type BipBadgeVariant } from './badge.component';
import type { BipSize } from '@bip-design-systems/angular/core';

@Component({
  imports: [BipBadge],
  template: `<bip-badge data-testid="host" [variant]="variant" [size]="size" [dot]="dot"
    >Nuevo</bip-badge
  >`,
})
class HostComponent {
  variant: BipBadgeVariant = 'neutral';
  size: BipSize = 'md';
  dot = false;
}

describe('BipBadge', () => {
  it('renderiza el contenido proyectado', async () => {
    await render(HostComponent);
    expect(screen.getByText('Nuevo')).toBeInTheDocument();
  });

  it('por defecto es neutral/md sin dot', async () => {
    await render(HostComponent);
    const host = screen.getByTestId('host');
    expect(host).toHaveClass('bip-badge--neutral', 'bip-badge--md');
    expect(host.querySelector('.bip-badge-dot')).not.toBeInTheDocument();
  });

  it('aplica la clase del variant indicado', async () => {
    await render(HostComponent, { componentProperties: { variant: 'danger' } });
    expect(screen.getByTestId('host')).toHaveClass('bip-badge--danger');
  });

  it('dot=true renderiza el punto decorativo con la clase del variant', async () => {
    await render(HostComponent, { componentProperties: { variant: 'success', dot: true } });
    const dotEl = screen.getByTestId('host').querySelector('.bip-badge-dot');
    expect(dotEl).toBeInTheDocument();
    expect(dotEl).toHaveClass('bip-badge-dot--success');
    expect(dotEl).toHaveAttribute('aria-hidden', 'true');
  });
});
