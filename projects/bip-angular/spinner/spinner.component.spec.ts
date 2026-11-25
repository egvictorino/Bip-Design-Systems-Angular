import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { BipSpinner } from './spinner.component';

describe('BipSpinner', () => {
  it('tiene role="status"', async () => {
    await render(BipSpinner);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('tiene aria-label por defecto "Cargando..."', async () => {
    await render(BipSpinner);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Cargando...');
  });

  it('acepta un label personalizado', async () => {
    await render(BipSpinner, { componentInputs: { label: 'Procesando solicitud...' } });
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Procesando solicitud...');
  });

  it('el svg interno es aria-hidden', async () => {
    const { container } = await render(BipSpinner);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it.each(['xs', 'sm', 'md', 'lg', 'xl'] as const)(
    'size=%s aplica la clase correspondiente',
    async (size) => {
      const { container } = await render(BipSpinner, { componentInputs: { size } });
      expect(container.querySelector('svg')).toHaveClass(`bip-spinner-svg--${size}`);
    }
  );

  it('no aplica clase de speed cuando se omite', async () => {
    const { container } = await render(BipSpinner);
    const svg = container.querySelector('svg')!;
    expect(svg).not.toHaveClass('bip-spinner-svg--slow');
    expect(svg).not.toHaveClass('bip-spinner-svg--normal');
    expect(svg).not.toHaveClass('bip-spinner-svg--fast');
  });

  it('speed=fast aplica bip-spinner-svg--fast', async () => {
    const { container } = await render(BipSpinner, { componentInputs: { speed: 'fast' } });
    expect(container.querySelector('svg')).toHaveClass('bip-spinner-svg--fast');
  });
});
