---
'@bip-design-systems/angular': minor
---

i18n, utilidades y primitivas de a11y (Bloque 3): `core/i18n` (`BipLocale`, diccionarios
`esMX`/`enUS`, `mergeLocale()`, `provideBipLocale()`/`injectBipLocale()`); `core/utils`
(`formatCurrency()`/`formatDate()`/`validateRFC()`, `BipCurrencyPipe`/`BipDatePipe`/
`bipRfcValidator()`; `mediaQuery()` renombrado a `breakpointQuery()`); `core/a11y`
(`BipIdGenerator`, `disclosure()`, `mediaQuery(query)` sobre `BreakpointObserver`,
`[bipClickOutside]`, `<bip-visually-hidden>`); `core/forms` (`BipFormControlBase`); guards
`no-hardcoded-strings`/`dictionaries`/registro de cobertura de a11y; story `Foundations/I18n`.
