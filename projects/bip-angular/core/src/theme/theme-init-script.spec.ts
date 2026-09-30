import { describe, expect, it } from 'vitest';
import { getThemeInitScript } from './theme-init-script';

/** Puerto directo de la sección `getThemeInitScript` de ThemeProvider.test.tsx (React). */
describe('getThemeInitScript', () => {
  it('incluye los defaults y, sin storageKey, no referencia localStorage', () => {
    const script = getThemeInitScript({ defaultTheme: 'rounded', defaultColorScheme: 'dark' });
    expect(script).toContain(`d.setAttribute('data-theme',t)`);
    expect(script).toContain('"rounded"');
    expect(script).toContain('"dark"');
    expect(script).not.toContain('localStorage');
  });

  it('con storageKey, lee localStorage antes de estampar los atributos', () => {
    const script = getThemeInitScript({ storageKey: 'bip-theme' });
    expect(script).toContain('localStorage.getItem("bip-theme")');
  });

  it('resuelve system a light/dark vía matchMedia, nunca lo deja en el atributo', () => {
    const script = getThemeInitScript({ defaultColorScheme: 'system' });
    expect(script).toContain("if(c==='system')");
    expect(script).toContain('matchMedia');
  });

  it('es ejecutable como IIFE sin lanzar (smoke test)', () => {
    const script = getThemeInitScript({ storageKey: 'bip-theme-exec' });
    expect(() => {
      new Function(script)();
    }).not.toThrow();
    expect(document.documentElement).toHaveAttribute('data-theme');
    expect(document.documentElement).toHaveAttribute('data-color-scheme');
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-color-scheme');
  });

  it('usa los defaults square/light cuando no se pasan opciones', () => {
    const script = getThemeInitScript();
    expect(script).toContain('"square"');
    expect(script).toContain('"light"');
  });

  it('el try/catch envuelve todo el cuerpo — nunca lanza aunque JSON.parse falle', () => {
    const script = getThemeInitScript({ storageKey: 'bip-theme' });
    expect(script.startsWith('(function(){try{')).toBe(true);
    expect(script.endsWith('}catch(e){}})();')).toBe(true);
  });
});
