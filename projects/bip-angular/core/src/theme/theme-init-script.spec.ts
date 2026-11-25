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

  /**
   * Regresión de seguridad: JSON.stringify no escapa `</` — un storageKey con
   * `</script><script>...` cerraría el bloque <script> inline y permitiría inyectar
   * markup/script arbitrario en el <head>. Ver toInlineJs() en theme-init-script.ts.
   */
  it('escapa </script> dentro de storageKey para no poder escapar del <script> inline', () => {
    const payload = '</script><script>window.pwned=true</script>';
    const script = getThemeInitScript({ storageKey: payload });
    expect(script).not.toContain('</script>');
    expect(script).not.toContain(payload);
    // El valor sigue siendo recuperable: JSON.parse revierte las secuencias \uXXXX.
    expect(() => {
      const match = script.match(/localStorage\.getItem\((".*?")\)/);
      expect(JSON.parse(match![1])).toBe(payload);
    }).not.toThrow();
  });

  it('escapa U+2028/U+2029 (los trata JS como fin de statement fuera de un string)', () => {
    const lineSeparator = String.fromCharCode(8232); // U+2028
    const paragraphSeparator = String.fromCharCode(8233); // U+2029
    const script = getThemeInitScript({ storageKey: `a${lineSeparator}b${paragraphSeparator}c` });
    expect(script).not.toContain(lineSeparator);
    expect(script).not.toContain(paragraphSeparator);
  });

  it('ignora un defaultTheme/defaultColorScheme fuera del allowlist y cae al default seguro', () => {
    const script = getThemeInitScript({
      // @ts-expect-error — se simula un valor fuera de los literales tipados.
      defaultTheme: '"><script>alert(1)</script>',
      // @ts-expect-error — idem.
      defaultColorScheme: 'not-a-real-scheme',
    });
    expect(script).toContain('"square"');
    expect(script).toContain('"light"');
    expect(script).not.toContain('<script>alert');
  });

  it('al leer de localStorage, descarta un theme/colorScheme guardado que no esté en el allowlist', () => {
    const script = getThemeInitScript({ storageKey: 'bip-theme' });
    // El valor leído solo se acepta si está en la lista fija de literales válidos — no hay
    // forma de que termine en data-theme/data-color-scheme sin pasar por ese filtro.
    expect(script).toMatch(/\[\s*"square"\s*,\s*"rounded"\s*\]\.indexOf\(saved\.theme\)/);
    expect(script).toMatch(
      /\[\s*"light"\s*,\s*"dark"\s*,\s*"system"\s*\]\.indexOf\(saved\.colorScheme\)/
    );
  });
});
