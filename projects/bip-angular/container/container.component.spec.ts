import { Component } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { BipContainer, type BipContainerMaxWidth } from './container.component';

@Component({
  imports: [BipContainer],
  template: `<section bipContainer data-testid="host" [maxWidth]="maxWidth">content</section>`,
})
class HostComponent {
  maxWidth: BipContainerMaxWidth = 'lg';
}

describe('BipContainer', () => {
  it('renderiza el contenido proyectado', async () => {
    await render(HostComponent);
    expect(screen.getByTestId('host')).toHaveTextContent('content');
  });

  it('aplica maxWidth=lg (default) como clase', async () => {
    await render(HostComponent);
    expect(screen.getByTestId('host')).toHaveClass('bip-container--max-lg');
  });

  it('aplica la clase de maxWidth indicado', async () => {
    await render(HostComponent, { componentProperties: { maxWidth: 'full' } });
    expect(screen.getByTestId('host')).toHaveClass('bip-container--max-full');
  });

  it('conserva la clase base independientemente de maxWidth', async () => {
    await render(HostComponent, { componentProperties: { maxWidth: 'sm' } });
    expect(screen.getByTestId('host')).toHaveClass('bip-container', 'bip-container--max-sm');
  });
});
