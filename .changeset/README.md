# Changesets

Este directorio se usa por [changesets](https://github.com/changesets/changesets).
El changelog **no** se genera automáticamente (`"changelog": false`): se mantiene a mano en
`CHANGELOG.md` siguiendo [Keep a Changelog](https://keepachangelog.com/).

Cada PR con cambios publicables corre `pnpm changeset` para describir el cambio y su tipo de
bump (patch/minor/major). Ver `CLAUDE.md` § Ramas, versionado y release para el flujo completo.
