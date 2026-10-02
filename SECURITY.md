# Security Policy

## Reporting a Vulnerability

Si encuentras una vulnerabilidad de seguridad en `@bip-design-systems/angular`, repórtala de
forma privada vía
[GitHub Security Advisories](https://github.com/egvictorino/Bip-Design-Systems-Angular/security/advisories/new)
en lugar de abrir un issue público.

Incluye:

- Versión del paquete afectada
- Pasos para reproducir
- Impacto potencial

## Versiones soportadas

Solo la última versión publicada recibe parches de seguridad — no hay mantenimiento de
versiones anteriores (proyecto en línea 0.x, ver `CLAUDE.md` § Estado de bloques).

## Auditoría automatizada

`production.yml` corre `pnpm audit --audit-level=high` en cada push/PR a `main` y bloquea la
publicación si falla; `qa.yml` hace lo mismo hacia `qa`, y `pr-validation.yml` corre una
auditoría no bloqueante (`--audit-level=moderate`) en PRs hacia `qa`. `codeql.yml` y
`dependency-review.yml` cubren análisis estático y dependencias nuevas en PRs. No se usa
Dependabot: las dependencias se actualizan a mano en ramas `feature/deps-*`. Dependencias con
CVEs conocidos y sin fix upstream se fijan vía `pnpm.overrides` en el `package.json` raíz.
