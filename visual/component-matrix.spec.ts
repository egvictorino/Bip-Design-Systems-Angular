import { readdirSync, statSync } from 'fs';
import { resolve } from 'path';
import { test, expect } from '@playwright/test';
import { COMPONENT_MATRIX, SKIP_LIST } from './component-matrix';

// El root del repo no declara "type": "module" (ver package.json) — Playwright transpila
// y corre los *.spec.ts como CommonJS, donde __dirname existe de forma nativa.

/**
 * Pin de fecha para la story de Calendar: `components-calendar--month-view` renderiza con
 * `date: new Date()` (la fecha real al momento del render), así que la cuadrícula (qué
 * celda es "hoy", qué eventos del fixture caen en el mes visible) deriva un poco cada día y
 * eventualmente diverge contra una baseline capturada en una fecha anterior.
 * `page.clock.setFixedTime()` fija `Date.now()`/`new Date()` a un instante fijo sin tocar
 * los timers reales, así que `animations: 'disabled'` (que necesita timers reales para
 * avanzar) sigue funcionando con normalidad.
 */
const FROZEN_TIME = new Date('2026-01-15T09:00:00');

/**
 * Un screenshot canónico por componente — acotado a `#storybook-root` (no `fullPage`, como
 * `theme-matrix.spec.ts`) para que el archivo sea chico y el diff sea del componente, no del
 * canvas completo. `animations: 'disabled'` porque casi todo componente tiene una transición
 * en `--duration-*` (ver primitives.css) y sin esto los shots son inestables entre corridas.
 */
test.describe('component matrix — un screenshot por componente (LTR + subset RTL)', () => {
  for (const { dir, storyId, rtl } of COMPONENT_MATRIX) {
    test(`${dir} — LTR`, async ({ page }) => {
      if (dir === 'calendar') await page.clock.setFixedTime(FROZEN_TIME);
      await page.goto(`/iframe.html?id=${storyId}&viewMode=story`);
      await page.waitForLoadState('networkidle');
      await expect(page.locator('#storybook-root')).toHaveScreenshot(`${dir}.png`, {
        animations: 'disabled',
      });
    });

    if (rtl) {
      test(`${dir} — RTL`, async ({ page }) => {
        if (dir === 'calendar') await page.clock.setFixedTime(FROZEN_TIME);
        await page.goto(`/iframe.html?id=${storyId}&viewMode=story&globals=dir:rtl`);
        await page.waitForLoadState('networkidle');
        await expect(page.locator('#storybook-root')).toHaveScreenshot(`${dir}-rtl.png`, {
          animations: 'disabled',
        });
      });
    }
  }
});

/**
 * Guard de cobertura — mismo patrón que el de `testing/a11y.spec.ts` (recorrer directorios
 * y exigir que cada uno tenga entrada), pero como `test()` de Playwright: Vitest no sirve
 * acá porque esta carpeta queda fuera de `angular.json`/`tsconfig.spec.json` a propósito
 * (Playwright y Vitest no pueden convivir en la misma pasada de test runner).
 */
test('cobertura: todo secondary entry de projects/bip-angular/ tiene entrada en COMPONENT_MATRIX o SKIP_LIST', () => {
  const srcDir = resolve(__dirname, '../projects/bip-angular');
  const dirs = readdirSync(srcDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => {
      try {
        return statSync(resolve(srcDir, name, 'ng-package.json')).isFile();
      } catch {
        return false;
      }
    });

  const covered = new Set([...COMPONENT_MATRIX.map((e) => e.dir), ...SKIP_LIST]);
  const missing = dirs.filter((dir) => !covered.has(dir));

  expect(missing, `Componentes sin cobertura visual: ${missing.join(', ')}`).toEqual([]);
});
