import { defineConfig, devices } from '@playwright/test';

/**
 * Regresión visual del sistema de temas — separado de `test` (Vitest) porque necesita un
 * navegador real renderizando Storybook, no happy-dom. Nunca se corre nativo: solo vía
 * `pnpm test:visual:docker` (ver scripts/visual-docker.sh) — las baselines son Linux-only
 * (`-chromium-linux.png`, el `snapshotPathTemplate` por defecto de Playwright), así que una
 * corrida nativa en macOS/Windows falla con "snapshot missing" en vez de crear un set nuevo.
 */
export default defineConfig({
  testDir: './visual',
  timeout: 30_000,
  // Reintenta una vez en CI antes de reportar fallo — absorbe el flake ocasional de
  // fuentes/fonts todavía cargando en el primer paint sin esconder una regresión real
  // (maxDiffPixelRatio ya filtra el ruido de sub-píxel; esto es para timing, no píxeles).
  retries: process.env.CI ? 1 : 0,
  forbidOnly: !!process.env.CI,
  reporter: [['list'], ['html', { open: 'never' }]],
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.02 },
  },
  webServer: {
    // Storybook ESTÁTICO + http-server, no `storybook dev`: compilar Angular en modo dev
    // bajo emulación linux/amd64 (ver visual-docker.sh --platform) es lento y menos
    // determinista que servir un build ya hecho; HMR no aporta nada a un test de screenshot.
    command: 'pnpm build-storybook --quiet && pnpm exec http-server storybook-static -p 6006 -s',
    url: 'http://localhost:6006',
    reuseExistingServer: !process.env.CI,
    timeout: 600_000,
  },
  use: {
    baseURL: 'http://localhost:6006',
  },
  // El viewport vive aquí (no en el `use` de arriba) porque `...devices['Desktop Chrome']`
  // trae su propio viewport (1280×720) y un `use.viewport` a nivel de config pierde contra
  // el `use` del project — quedaba declarado pero sin efecto. Se fija explícito para que
  // sea el valor real, no un accidente de precedencia.
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 720 } },
    },
  ],
});
