import { Component } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { BipLink } from './link.component';

@Component({
  imports: [BipLink],
  template: `
    <a bipLink href="/foo" [external]="external" [disabled]="disabled">Go</a>
  `,
})
class HostComponent {
  external = false;
  disabled = false;
}

describe('BipLink', () => {
  it('renderiza un <a> con href', async () => {
    await render(HostComponent);
    const link = screen.getByRole('link', { name: 'Go' });
    expect(link).toHaveAttribute('href', '/foo');
  });

  it('no setea aria-disabled cuando disabled=false', async () => {
    await render(HostComponent);
    expect(screen.getByRole('link', { name: 'Go' })).not.toHaveAttribute('aria-disabled');
  });

  it('setea aria-disabled y tabindex=-1 cuando disabled=true', async () => {
    await render(HostComponent, { componentProperties: { disabled: true } });
    const link = screen.getByRole('link', { name: 'Go' });
    expect(link).toHaveAttribute('aria-disabled', 'true');
    expect(link).toHaveAttribute('tabindex', '-1');
  });

  it('setea target=_blank y rel=noopener noreferrer cuando external=true', async () => {
    await render(HostComponent, { componentProperties: { external: true } });
    const link = screen.getByRole('link', { name: /Go/ });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('no setea target/rel cuando external=false', async () => {
    await render(HostComponent);
    const link = screen.getByRole('link', { name: 'Go' });
    expect(link).not.toHaveAttribute('target');
    expect(link).not.toHaveAttribute('rel');
  });

  it('añade el hint accesible de "abre en pestaña nueva" cuando external=true', async () => {
    await render(HostComponent, { componentProperties: { external: true } });
    expect(screen.getByText(/abre en una pestaña nueva/)).toBeInTheDocument();
  });

  it('no añade el hint cuando external=false', async () => {
    await render(HostComponent);
    expect(screen.queryByText(/abre en una pestaña nueva/)).not.toBeInTheDocument();
  });
});
