# AGENTS.md — checklist para revisar, refactorizar o mover código

Complementa a CLAUDE.md (no repite sus reglas). Es una librería publicada en npm: un error
aquí llega a todas las apps que la usan. Revisa en este orden.

## 1. Seguridad

- Todo input del consumidor es no confiable (textos, URLs, objetos, archivos, `localStorage`).
- Prohibido: `innerHTML`, `insertAdjacentHTML`, `bypassSecurityTrust*`, `eval`, `new Function`,
  `[attr.href]`/`[attr.src]` sin sanitizar.
- `[style]` no se sanitiza: claves dinámicas solo con `sanitizeCssVars()`.
- `<script>` inline solo con `toInlineJs()` + allowlist.
- Archivos: validar tipo y tamaño (`accept` no valida).
- Merges de objetos: ignorar `__proto__`/`constructor`/`prototype`.
- Regex sobre input del usuario sin riesgo de ReDoS.
- `localStorage`: try/catch, solo browser, validar lo leído.
- Sin dependencias runtime nuevas sin aprobación; `pnpm audit` en 0.
- Workflows: `${{ github.* }}` nunca dentro de `run:` (usar `env:`); `permissions:` mínimo;
  sin `pull_request_target` con código del PR; sin secretos en repo ni logs.
- Vulnerabilidad encontrada → SECURITY.md, nunca issue público.

## 2. Arquitectura

- `core` no importa componentes; entre entries solo `@bip-design-systems/angular/x`.
- Overlays solo con `BipOverlay`.
- Lógica pura en `core/utils`; si ya existe en `core`, se reutiliza.
- Quitar/renombrar export, input, output o selector = breaking (changeset + CHANGELOG).
- Código nuevo con `input()/output()/viewChild()`; `computed()` antes que `effect()`.
- Limpiar overlays, timers y listeners con `DestroyRef`.

## 3. Mover o refactorizar

- Mover y cambiar lógica van en commits separados (`git mv`).
- Actualizar todas las referencias: `public-api.ts` (entry y primario), stories,
  `testing/a11y.spec.ts`, `visual/component-matrix.ts`.
- Si cambia el render: `pnpm test:visual:docker --update-snapshots`.

## 4. Tests

- Todo bug corregido lleva spec de regresión.
- Nunca borrar/debilitar tests, `.skip`, ampliar allowlists ni `eslint-disable` sin motivo.

## 5. Reporte

- Por hallazgo: severidad, `archivo:línea`, cómo falla, fix.
- Cierre: **corregido** o **aceptado con motivo**. Separar bugs de cosmética.

## 6. Antes de terminar

`pnpm lint && pnpm typecheck && pnpm test && pnpm build` (+ `pnpm lint:package` si toca el
paquete, `pnpm audit` si toca dependencias, `pnpm test:e2e` si toca SSR/exports).
