import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

// `security.allowedHosts: ["*"]` en angular.json: sin esto, la protección SSRF de Angular
// rechaza el header Host ("localhost:4000" no está en el allowlist por defecto) y cae en
// silencio a un shell vacío (<app-root></app-root>, solo un warning en el log del server, no
// un error HTTP) en vez de servir el árbol renderizado — exactamente el bug que
// e2e/consumer.spec.ts detectó al pedir `/` y no encontrar los botones en el HTML. Un
// smoke test local en :4000 no tiene superficie de SSRF real que proteger.

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  })
);

app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
    .catch(next);
});

// `PORT` lo fija scripts/e2e-consumer.sh — ver e2e/playwright.e2e.config.ts (baseURL
// apunta al mismo puerto).
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

export const reqHandler = createNodeRequestHandler(app);
