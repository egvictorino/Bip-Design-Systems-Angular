import { fireEvent, render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { BipAvatar } from './avatar.component';

describe('BipAvatar', () => {
  it('sin src ni name, muestra el ícono genérico con role="img" y aria-label fallback', async () => {
    await render(BipAvatar);
    const img = screen.getByRole('img', { name: 'Avatar' });
    expect(img).toBeInTheDocument();
  });

  it('con name y sin src, muestra las iniciales', async () => {
    await render(BipAvatar, { componentInputs: { name: 'Eduardo Gonzalez' } });
    expect(screen.getByText('EG')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Eduardo Gonzalez' })).toBeInTheDocument();
  });

  it('con un solo nombre, usa solo la primera inicial', async () => {
    await render(BipAvatar, { componentInputs: { name: 'Eduardo' } });
    expect(screen.getByText('E')).toBeInTheDocument();
  });

  it('con src, renderiza una <img> con el alt correspondiente', async () => {
    const { container } = await render(BipAvatar, {
      componentInputs: { src: 'https://example.com/a.png', name: 'Eduardo Gonzalez' },
    });
    const img = container.querySelector('img');
    expect(img).toHaveAttribute('src', 'https://example.com/a.png');
    expect(img).toHaveAttribute('alt', 'Eduardo Gonzalez');
  });

  it('cae a iniciales cuando la imagen falla al cargar', async () => {
    const { container } = await render(BipAvatar, {
      componentInputs: { src: 'https://example.com/broken.png', name: 'Eduardo Gonzalez' },
    });
    fireEvent.error(container.querySelector('img')!);
    expect(await screen.findByText('EG')).toBeInTheDocument();
  });

  it('alt explícito tiene prioridad sobre name', async () => {
    await render(BipAvatar, {
      componentInputs: { name: 'Eduardo Gonzalez', alt: 'Foto de perfil' },
    });
    expect(screen.getByRole('img', { name: 'Foto de perfil' })).toBeInTheDocument();
  });

  it('status renderiza un badge decorativo aria-hidden', async () => {
    const { container } = await render(BipAvatar, { componentInputs: { status: 'online' } });
    const statusEl = container.querySelector('.bip-avatar-status');
    expect(statusEl).toBeInTheDocument();
    expect(statusEl).toHaveAttribute('aria-hidden', 'true');
    expect(statusEl).toHaveClass('bip-avatar-status--online');
  });

  it('aplica la clase de tamaño por defecto (md) en el host', async () => {
    const { container } = await render(BipAvatar);
    expect(container).toHaveClass('bip-avatar--md');
  });
});
