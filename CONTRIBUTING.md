# Contributing

## Setup

Requiere Node 22 LTS (`.nvmrc`; `nvm install 22 && nvm use`) y pnpm ≥ 9 (`packageManager` en
`package.json`).

```bash
pnpm install
pnpm build        # ng-packagr → dist/bip-angular
pnpm storybook    # http://localhost:6006
pnpm test         # vitest (una vez); pnpm test:watch
pnpm lint && pnpm typecheck
```

El plan maestro, las reglas de código y la Definición de Terminado de un componente viven en
[CLAUDE.md](CLAUDE.md). Las reglas de revisión, arquitectura y seguridad viven en
[AGENTS.md](AGENTS.md) y aplican a humanos y agentes (el subagente `bip-reviewer` en
`.claude/agents/` las usa para revisar un diff).

## Flujo de ramas

```
main (producción)  ←  qa (testing)  ←  dev (desarrollo)  ←  feature/xxx
```

- Todo cambio nace en `feature/xxx` desde `dev`.
- PRs siempre van `feature/xxx → dev → qa → main` — nunca directo a `qa`/`main` salvo hotfix.
- Hotfixes nacen de `main` y se cherry-pickean de vuelta a `qa` y `dev`.
- `release/x.y.z → dev` es el único otro origen permitido hacia `dev` (ver § Release).
- El job `branch-check` de `pr-validation.yml` rechaza combinaciones base/head incorrectas.

## Antes de abrir un PR

1. **Tests** — `pnpm test`. Componente nuevo ⇒ `*.spec.ts` junto al archivo.
2. **Lint, typecheck y build** — `pnpm lint && pnpm typecheck && pnpm build`.
3. **Changeset** — si el PR toca `projects/bip-angular`, corre `pnpm changeset` y commitea el
   `.changeset/<nombre>.md`. Si no amerita release (docs, CI, tests):
   `pnpm exec changeset add --empty`. El job `changeset-check` (solo PRs a `dev`) falla si falta.
4. **CHANGELOG.md** — entrada bajo `## [Unreleased]` (Keep a Changelog) si el cambio es visible
   para consumidores.
5. **Componente nuevo** — cumple la DoD de `CLAUDE.md`: exportado en su `public-api.ts` y en el
   entry primario, entrada en `testing/a11y.spec.ts` y en `visual/component-matrix.ts` (el
   `storyId` sale de `storybook-static/index.json`, nunca a mano), textos en `esMX` y `enUS`.
6. **Cambio visual** — regenera baselines con `pnpm test:visual:docker --update-snapshots`
   (nunca nativo en macOS/Windows: las baselines son Linux-only) y revisa el diff a ojo.

## Release

Changesets calcula el número de versión; el `CHANGELOG.md` se escribe a mano.

1. `git checkout -b release/x.y.z origin/dev`.
2. En `CHANGELOG.md`, renombra `## [Unreleased]` → `## [x.y.z] - YYYY-MM-DD` y agrega un
   `## [Unreleased]` nuevo y vacío arriba.
3. **Después**, `pnpm exec changeset version` (sube `projects/bip-angular/package.json` y
   consume los `.changeset/*.md`). Verifica que el número coincida con el del CHANGELOG.
4. PR `release/x.y.z → dev` (exento de `changeset-check`), luego `dev → qa` y `qa → main`.
5. El merge a `main` dispara `production.yml`: valida, corre `e2e-consumer`, publica en npm
   (con provenance) desde `dist/bip-angular`, despliega Storybook a GitHub Pages y crea el
   GitHub Release `vx.y.z` con la sección del CHANGELOG. Si la versión ya está en npm, se omite
   la publicación.

Versiones: `0.x` mientras haya bloques pendientes del plan; `1.0.0` cuando los Bloques 0–12 de
`CLAUDE.md` estén completos.

Requisitos del repo: secret `NPM_TOKEN` (token granular con permiso de publish sobre el scope
`@bip-design-systems`) y GitHub Pages con source "GitHub Actions".

## Regresión visual

**Nunca** corras `playwright test` con `playwright.visual.config.ts` de forma nativa: las
baselines (`-chromium-linux.png`) se generan en Docker y un run nativo falla por diseño.

```bash
pnpm test:visual:docker                    # verificar contra baselines existentes
pnpm test:visual:docker --update-snapshots # regenerar tras un cambio visual deliberado
```

La imagen Docker (`scripts/visual-docker.sh`) y el `container` del job `visual-regression` en
`pr-validation.yml` se fijan a la versión exacta de `@playwright/test` — se suben juntos.

## Reportar un bug

Abre un issue con versión, pasos para reproducir y comportamiento esperado vs observado. Para
vulnerabilidades, ver [SECURITY.md](SECURITY.md).
