---
'@bip-design-systems/angular': minor
---

Layout, tipografía y display (Bloque 4): 17 componentes con paridad funcional con la
referencia React — `BipContainer`/`BipStack`/`BipGrid` (selectores de atributo
`[bipContainer]`/`[bipStack]`/`[bipGrid]`, primitivas de layout sin semántica propia),
`BipText`/`BipHeading` (`[bipText]`/`[bipHeading]`, tipografía sobre el elemento host
elegido por el consumidor; `BipHeading` infiere el nivel del propio tag `h1`-`h6`),
`BipDivider` (`role="separator"`), `BipLink` (`a[bipLink]`, underline/disabled/external con
hint accesible), `BipSpinner`/`BipSkeleton` (indicadores de carga), `BipBadge`, `BipAvatar` +
`BipAvatarGroup` (fallback imagen→iniciales→ícono, `size` de grupo propagado a los hijos vía
DI), `BipProgressBar` (`role="progressbar"`), `BipEmptyState` (slots `[bipEmptyStateIcon]`/
`[bipEmptyStateAction]`), `BipCard` + `BipCardHeader`/`BipCardBody`/`BipCardFooter`/
`BipCardMedia`, `BipStatsCard` (slot `[bipStatsCardIcon]`, tendencia con aria-label
localizado) y `BipAlert` (`role="status"`/`role="alert"` según variant, botón cerrar opcional
vía `closable`/`(closed)`). Nueva clave `avatar.fallbackAlt` en `core/i18n` (`esMX`/`enUS`).
