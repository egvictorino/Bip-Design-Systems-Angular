import { test, expect } from '@playwright/test';

/**
 * Regresión visual del sistema de temas — ver docs/plan-maestro.md § Bloque 11. Baselines commiteadas
 * en `visual/theme-matrix.spec.ts-snapshots/`. Para actualizar tras un cambio deliberado de
 * tokens.css/BipThemeProvider:
 *   pnpm test:visual:docker -- --update-snapshots
 */
test.describe('theme matrix', () => {
  test('square/rounded × light/dark — las 4 combinaciones en un solo grid', async ({ page }) => {
    // `colorScheme` no se hereda entre `<bip-theme-provider>` anidados (solo density/dir lo
    // hacen, ver theme-base.ts) — por eso esta story (ColorSchemesMatrix) fija `theme` y
    // `colorScheme` explícitos en cada una de las 4 celdas, en vez de confiar en el global
    // `colorScheme` del toolbar (que SideBySide, con sus providers anidados sin ese input,
    // ignora por completo).
    await page.goto('/iframe.html?id=foundations-theming--color-schemes-matrix&viewMode=story');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('color-schemes-matrix.png', { fullPage: true });
  });

  test('marca personalizada (brand=canary) — recolorea Button/Badge/Tabs/Alert/Modal vía tokens', async ({
    page,
  }) => {
    await page.goto(
      '/iframe.html?id=foundations-theming--side-by-side&viewMode=story&globals=brand:canary'
    );
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('custom-brand.png', { fullPage: true });
  });

  test('Foundations/Colors — semillas y derivados resueltos, light y dark en paralelo', async ({
    page,
  }) => {
    await page.goto('/iframe.html?id=foundations-colors--overview&viewMode=story');
    await page.waitForLoadState('networkidle');
    // Cada swatch resuelve su valor vía getComputedStyle() en su propio efecto — con ~128
    // instancias montando/actualizando por separado, el contenido deja de crecer a los pocos
    // segundos (`document.body.scrollHeight` es estable tanto en local como en Docker a este
    // punto). Lo que NO se estabiliza con ningún timeout es el propio `fullPage: true` de
    // Playwright: en Docker, su mecanismo interno de redimensionar/recortar el viewport para
    // una captura de página completa oscila entre dos alturas exactas de forma indefinida
    // (visto en corridas reales: 6115px ↔ 6232px, nunca converge, ni a los 30s) — un patrón
    // de ping-pong consistente con el propio `fullPage` reajustando el viewport entre pasadas
    // de una forma que a su vez cambia cuántos swatches entran por fila (flex-wrap). Se evita
    // ese mecanismo: se fija el viewport al alto real del contenido (ya estable) y se
    // screenshotea ese viewport tal cual, sin `fullPage`.
    const contentHeight = await page.evaluate(() => document.body.scrollHeight);
    await page.setViewportSize({ width: 1280, height: contentHeight });
    await expect(page).toHaveScreenshot('foundations-colors.png', { timeout: 15_000 });
  });

  test('Foundations/Radius — square y rounded en paralelo', async ({ page }) => {
    await page.goto('/iframe.html?id=foundations-radius--overview&viewMode=story');
    await page.waitForLoadState('networkidle');
    // Mismo mecanismo de oscilación de `fullPage: true` que Foundations/Colors (ver ese test)
    // — acá de menor magnitud (1px), pero con la misma firma: viewport fijado al alto real en
    // vez de dejar que `fullPage` lo recalcule internamente en cada intento.
    const contentHeight = await page.evaluate(() => document.body.scrollHeight);
    await page.setViewportSize({ width: 1280, height: contentHeight });
    await expect(page).toHaveScreenshot('foundations-radius.png');
  });

  test('PortalTheming — Modal vía BipOverlay/TemplatePortal hereda el tema del provider (no el de <html>)', async ({
    page,
  }) => {
    await page.goto('/iframe.html?id=foundations-theming--portal-theming&viewMode=story');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Abrir overlay (rounded)' }).click();
    await expect(page.getByText('theme="rounded"')).toBeVisible();
    await expect(page).toHaveScreenshot('portal-theming.png', { fullPage: true });
  });

  test("SystemColorScheme — colorScheme='system' resuelve a light/dark sin estampar 'system'", async ({
    page,
  }) => {
    await page.goto('/iframe.html?id=foundations-theming--system-color-scheme&viewMode=story');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('system-color-scheme.png', { fullPage: true });
  });

  test('RTL — SideBySide con dir=rtl: flex/propiedades lógicas se espejan sin cambiar el markup', async ({
    page,
  }) => {
    await page.goto(
      '/iframe.html?id=foundations-theming--side-by-side&viewMode=story&globals=dir:rtl'
    );
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('rtl-side-by-side.png', { fullPage: true });
  });

  // UncontrolledWithPersistence depende de localStorage — no se screenshotea (ver
  // docs/plan-maestro.md § Bloque 11), queda cubierta por theme-provider.spec.ts (Vitest).
});
