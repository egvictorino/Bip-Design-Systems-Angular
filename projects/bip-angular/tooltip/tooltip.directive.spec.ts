import { Component } from '@angular/core';
import { render, screen, fireEvent, waitFor } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { BipTooltip } from './tooltip.directive';

@Component({
  imports: [BipTooltip],
  template: `
    <button
      type="button"
      [bipTooltip]="content"
      [bipTooltipPosition]="position"
      [bipTooltipAlign]="align"
      [bipTooltipVariant]="variant"
      [bipTooltipDelay]="delay"
      [bipTooltipCloseDelay]="closeDelay"
    >
      Pasa el mouse
    </button>
  `,
})
class HostComponent {
  content = 'Información adicional';
  position: 'top' | 'bottom' | 'left' | 'right' = 'top';
  align: 'start' | 'center' | 'end' = 'center';
  variant: 'default' | 'light' | 'info' | 'success' | 'warning' | 'error' = 'default';
  delay = 0;
  closeDelay = 0;
}

describe('BipTooltip', () => {
  it('no renderiza el tooltip hasta que se activa', async () => {
    await render(HostComponent);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('el trigger tiene aria-describedby siempre presente', async () => {
    await render(HostComponent);
    expect(screen.getByRole('button')).toHaveAttribute('aria-describedby');
  });

  it('mouseenter muestra el tooltip con el contenido', async () => {
    await render(HostComponent);
    fireEvent.mouseEnter(screen.getByRole('button'));
    await waitFor(() =>
      expect(screen.getByRole('tooltip')).toHaveTextContent('Información adicional')
    );
  });

  it('mouseleave cierra el tooltip', async () => {
    await render(HostComponent);
    const trigger = screen.getByRole('button');
    fireEvent.mouseEnter(trigger);
    await waitFor(() => expect(screen.getByRole('tooltip')).toBeInTheDocument());
    fireEvent.mouseLeave(trigger);
    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
  });

  it('focus muestra el tooltip y blur lo cierra', async () => {
    await render(HostComponent);
    const trigger = screen.getByRole('button');
    fireEvent.focus(trigger);
    await waitFor(() => expect(screen.getByRole('tooltip')).toBeInTheDocument());
    fireEvent.blur(trigger);
    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
  });

  it('Escape cierra el tooltip', async () => {
    await render(HostComponent);
    const trigger = screen.getByRole('button');
    fireEvent.mouseEnter(trigger);
    await waitFor(() => expect(screen.getByRole('tooltip')).toBeInTheDocument());
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
  });

  it('el id del tooltip coincide con aria-describedby del trigger', async () => {
    await render(HostComponent);
    const trigger = screen.getByRole('button');
    fireEvent.mouseEnter(trigger);
    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip.id).toBe(trigger.getAttribute('aria-describedby'));
    });
  });

  it('la flecha es decorativa (aria-hidden)', async () => {
    await render(HostComponent);
    fireEvent.mouseEnter(screen.getByRole('button'));
    await waitFor(() => {
      const arrow = document.querySelector('.bip-tooltip-arrow');
      expect(arrow).toHaveAttribute('aria-hidden', 'true');
    });
  });
});
