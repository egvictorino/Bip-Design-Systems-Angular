import { Component } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { BipAvatar } from './avatar.component';
import { BipAvatarGroup } from './avatar-group.component';

@Component({
  imports: [BipAvatar, BipAvatarGroup],
  template: `
    <bip-avatar-group [max]="max" size="lg">
      <bip-avatar name="Ana Pérez" />
      <bip-avatar name="Beto Ruiz" />
      <bip-avatar name="Cata Soto" />
      <bip-avatar name="Dani Vega" />
      <bip-avatar name="Eli Marín" />
      <bip-avatar name="Fer Lima" />
    </bip-avatar-group>
  `,
})
class HostComponent {
  max = 4;
}

describe('BipAvatarGroup', () => {
  it('tiene role="group"', async () => {
    await render(HostComponent);
    expect(screen.getByRole('group')).toBeInTheDocument();
  });

  it('muestra como máximo `max` avatares y oculta el resto', async () => {
    const { container } = await render(HostComponent);
    const visible = [...container.querySelectorAll('bip-avatar')].filter(
      (el) => (el as HTMLElement).style.display !== 'none'
    );
    expect(visible.length).toBe(4);
  });

  it('muestra el badge "+N" con el conteo de overflow', async () => {
    await render(HostComponent);
    expect(screen.getByText('+2')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: '2 más' })).toBeInTheDocument();
  });

  it('no muestra badge de overflow cuando todos caben en max', async () => {
    await render(HostComponent, { componentProperties: { max: 10 } });
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
  });

  it('el size del grupo se propaga a los <bip-avatar> hijos sin size explícito', async () => {
    const { container } = await render(HostComponent);
    const firstAvatar = container.querySelector('bip-avatar')!;
    expect(firstAvatar).toHaveClass('bip-avatar--lg');
  });
});
