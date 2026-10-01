import { Component } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { BipButton } from './button.component';

@Component({
  imports: [BipButton],
  template: `
    <button
      bipButton
      [variant]="variant"
      [size]="size"
      [loading]="loading"
      [fullWidth]="fullWidth"
      [disabled]="disabled"
      (click)="onClick()"
    >
      {{ label }}
    </button>
  `,
})
class HostComponent {
  variant: 'primary' | 'secondary' | 'bare' | 'soul' | 'danger' = 'primary';
  size: 'sm' | 'md' | 'lg' = 'md';
  loading = false;
  fullWidth = false;
  disabled = false;
  label = 'Guardar';
  onClick = vi.fn();
}

@Component({
  imports: [BipButton],
  template: `<a bipButton href="/foo" [disabled]="disabled" (click)="onClick()">Ir</a>`,
})
class AnchorHostComponent {
  disabled = false;
  onClick = vi.fn();
}

describe('BipButton', () => {
  it('renderiza el texto proyectado', async () => {
    await render(HostComponent);
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();
  });

  it('tiene type="button" por defecto', async () => {
    await render(HostComponent);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it.each(['primary', 'secondary', 'bare', 'soul', 'danger'] as const)(
    'aplica la clase de la variante %s',
    async (variant) => {
      await render(HostComponent, { componentProperties: { variant } });
      expect(screen.getByRole('button')).toHaveClass(`bip-button--${variant}`);
    }
  );

  it.each(['sm', 'md', 'lg'] as const)('aplica la clase de tamaño %s', async (size) => {
    await render(HostComponent, { componentProperties: { size } });
    expect(screen.getByRole('button')).toHaveClass(`bip-button--${size}`);
  });

  it('no llama onClick cuando disabled', async () => {
    const { fixture } = await render(HostComponent, { componentProperties: { disabled: true } });
    const user = userEvent.setup();
    await user.click(screen.getByRole('button'));
    expect(fixture.componentInstance.onClick).not.toHaveBeenCalled();
  });

  it('llama onClick con Enter', async () => {
    const { fixture } = await render(HostComponent);
    const user = userEvent.setup();
    screen.getByRole('button').focus();
    await user.keyboard('{Enter}');
    expect(fixture.componentInstance.onClick).toHaveBeenCalledOnce();
  });

  it('llama onClick con Espacio', async () => {
    const { fixture } = await render(HostComponent);
    const user = userEvent.setup();
    screen.getByRole('button').focus();
    await user.keyboard(' ');
    expect(fixture.componentInstance.onClick).toHaveBeenCalledOnce();
  });

  it('llama onClick al hacer click', async () => {
    const { fixture } = await render(HostComponent);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button'));
    expect(fixture.componentInstance.onClick).toHaveBeenCalledOnce();
  });

  it('loading=true renderiza un spinner SVG', async () => {
    await render(HostComponent, { componentProperties: { loading: true } });
    expect(screen.getByRole('button').querySelector('svg')).toBeInTheDocument();
  });

  it('loading=true mantiene el texto visible', async () => {
    await render(HostComponent, { componentProperties: { loading: true } });
    expect(screen.getByRole('button')).toHaveTextContent('Guardar');
  });

  it('loading=true deshabilita el botón', async () => {
    await render(HostComponent, { componentProperties: { loading: true } });
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('loading=true no llama onClick', async () => {
    const { fixture } = await render(HostComponent, { componentProperties: { loading: true } });
    const user = userEvent.setup();
    await user.click(screen.getByRole('button'));
    expect(fixture.componentInstance.onClick).not.toHaveBeenCalled();
  });

  it('loading=true setea aria-busy="true"', async () => {
    await render(HostComponent, { componentProperties: { loading: true } });
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
  });

  it('loading=false (default) no setea aria-busy', async () => {
    await render(HostComponent);
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-busy');
  });

  it('fullWidth=true aplica la clase full-width', async () => {
    await render(HostComponent, { componentProperties: { fullWidth: true } });
    expect(screen.getByRole('button')).toHaveClass('bip-button--full-width');
  });

  it('fullWidth=false (default) no aplica la clase full-width', async () => {
    await render(HostComponent);
    expect(screen.getByRole('button')).not.toHaveClass('bip-button--full-width');
  });

  // ── Selector de atributo sobre <a> ─────────────────────────────────────────

  it('funciona como selector de atributo sobre <a>', async () => {
    await render(AnchorHostComponent);
    expect(screen.getByRole('link', { name: 'Ir' })).toBeInTheDocument();
  });

  it('en <a> disabled emula el estado con aria-disabled y tabindex=-1', async () => {
    await render(AnchorHostComponent, { componentProperties: { disabled: true } });
    const link = screen.getByRole('link', { name: 'Ir' });
    expect(link).toHaveAttribute('aria-disabled', 'true');
    expect(link).toHaveAttribute('tabindex', '-1');
  });

  it('en <a> disabled previene la navegación (preventDefault)', async () => {
    await render(AnchorHostComponent, { componentProperties: { disabled: true } });
    const link = screen.getByRole('link', { name: 'Ir' }) as HTMLAnchorElement;
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    link.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });
});
