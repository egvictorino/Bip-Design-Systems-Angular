import { Component } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { BipText, type BipTextColor, type BipTextSize } from './text.component';

@Component({
  imports: [BipText],
  template: `<p bipText data-testid="host" [size]="size" [color]="color" [truncate]="truncate">
    hola
  </p>`,
})
class HostComponent {
  size: BipTextSize = 'md';
  color: BipTextColor = 'default';
  truncate = false;
}

describe('BipText', () => {
  it('renderiza el contenido proyectado', async () => {
    await render(HostComponent);
    expect(screen.getByTestId('host')).toHaveTextContent('hola');
  });

  it('aplica clases de size/weight/color por defecto', async () => {
    await render(HostComponent);
    const host = screen.getByTestId('host');
    expect(host).toHaveClass(
      'bip-text--size-base',
      'bip-text--weight-normal',
      'bip-text--color-default'
    );
  });

  it('aplica la clase del size indicado', async () => {
    await render(HostComponent, { componentProperties: { size: 'xl' } });
    expect(screen.getByTestId('host')).toHaveClass('bip-text--size-xl');
  });

  it('aplica la clase del color indicado', async () => {
    await render(HostComponent, { componentProperties: { color: 'danger' } });
    expect(screen.getByTestId('host')).toHaveClass('bip-text--color-danger');
  });

  it('truncate=true aplica bip-text--truncate', async () => {
    await render(HostComponent, { componentProperties: { truncate: true } });
    expect(screen.getByTestId('host')).toHaveClass('bip-text--truncate');
  });
});
