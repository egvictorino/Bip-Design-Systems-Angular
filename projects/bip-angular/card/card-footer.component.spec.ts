import { Component } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { BipCardFooter } from './card-footer.component';

@Component({
  imports: [BipCardFooter],
  template: `<bip-card-footer>Pie</bip-card-footer>`,
})
class HostComponent {}

describe('BipCardFooter', () => {
  it('renderiza el contenido proyectado', async () => {
    await render(HostComponent);
    expect(screen.getByText('Pie')).toBeInTheDocument();
  });
});
