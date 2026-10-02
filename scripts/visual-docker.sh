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

# La imagen de Playwright trae el Node que era "latest" cuando se publicó la imagen
# (v24.x en v1.63.0-noble), no el Node 22 LTS que este repo fija a propósito (ver CLAUDE.md
# § Stack: "no actualizar a Angular 22+ sin decisión explícita" aplica también a la versión
# de Node — el pin es deliberado, no un default a seguir). `engine-strict=true` (.npmrc)
# hace que `pnpm install` directamente falle con Node 24, así que se instala un Node 22 LTS
# propio dentro del contenedor y se antepone al PATH, en vez de relajar el pin del repo para
# acomodar la imagen.
NODE_PIN_VERSION="22.21.1"

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
    curl -fsSL https://nodejs.org/dist/v${NODE_PIN_VERSION}/node-v${NODE_PIN_VERSION}-linux-x64.tar.gz -o /tmp/node22.tar.gz
    mkdir -p /opt/node22
    tar -xzf /tmp/node22.tar.gz -C /opt/node22 --strip-components=1
    export PATH=\"/opt/node22/bin:\$PATH\"
    corepack enable
    corepack prepare pnpm@9.15.9 --activate
    pnpm install --frozen-lockfile
    pnpm exec playwright test --config=playwright.visual.config.ts $*
  "
