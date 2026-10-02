import { defineConfig, devices } from '@playwright/test';

/**
 * Verifica el PAQUETE PUBLICADO, no el árbol de fuentes del workspace — scripts/
 * e2e-consumer.sh empaqueta @bip-design-systems/angular con `pnpm pack`, lo instala como un
 * tarball real (no un link de workspace) en e2e/consumer-app, construye esa app con SSR real
 * (`ng build`, builder @angular/build:application con outputMode: 'server') y levanta el
 * server Express resultante. Sin `webServer` acá: el script es dueño del arranque/apagado
 * del server porque también tiene que correr el build del tarball antes.
 */
export default defineConfig({
  testDir: '.',
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  forbidOnly: !!process.env.CI,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4000',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
