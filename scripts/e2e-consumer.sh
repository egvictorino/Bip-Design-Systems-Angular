#!/usr/bin/env bash
# Construye @bip-design-systems/angular, lo empaqueta en un tarball real (no un link de
# workspace), lo instala en e2e/consumer-app como un proyecto independiente, construye esa
# app con Angular (SSR real vía @angular/build:application, outputMode: 'server'), levanta el
# servidor Express resultante y corre e2e/consumer.spec.ts contra él.
#
# Por qué un tarball y no `pnpm --filter` / un link de workspace: eso solo prueba el código
# fuente, nunca lo que package.json#exports/sideEffects/ng-package.json#assets realmente
# empaquetan — exactamente la clase de bug que un link de workspace no puede atrapar (un
# export faltante, un asset que no se copia, un sideEffects mal declarado que un bundler
# externo trata distinto a ng-packagr).
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONSUMER_DIR="${REPO_ROOT}/e2e/consumer-app"
VENDOR_DIR="${CONSUMER_DIR}/vendor"
PORT=4000
SERVER_LOG="$(mktemp -t bip-e2e-server.XXXXXX.log)"
SERVER_PID=""

cleanup() {
  if [ -n "$SERVER_PID" ] && kill -0 "$SERVER_PID" 2>/dev/null; then
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

echo "▶ Construyendo @bip-design-systems/angular…"
cd "$REPO_ROOT"
pnpm build

echo "▶ Empaquetando el tarball…"
rm -rf "$VENDOR_DIR"
mkdir -p "$VENDOR_DIR"
cd "$REPO_ROOT/dist/bip-angular"
TARBALL_PATH=$(pnpm pack --pack-destination "$VENDOR_DIR" | tail -1)
mv "$TARBALL_PATH" "${VENDOR_DIR}/bip-angular.tgz"

echo "▶ Instalando el tarball en e2e/consumer-app (proyecto independiente, no un link de workspace)…"
cd "$CONSUMER_DIR"
rm -rf node_modules dist .angular pnpm-lock.yaml
pnpm install --no-frozen-lockfile

echo "▶ Construyendo la app consumidora (SSR)…"
pnpm exec ng build

echo "▶ Levantando el servidor Express en :${PORT}…"
PORT="$PORT" node dist/consumer-app/server/server.mjs > "$SERVER_LOG" 2>&1 &
SERVER_PID=$!

for i in $(seq 1 30); do
  if curl -sf "http://localhost:${PORT}" -o /dev/null 2>/dev/null; then
    break
  fi
  if ! kill -0 "$SERVER_PID" 2>/dev/null; then
    echo "✗ El servidor terminó antes de levantar. Log:" >&2
    cat "$SERVER_LOG" >&2
    exit 1
  fi
  sleep 1
done

echo "▶ Corriendo el smoke test e2e…"
cd "$REPO_ROOT"
set +e
pnpm exec playwright test --config=e2e/playwright.e2e.config.ts "$@"
TEST_EXIT=$?
set -e

# Nada en el log del server debería mencionar un acceso a window/document fuera de guard —
# eso se manifiesta como una excepción de Node durante el render, no como un fallo de
# aserción de Playwright (la request ya habría devuelto 500 antes, pero esto deja evidencia
# explícita en el log si algo logra fallar de forma más silenciosa).
if grep -qE 'ReferenceError|is not defined|NG0[0-9]+' "$SERVER_LOG"; then
  echo "✗ El log del servidor contiene errores (ver $SERVER_LOG):" >&2
  cat "$SERVER_LOG" >&2
  exit 1
fi

exit $TEST_EXIT
