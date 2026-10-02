# BipUI Angular — `@bip-design-systems/angular`

Design system BipUI para Angular: 50 componentes standalone con signals, Angular CDK, theming,
i18n, RTL y SSR. Referencia funcional (versión React): https://github.com/egvictorino/Bip-Design-Systems

- 📦 **Uso del paquete** (instalación, `bip.css`, `provideBipTheme()`, `provideBipLocale()`,
  SSR): [projects/bip-angular/README.md](projects/bip-angular/README.md)
- 📚 **Storybook:** https://egvictorino.github.io/Bip-Design-Systems-Angular/
- 🧭 **Plan maestro y reglas de código:** [CLAUDE.md](CLAUDE.md)
- 🤝 **Contribuir:** [CONTRIBUTING.md](CONTRIBUTING.md) · [SECURITY.md](SECURITY.md) ·
  [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- 📝 **Cambios:** [CHANGELOG.md](CHANGELOG.md)

## Comandos

```bash
pnpm install
pnpm build                  # ng-packagr → dist/bip-angular
pnpm test                   # vitest
pnpm lint && pnpm typecheck
pnpm storybook              # http://localhost:6006
pnpm test:visual:docker     # regresión visual + a11y en navegador (Docker)
pnpm test:e2e               # tarball real + consumidor SSR
```

## Ramas y CI/CD

`main` (producción) ← `qa` ← `dev` ← `feature/xxx`.

| Workflow                              | Trigger             | Pasos clave                                                                                                                                   |
| ------------------------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `pr-validation.yml`                   | PR a cualquier rama | branch check → lint → typecheck → test → build → publint/attw/size · visual-regression · changeset-check (solo → `dev`) · audit (solo → `qa`) |
| `dev.yml`                             | push/PR a `dev`     | lint → test → build → Storybook (artifact)                                                                                                    |
| `qa.yml`                              | push/PR a `qa`      | audit ∥ lint → test → build → e2e-consumer → Storybook QA (artifact)                                                                          |
| `production.yml`                      | push/PR a `main`    | audit + lint + typecheck + test → build → e2e-consumer → npm publish → Pages → GitHub Release                                                 |
| `codeql.yml`, `dependency-review.yml` | estándar            | análisis estático y revisión de dependencias                                                                                                  |

## Licencia

[MIT](LICENSE)
