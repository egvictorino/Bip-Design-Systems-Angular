import { Component } from '@angular/core';
import { render, screen, fireEvent, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { BipPopover } from './popover.component';
import { BipPopoverTrigger } from './popover-trigger.directive';
import { BipPopoverContent, type BipPopoverPlacement } from './popover-content.component';

@Component({
  imports: [BipPopover, BipPopoverTrigger, BipPopoverContent],
  template: `
    <bip-popover [(open)]="open">
      <button type="button" bipPopoverTrigger>Abrir</button>
      <bip-popover-content [placement]="placement">
        <p>Contenido del popover</p>
        <button type="button">Acción</button>
      </bip-popover-content>
    </bip-popover>
  `,
})
class HostComponent {
  open = false;
  placement: BipPopoverPlacement = 'bottom-start';
}

describe('BipPopover', () => {
  it('no renderiza el contenido cuando está cerrado', async () => {
    await render(HostComponent);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('clic en el trigger abre el popover', async () => {
    await render(HostComponent);
    await userEvent.click(screen.getByRole('button', { name: 'Abrir' }));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
  });

  it('el trigger tiene aria-haspopup, aria-expanded y aria-controls correctos', async () => {
    await render(HostComponent);
    const trigger = screen.getByRole('button', { name: 'Abrir' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(trigger);
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));
    const dialog = screen.getByRole('dialog');
    expect(trigger.getAttribute('aria-controls')).toBe(dialog.id);
    expect(dialog.getAttribute('aria-labelledby')).toBe(trigger.id);
  });

  it('clic de nuevo en el trigger cierra el popover (toggle)', async () => {
    await render(HostComponent);
    const trigger = screen.getByRole('button', { name: 'Abrir' });
    await userEvent.click(trigger);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
    await userEvent.click(trigger);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('Escape cierra el popover', async () => {
    await render(HostComponent);
    await userEvent.click(screen.getByRole('button', { name: 'Abrir' }));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('clic fuera cierra el popover', async () => {
    await render(HostComponent);
    await userEvent.click(screen.getByRole('button', { name: 'Abrir' }));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());

    await userEvent.click(document.body);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('clic dentro del contenido no lo cierra', async () => {
    await render(HostComponent);
    await userEvent.click(screen.getByRole('button', { name: 'Abrir' }));
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());

    await userEvent.click(screen.getByRole('button', { name: 'Acción' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('lanza si <bip-popover-content> se usa fuera de <bip-popover>', async () => {
    @Component({
      imports: [BipPopoverContent],
      template: `<bip-popover-content>Contenido</bip-popover-content>`,
    })
    class OrphanContentHost {}

    await expect(render(OrphanContentHost)).rejects.toThrow(
      '<bip-popover-content> debe usarse dentro de <bip-popover>'
    );
  });

  it('lanza si [bipPopoverTrigger] se usa fuera de <bip-popover>', async () => {
    @Component({
      imports: [BipPopoverTrigger],
      template: `<button type="button" bipPopoverTrigger>Trigger</button>`,
    })
    class OrphanTriggerHost {}

    await expect(render(OrphanTriggerHost)).rejects.toThrow(
      '[bipPopoverTrigger] debe usarse dentro de <bip-popover>'
    );
  });
});
