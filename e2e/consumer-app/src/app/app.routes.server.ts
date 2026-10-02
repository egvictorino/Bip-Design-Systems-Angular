import { RenderMode, ServerRoute } from '@angular/ssr';

// RenderMode.Server (no Prerender): queremos SSR real por request, a través del server
// Express levantado por scripts/e2e-consumer.sh — no un HTML estático generado en build time.
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
