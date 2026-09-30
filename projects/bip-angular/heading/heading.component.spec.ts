import { Component } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { BipHeading, type BipHeadingLevel } from './heading.component';

@Component({
  imports: [BipHeading],
  template: `<h2 bipHeading data-testid="host">Título</h2>`,
})
class NativeH2Host {}

@Component({
  imports: [BipHeading],
  template: `<div bipHeading data-testid="host" [level]="level">Título</div>`,
})
class AsOverrideHost {
  level: BipHeadingLevel = 3;
}

describe('BipHeading', () => {
  it('infiere el nivel del tag nativo (h2 → aria-level implícito, sin role redundante)', async () => {
    await render(NativeH2Host);
    const host = screen.getByTestId('host');
    expect(host.tagName).toBe('H2');
    expect(host).not.toHaveAttribute('role');
    expect(host).not.toHaveAttribute('aria-level');
  });

  it('aplica el tamaño por defecto correspondiente al nivel del tag (h2 → xl)', async () => {
    await render(NativeH2Host);
    expect(screen.getByTestId('host')).toHaveClass('bip-heading--size-xl');
  });

  it('cuando el host no es un tag de heading nativo, añade role="heading" y aria-level', async () => {
    await render(AsOverrideHost);
    const host = screen.getByTestId('host');
    expect(host).toHaveAttribute('role', 'heading');
    expect(host).toHaveAttribute('aria-level', '3');
  });

  it('el tamaño por defecto sigue el level explícito cuando se override el tag', async () => {
    await render(AsOverrideHost, { componentProperties: { level: 1 } });
    expect(screen.getByTestId('host')).toHaveClass('bip-heading--size-2xl');
  });
});
