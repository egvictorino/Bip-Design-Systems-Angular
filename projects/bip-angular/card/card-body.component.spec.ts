import { Component } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { BipCardBody } from './card-body.component';

@Component({
  imports: [BipCardBody],
  template: `<bip-card-body>Cuerpo</bip-card-body>`,
})
class HostComponent {}

describe('BipCardBody', () => {
  it('renderiza el contenido proyectado', async () => {
    await render(HostComponent);
    expect(screen.getByText('Cuerpo')).toBeInTheDocument();
  });
});
