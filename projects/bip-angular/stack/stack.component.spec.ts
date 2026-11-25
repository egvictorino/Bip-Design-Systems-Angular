import { Component } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import {
  BipStack,
  type BipStackAlign,
  type BipStackDirection,
  type BipStackGap,
  type BipStackJustify,
} from './stack.component';

@Component({
  imports: [BipStack],
  template: `
    <div
      bipStack
      data-testid="host"
      [direction]="direction"
      [gap]="gap"
      [align]="align"
      [justify]="justify"
      [wrap]="wrap"
    >
      content
    </div>
  `,
})
class HostComponent {
  direction: BipStackDirection = 'column';
  gap: BipStackGap = '4';
  align: BipStackAlign | undefined;
  justify: BipStackJustify | undefined;
  wrap = false;
}

describe('BipStack', () => {
  it('renderiza el contenido proyectado', async () => {
    await render(HostComponent);
    expect(screen.getByTestId('host')).toHaveTextContent('content');
  });

  it('por defecto es column con gap 4', async () => {
    await render(HostComponent);
    const host = screen.getByTestId('host');
    expect(host).toHaveClass('bip-stack', 'bip-stack--column', 'bip-stack--gap-4');
  });

  it('direction=row aplica bip-stack--row', async () => {
    await render(HostComponent, { componentProperties: { direction: 'row' } });
    expect(screen.getByTestId('host')).toHaveClass('bip-stack--row');
  });

  it('align y justify aplican sus clases', async () => {
    await render(HostComponent, { componentProperties: { align: 'center', justify: 'between' } });
    const host = screen.getByTestId('host');
    expect(host).toHaveClass('bip-stack--align-center', 'bip-stack--justify-between');
  });

  it('wrap=true aplica bip-stack--wrap', async () => {
    await render(HostComponent, { componentProperties: { wrap: true } });
    expect(screen.getByTestId('host')).toHaveClass('bip-stack--wrap');
  });

  it('wrap=false (default) no aplica bip-stack--wrap', async () => {
    await render(HostComponent);
    expect(screen.getByTestId('host')).not.toHaveClass('bip-stack--wrap');
  });
});
