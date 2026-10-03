import { render } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { BipSkeleton } from './skeleton.component';

describe('BipSkeleton', () => {
  it('es aria-hidden (decorativo)', async () => {
    const { container } = await render(BipSkeleton);
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });

  it('variant=text con lines=1 renderiza un único bloque', async () => {
    const { container } = await render(BipSkeleton, {
      componentInputs: { variant: 'text', lines: 1 },
    });
    expect(container.querySelectorAll('.bip-skeleton-base').length).toBe(1);
  });

  it('variant=text con lines=3 renderiza 3 líneas, la última más corta', async () => {
    const { container } = await render(BipSkeleton, {
      componentInputs: { variant: 'text', lines: 3 },
    });
    const lines = container.querySelectorAll('.bip-skeleton-base');
    expect(lines.length).toBe(3);
    expect(lines[0]).toHaveClass('bip-skeleton--line-full');
    expect(lines[2]).toHaveClass('bip-skeleton--line-short');
  });

  it('variant=circle aplica bip-skeleton--circle', async () => {
    const { container } = await render(BipSkeleton, { componentInputs: { variant: 'circle' } });
    expect(container.querySelector('.bip-skeleton-base')).toHaveClass('bip-skeleton--circle');
  });

  it('aplica width/height como estilo inline cuando se proveen', async () => {
    const { container } = await render(BipSkeleton, {
      componentInputs: { variant: 'rect', width: '10rem', height: '4rem' },
    });
    const el = container.querySelector('.bip-skeleton-base') as HTMLElement;
    expect(el.style.width).toBe('10rem');
    expect(el.style.height).toBe('4rem');
  });

  it('animation=none no aplica clases de animación', async () => {
    const { container } = await render(BipSkeleton, { componentInputs: { animation: 'none' } });
    const el = container.querySelector('.bip-skeleton-base')!;
    expect(el).not.toHaveClass('bip-skeleton--pulse');
    expect(el).not.toHaveClass('bip-skeleton--wave');
  });
});
