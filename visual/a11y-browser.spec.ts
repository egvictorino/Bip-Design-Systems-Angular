import type { Page } from '@playwright/test';
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { COMPONENT_MATRIX } from './component-matrix';
import { A11Y_STATES } from './a11y-states';

/**
 * El addon-a11y de Storybook (preview.ts, `manual: true`) inyecta su propia copia de
 * axe-core en cada iframe para su panel bajo demanda, aunque no la corra sola — axe-core
 * guarda estado global en `window.axe` y rechaza un segundo `run()` mientras uno sigue "en
 * vuelo" ("Axe is already running"). Borrar `window.axe` antes de analizar (para que
 * `@axe-core/playwright` inyecte su propia copia limpia) elimina la gran mayoría de los
 * casos, pero no todos: si el addon re-inyecta la suya entre el borrado y el `analyze()`
 * (una carrera de timing, no determinista — confirmado en Docker: ~8 de 100 corridas),
 * sigue chocando. Un reintento acotado a ESTE mensaje de error específico (nunca a una
 * violación real, que falla por `expect().toEqual([])`, no por una excepción de
 * `analyze()`) hace la suite robusta sin esconder un hallazgo real de a11y.
 */
const AXE_ALREADY_RUNNING = 'Axe is already running';

async function analyzeWithoutAddonAxe(page: Page, disableRules: string[] = [], attempts = 3) {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    await page.evaluate(() => {
      try {
        delete (window as unknown as { axe?: unknown }).axe;
      } catch {
        /* noop */
      }
    });
    try {
      // Los paneles (calendario, dropdown, select…) viven en el overlay del CDK, fuera de
      // `#storybook-root`: sin incluirlo, axe nunca los vería.
      return await new AxeBuilder({ page })
        .include('#storybook-root')
        .include('.cdk-overlay-container')
        .disableRules(disableRules)
        .analyze();
    } catch (error) {
      const isAddonRace = error instanceof Error && error.message.includes(AXE_ALREADY_RUNNING);
      if (!isAddonRace || attempt === attempts) throw error;
    }
  }
  throw new Error('unreachable');
}

/**
 * `testing/a11y.spec.ts` (Vitest + jsdom + vitest-axe) corre con `color-contrast`
 * deshabilitado — `getComputedStyle()` no resuelve `color-mix()`/custom properties con
 * fidelidad de navegador real ahí. Esta suite es lo que cierra ese hueco: mismo motor
 * axe-core, pero en un Chromium real vía `@axe-core/playwright`, con la config de reglas
 * POR DEFECTO — es decir, `color-contrast` SÍ activado. Es la única verificación de este
 * repo que evalúa el contraste tal como se renderiza de verdad, incluidos los tokens
 * derivados con `color-mix()` que ni `testing/contrast-tokens.spec.ts` (solo hex literales)
 * ni el resto de la suite de a11y pueden evaluar.
 *
 * Reusa `COMPONENT_MATRIX` (la fuente única también de `component-matrix.spec.ts`) en vez de
 * mantener una segunda lista de componentes que se puede desincronizar de la primera.
 * Corre en ambos esquemas de color — no solo light — porque los tokens derivados cambian
 * de fórmula (aclaran hacia white en dark en vez de oscurecer hacia black) y es donde más
 * probable es que un contraste marginal falle.
 */
const FROZEN_TIME = new Date('2026-01-15T09:00:00');

test.describe('a11y — axe en navegador real, color-contrast activado', () => {
  for (const { dir, storyId, shot = dir } of COMPONENT_MATRIX) {
    for (const colorScheme of ['light', 'dark'] as const) {
      test(`${shot} — ${colorScheme}`, async ({ page }) => {
        if (dir === 'calendar') await page.clock.setFixedTime(FROZEN_TIME);
        await page.goto(
          `/iframe.html?id=${storyId}&viewMode=story&globals=colorScheme:${colorScheme}`
        );
        await page.waitForLoadState('networkidle');

        const results = await analyzeWithoutAddonAxe(page);

        expect(
          results.violations,
          results.violations
            .map((v) => `[${v.id}] ${v.help} (${v.nodes.length} nodo(s))\n${v.helpUrl}`)
            .join('\n\n')
        ).toEqual([]);
      });
    }
  }
});

/**
 * Estados además de la story canónica (hover, paneles abiertos, selected…): ver
 * `a11y-states.ts`. Aquí es donde `--color-primary` usado como texto se ve de verdad.
 */
test.describe('a11y — estados interactivos, color-contrast activado', () => {
  for (const { name, storyId, frozenTime, setup, disableRules } of A11Y_STATES) {
    for (const colorScheme of ['light', 'dark'] as const) {
      test(`${name} — ${colorScheme}`, async ({ page }) => {
        if (frozenTime) await page.clock.setFixedTime(FROZEN_TIME);
        await page.goto(
          `/iframe.html?id=${storyId}&viewMode=story&globals=colorScheme:${colorScheme}`
        );
        await page.waitForLoadState('networkidle');
        await setup?.(page);

        const results = await analyzeWithoutAddonAxe(page, disableRules);

        expect(
          results.violations,
          results.violations
            .map((v) => `[${v.id}] ${v.help} (${v.nodes.length} nodo(s))\n${v.helpUrl}`)
            .join('\n\n')
        ).toEqual([]);
      });
    }
  }
});
