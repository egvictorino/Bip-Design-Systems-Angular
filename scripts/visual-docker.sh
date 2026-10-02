#!/usr/bin/env bash
# Corre la suite de regresión visual (visual/) dentro de la imagen Docker exacta de
# Playwright que usa CI, para que las corridas locales y las de CI produzcan screenshots
# idénticos sin importar el SO/arquitectura del host (macOS/Apple Silicon incluido, vía
# --platform).
#
# El tag de la imagen está fijado a la versión de @playwright/test en package.json — se
# suben juntos, nunca por separado (un desfase acá es exactamente el tipo de fallo
# silencioso que este script existe para evitar).
#
# Uso:
#   ./scripts/visual-docker.sh                     # verifica contra las baselines commiteadas
#   ./scripts/visual-docker.sh --update-snapshots   # regenera baselines
#   ./scripts/visual-docker.sh -g "RTL"             # cualquier flag del CLI de playwright test pasa tal cual
set -euo pipefail

PLAYWRIGHT_VERSION="1.63.0"
IMAGE="mcr.microsoft.com/playwright:v${PLAYWRIGHT_VERSION}-noble"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

INSTALLED_VERSION=$(node -p "require('$REPO_ROOT/package.json').devDependencies['@playwright/test']" 2>/dev/null || echo "")
if [ "$INSTALLED_VERSION" != "$PLAYWRIGHT_VERSION" ]; then
  echo "⚠️  Este script está fijado a Playwright ${PLAYWRIGHT_VERSION} pero package.json declara ${INSTALLED_VERSION:-<no encontrado>}." >&2
  echo "    Actualiza PLAYWRIGHT_VERSION en scripts/visual-docker.sh para que coincida antes de continuar." >&2
  exit 1
fi

echo "▶ Corriendo regresión visual en ${IMAGE} (linux/amd64)…"

docker run --rm \
  --platform linux/amd64 \
  -v "${REPO_ROOT}:/work" \
  -v /work/node_modules \
  -v /work/projects/bip-angular/node_modules \
  -w /work \
  -e CI=true \
  "$IMAGE" \
  bash -c "
    set -e
    corepack enable
    corepack prepare pnpm@9.15.9 --activate
    pnpm install --frozen-lockfile
    pnpm exec playwright test --config=playwright.visual.config.ts $*
  "
