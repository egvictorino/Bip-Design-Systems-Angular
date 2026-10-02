import { test, expect } from '@playwright/test';

/**
 * Regresión visual del sistema de temas — ver CLAUDE.md § Bloque 11. Baselines commiteadas
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
    // Cada swatch resuelve su valor vía getComputedStyle() en su propio efecto — con tantas
    // instancias montando/actualizando por separado, el layout tarda más de los 5s por
    // defecto en asentarse del todo (crece de forma acumulativa, no es un elemento puntual).
    // Se sube el timeout del detector de estabilidad de Playwright en vez de adivinar el
    // punto exacto del reflow.
    await expect(page).toHaveScreenshot('foundations-colors.png', { fullPage: true, timeout: 15_000 });
  });

  test('Foundations/Radius — square y rounded en paralelo', async ({ page }) => {
    await page.goto('/iframe.html?id=foundations-radius--overview&viewMode=story');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('foundations-radius.png', { fullPage: true });
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
  // CLAUDE.md § Bloque 11), queda cubierta por theme-provider.spec.ts (Vitest).
});
