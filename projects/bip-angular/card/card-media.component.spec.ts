import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { BipCardMedia } from './card-media.component';

describe('BipCardMedia', () => {
  it('renderiza una <img> con src y alt', async () => {
    await render(BipCardMedia, {
      componentInputs: { src: 'https://example.com/foto.jpg', alt: 'Descripción' },
    });
    const img = screen.getByRole('img', { name: 'Descripción' });
    expect(img).toHaveAttribute('src', 'https://example.com/foto.jpg');
  });

  it('aspectRatio por defecto es video', async () => {
    const { container } = await render(BipCardMedia, {
      componentInputs: { src: 'https://example.com/foto.jpg', alt: 'Descripción' },
    });
    expect(container).toHaveClass('bip-card-media--aspect-video');
  });

  it('aplica la clase del aspectRatio indicado', async () => {
    const { container } = await render(BipCardMedia, {
      componentInputs: {
        src: 'https://example.com/foto.jpg',
        alt: 'Descripción',
        aspectRatio: 'square',
      },
    });
    expect(container).toHaveClass('bip-card-media--aspect-square');
  });
});
