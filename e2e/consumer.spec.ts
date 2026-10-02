import { test, expect } from '@playwright/test';

/**
 * Smoke test del tarball publicado — ver scripts/e2e-consumer.sh. No se calcula ningún valor
 * "a mano" que debiera venir de un token: el hex de --color-primary y los px de
 * --radius-field se toman literal de styles/tokens.css / styles/themes.css, igual que haría
 * cualquiera verificando el resultado visual contra el token fuente.
 */
test.describe('paquete publicado — smoke test del tarball', () => {
  test('SSR: el servidor renderiza el HTML completo, con el eje theme ya resuelto', async ({
    request,
  }) => {
    const response = await request.get('/');
    expect(response.status()).toBe(200);

    const html = await response.text();
    // Los botones ya están en el HTML servido por Express — no son contenido que aparece
    // recién tras la hidratación en el navegador.
    expect(html).toContain('data-testid="button-square"');
    expect(html).toContain('data-testid="button-rounded"');
    // El provider rounded+dark estampa sus propios atributos de host durante el render en
    // servidor — prueba que BipThemeContext/BipThemeHost no tocan window/document fuera de
    // los guards de SSR (si lo hicieran, platform-server lanzaría y esta request devolvería
    // un 500, no HTML).
    expect(html).toMatch(
      /<bip-theme-provider[^>]*data-theme="rounded"[^>]*data-color-scheme="dark"/
    );
  });

  test('hidratación sin errores de consola ni de página', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/');
    await expect(page.getByTestId('button-square')).toBeVisible();

    // Ningún "require is not defined" / error de resolución de módulo — confirma que el
    // paquete ESM-only (sin condición "require" en `exports`, ver package.json) resolvió
    // limpio a través del build de Angular, no solo que "algo" se renderizó.
    expect(errors).toEqual([]);
  });

  test('bip.css se aplicó de verdad: color de marca real, no el default del navegador', async ({
    page,
  }) => {
    await page.goto('/');
    const squareButton = page.getByTestId('button-square');
    const bg = await squareButton.evaluate((el) => getComputedStyle(el).backgroundColor);
    // --color-primary (light, square) en styles/tokens.css: #2939cc.
    expect(bg).toBe('rgb(41, 57, 204)');
  });

  test('el eje theme sobrevive el empaquetado: --radius-field distinto entre square y rounded', async ({
    page,
  }) => {
    await page.goto('/');
    const squareButton = page.getByTestId('button-square');
    const roundedButton = page.getByTestId('button-rounded');

    // --radius-field en styles/themes.css: 1px (square) vs var(--radius-lg) = 8px (rounded).
    const squareRadius = await squareButton.evaluate((el) => getComputedStyle(el).borderRadius);
    const roundedRadius = await roundedButton.evaluate((el) => getComputedStyle(el).borderRadius);
    expect(squareRadius).toBe('1px');
    expect(roundedRadius).toBe('8px');
  });

  test('un overlay (BipOverlay) hereda el tema/esquema del provider más cercano, no el de <html>', async ({
    page,
  }) => {
    await page.goto('/');
    // <html> queda en square/light (ver el script anti-FOUC de index.html) — el modal vive
    // dentro de un <bip-theme-provider theme="rounded" colorScheme="dark">, así que su pane
    // (fuera del árbol DOM del provider, en cdk-overlay-container) solo puede heredar ese
    // tema si BipOverlay lo está estampando de verdad, no si solo heredara CSS por posición
    // en el DOM.
    await page.getByTestId('open-modal').click();
    const pane = page.locator('.cdk-overlay-pane');
    await expect(pane).toHaveAttribute('data-theme', 'rounded');
    await expect(pane).toHaveAttribute('data-color-scheme', 'dark');
    await expect(page.getByTestId('modal-content')).toBeVisible();

    const modalBg = await page
      .locator('.bip-modal-dialog')
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    const htmlBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(modalBg).not.toBe(htmlBg);
  });
});
