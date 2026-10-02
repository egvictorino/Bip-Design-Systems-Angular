import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { BipDivider } from './divider.component';

describe('BipDivider', () => {
  it('renderiza un separador horizontal por defecto', async () => {
    await render(BipDivider);
    const sep = screen.getByRole('separator');
    expect(sep).toHaveAttribute('aria-orientation', 'horizontal');
  });

  it('renderiza como <hr> cuando es horizontal sin label', async () => {
    const { container } = await render(BipDivider);
    expect(container.querySelector('hr')).toBeInTheDocument();
  });

  it('renderiza un separador vertical', async () => {
    await render(BipDivider, { componentInputs: { orientation: 'vertical' } });
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('renderiza el label cuando se provee', async () => {
    await render(BipDivider, { componentInputs: { label: 'O continúa con' } });
    expect(screen.getByText('O continúa con')).toBeInTheDocument();
  });

  it('renderiza como <div role="separator"> (no <hr>) cuando hay label', async () => {
    const { container } = await render(BipDivider, { componentInputs: { label: 'texto' } });
    expect(container.querySelector('hr')).not.toBeInTheDocument();
    expect(container.querySelector('div[role="separator"]')).toBeInTheDocument();
  });

  it('aplica la clase dashed para variant=dashed', async () => {
    await render(BipDivider, { componentInputs: { variant: 'dashed' } });
    expect(screen.getByRole('separator')).toHaveClass('dashed');
  });
});
