import { Component } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { BipCardHeader } from './card-header.component';

@Component({
  imports: [BipCardHeader],
  template: `<bip-card-header>Título</bip-card-header>`,
})
class HostComponent {}

describe('BipCardHeader', () => {
  it('renderiza el contenido proyectado', async () => {
    await render(HostComponent);
    expect(screen.getByText('Título')).toBeInTheDocument();
  });
});
