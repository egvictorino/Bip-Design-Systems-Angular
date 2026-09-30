import { describe, expect, it, vi } from 'vitest';
import { resolveTokenVars, resolveVarMap, RADIUS_VAR_MAP } from './var-maps';

/**
 * Puerto de los casos "tokens prop" de ThemeProvider.test.tsx (React) que no dependen de
 * renderizar un componente — resolveTokenVars/resolveVarMap son funciones puras, se prueban
 * directamente. Los casos que sí necesitan un `<bip-theme-provider>` renderizado (inline
 * style en el host, anidación, density/dir) están en theme-provider.spec.ts.
 */
describe('resolveTokenVars', () => {
  it('merges base -> scoped -> cssVars', () => {
    const vars = resolveTokenVars(
      { colorPrimary: '#111', dark: { colorPrimary: '#222' } },
      'dark',
      { '--color-danger': '#333' }
    );
    expect(vars).toEqual({
      '--color-primary': '#222',
      '--color-txt-on-primary': '#ffffff',
      '--color-danger': '#333',
    });
  });

  it('overriding a fill seed also derives --color-txt-on-* via pickReadableText', () => {
    const vars = resolveTokenVars({ colorWarning: '#eab308' }, 'light', undefined);
    expect(vars['--color-warning']).toBe('#eab308');
    expect(vars['--color-txt-on-warning']).toBe('#191919');
  });

  it('an explicit cssVars override for --color-txt-on-* wins over the computed value', () => {
    const vars = resolveTokenVars({ colorPrimary: '#eab308' }, 'light', {
      '--color-txt-on-primary': '#ff00ff',
    });
    expect(vars['--color-txt-on-primary']).toBe('#ff00ff');
  });

  it('warns in dev when a fill seed override fails WCAG AA contrast', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    // Gris medio: ni blanco ni el oscuro del sistema alcanzan 4.5:1 AA.
    resolveTokenVars({ colorPrimary: '#7c7c7c' }, 'light', undefined, true);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('colorPrimary'));
    warnSpy.mockRestore();
  });

  it('does not warn for a fill seed that already passes WCAG AA', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    resolveTokenVars({ colorPrimary: '#050505' }, 'light', undefined, true);
    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('never warns when devMode=false (default), even on a failing contrast override', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    resolveTokenVars({ colorSuccess: '#9c9c9c' }, 'light', undefined);
    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('fontFamily maps to --font-sans', () => {
    const vars = resolveTokenVars({ fontFamily: 'Poppins, sans-serif' }, 'light', undefined);
    expect(vars['--font-sans']).toBe('Poppins, sans-serif');
  });

  it('returns {} without tokens nor cssVars', () => {
    expect(resolveTokenVars(undefined, 'light', undefined)).toEqual({});
  });
});

describe('resolveVarMap', () => {
  it('applies each override key to its mapped CSS var, skipping undefined values', () => {
    const vars = resolveVarMap(
      { field: '12px', container: undefined, marker: '4px' },
      RADIUS_VAR_MAP
    );
    expect(vars).toEqual({ '--radius-field': '12px', '--radius-marker': '4px' });
  });

  it('returns {} without overrides', () => {
    expect(resolveVarMap(undefined, RADIUS_VAR_MAP)).toEqual({});
  });
});
