import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { BipProgressBar } from './progress-bar.component';

describe('BipProgressBar', () => {
  it('tiene role="progressbar" con aria-valuemin/max y aria-valuenow', async () => {
    await render(BipProgressBar, { componentInputs: { value: 42 } });
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '42');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  it('clampa value por debajo de 0', async () => {
    await render(BipProgressBar, { componentInputs: { value: -10 } });
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('clampa value por encima de 100', async () => {
    await render(BipProgressBar, { componentInputs: { value: 150 } });
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });

  it('usa el label por defecto del locale cuando no se provee label', async () => {
    await render(BipProgressBar);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-label', 'Progreso');
  });

  it('usa el label explícito como aria-label', async () => {
    await render(BipProgressBar, { componentInputs: { label: 'Subiendo archivos' } });
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-label', 'Subiendo archivos');
  });

  it('indeterminate=true omite aria-valuenow y setea aria-busy', async () => {
    await render(BipProgressBar, { componentInputs: { indeterminate: true } });
    const bar = screen.getByRole('progressbar');
    expect(bar).not.toHaveAttribute('aria-valuenow');
    expect(bar).toHaveAttribute('aria-busy', 'true');
  });

  it('muestra el porcentaje cuando showValue=true', async () => {
    await render(BipProgressBar, { componentInputs: { value: 75, showValue: true } });
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('no muestra porcentaje si indeterminate=true, aunque showValue=true', async () => {
    await render(BipProgressBar, { componentInputs: { showValue: true, indeterminate: true } });
    expect(screen.queryByText(/%$/)).not.toBeInTheDocument();
  });

  it('helperText se asocia vía aria-describedby', async () => {
    await render(BipProgressBar, { componentInputs: { helperText: '12 de 50 archivos subidos' } });
    const bar = screen.getByRole('progressbar');
    const describedBy = bar.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy!)).toHaveTextContent('12 de 50 archivos subidos');
  });

  it('aria-valuetext usa valueText cuando se provee y no es indeterminate', async () => {
    await render(BipProgressBar, {
      componentInputs: { value: 75, valueText: '75 de 100 archivos' },
    });
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuetext', '75 de 100 archivos');
  });
});
