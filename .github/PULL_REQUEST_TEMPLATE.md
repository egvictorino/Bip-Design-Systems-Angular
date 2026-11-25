## Resumen

<!-- Qué cambia y por qué, en 1-3 líneas. -->

## Checklist

- [ ] Revisado contra [AGENTS.md](../AGENTS.md) (seguridad, arquitectura, buenas prácticas)
- [ ] Sin sinks inseguros nuevos, sin dependencias runtime nuevas y sin cambios a workflows sin revisar permisos/inyección
- [ ] Sin breaking changes en la API pública (o marcados en changeset y CHANGELOG)
- [ ] Rama sigue el flujo `feature/xxx → dev → qa → main` (ver CONTRIBUTING.md)
- [ ] `pnpm changeset` ejecutado si el PR toca `projects/bip-angular` (o `pnpm exec changeset add --empty` si no aplica)
- [ ] `CHANGELOG.md` actualizado bajo `## [Unreleased]` si el cambio es visible para consumidores
- [ ] Tests nuevos/actualizados para el cambio (`pnpm test`)
- [ ] Story nueva/actualizada si el cambio toca un componente
- [ ] `pnpm lint`, `pnpm typecheck` y `pnpm build` pasan en local
- [ ] Si el cambio es visual: baselines regeneradas con `pnpm test:visual:docker --update-snapshots` y revisadas a ojo

## Plan de pruebas

<!-- Cómo se verificó el cambio — comandos corridos, capturas si es visual. -->
