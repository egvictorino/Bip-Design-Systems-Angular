# Changelog

Todos los cambios notables de `@bip-design-systems/angular` se documentan en este archivo.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/), y el proyecto
usa [Semantic Versioning](https://semver.org/lang/es/) (`0.x` mientras haya bloques del plan
pendientes; `1.0.0` cuando los Bloques 0-12 de `CLAUDE.md` estén completos).

## [Unreleased]

### Added

- Bootstrap del workspace (Bloque 0): Angular CLI + pnpm, librería `@bip-design-systems/angular`
  con secondary entry point `core` de plantilla, Vitest + Testing Library + jest-dom + axe,
  ESLint (`angular-eslint`, prefijo `bip`) + Prettier, Storybook con `addon-a11y`/`addon-docs`,
  Changesets y CI mínima de validación de PRs.
