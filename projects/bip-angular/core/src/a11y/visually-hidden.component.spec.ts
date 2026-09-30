import { Component } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { BipVisuallyHidden } from './visually-hidden.component';

@Component({
  selector: 'bip-visually-hidden-test',
  template: `<bip-visually-hidden>Texto para lectores de pantalla</bip-visually-hidden>`,
  imports: [BipVisuallyHidden],
})
class VisuallyHiddenTest {}

describe('BipVisuallyHidden', () => {
  it('renderea su contenido, accesible pero visualmente recortado', async () => {
    await render(VisuallyHiddenTest);
    expect(screen.getByText('Texto para lectores de pantalla')).toBeInTheDocument();
  });
});
