import { render, screen } from '@testing-library/angular';
import { afterEach, describe, expect, it } from 'vitest';
import { BipTheme } from './theme.directive';

/**
 * `[bipTheme]` comparte toda su lógica con `<bip-theme-provider>` (ambos extienden
 * BipThemeHost — ver theme-base.ts); estos tests cubren solo que la directiva aplica los
 * mismos atributos/vars sobre un elemento existente en vez de envolverlo en uno nuevo. El
 * resto de casos (tokens/radius/density/dir/nesting/controls) ya están cubiertos a fondo en
 * theme-provider.spec.ts.
 */
describe('BipTheme ([bipTheme])', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-color-scheme');
  });

  it('stamps data-theme/data-color-scheme directly on the host element (no wrapper)', async () => {
    await render(
      `<section bipTheme theme="rounded" colorScheme="dark" data-testid="section">contenido</section>`,
      { imports: [BipTheme] }
    );
    const section = screen.getByTestId('section');
    expect(section.tagName).toBe('SECTION');
    expect(section).toHaveAttribute('data-theme', 'rounded');
    expect(section).toHaveAttribute('data-color-scheme', 'dark');
  });

  it('applies tokens overrides as inline CSS vars on the same host element', async () => {
    await render(
      `<div bipTheme theme="square" [tokens]="tokens" data-testid="el">contenido</div>`,
      { imports: [BipTheme], componentProperties: { tokens: { colorPrimary: '#e2007a' } } }
    );
    const el = screen.getByTestId('el') as HTMLElement;
    expect(el.style.getPropertyValue('--color-primary')).toBe('#e2007a');
  });

  it('does not stamp data-density/dir when not set', async () => {
    await render(`<div bipTheme theme="square" data-testid="el">contenido</div>`, {
      imports: [BipTheme],
    });
    const el = screen.getByTestId('el');
    expect(el).not.toHaveAttribute('data-density');
    expect(el).not.toHaveAttribute('dir');
  });
});
