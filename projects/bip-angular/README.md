# @bip-design-systems/angular

Design system **BipUI** para Angular: componentes standalone con signals, `OnPush`, compatibles
con y sin zone.js, SSR-safe, con theming por CSS custom properties, i18n (`esMX`/`enUS`), RTL y
accesibilidad verificada con axe-core.

📚 **Storybook:** https://egvictorino.github.io/Bip-Design-Systems-Angular/

## Instalación

```bash
pnpm add @bip-design-systems/angular
# o: npm install @bip-design-systems/angular
```

Peer dependencies: `@angular/core`, `@angular/common` y `@angular/cdk` `^21.2.0`.

El paquete es **ESM-only** (Angular Package Format, un secondary entry point por componente).

## Estilos globales

Agrega `bip.css` (tokens, tipografía, temas, densidad, RTL, reset) al `angular.json` de tu app:

```json
{
  "styles": ["@bip-design-systems/angular/styles/bip.css", "src/styles.css"]
}
```

No requiere Tailwind ni SCSS.

## Uso

Cada componente es importable desde su propio entry point (tree-shaking real) o desde la raíz:

```ts
import { Component } from '@angular/core';
import { BipButton } from '@bip-design-systems/angular/button';
import { BipInput } from '@bip-design-systems/angular/input';

@Component({
  selector: 'app-login',
  imports: [BipButton, BipInput],
  template: `
    <bip-input label="Correo" helperText="Usa tu correo corporativo" />
    <button bipButton variant="primary">Entrar</button>
  `,
})
export class Login {}
```

Los controles de formulario implementan `ControlValueAccessor` (Reactive Forms, `ngModel`
y `[(value)]`).

## Theming — `provideBipTheme()`

Opcional: sin configuración el tema por defecto es `square` + `light`.

```ts
// app.config.ts
import { provideBipTheme } from '@bip-design-systems/angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBipTheme({
      defaultTheme: 'rounded',
      defaultColorScheme: 'system',
      storageKey: 'bip-theme',
      tokens: { colorPrimary: '#e2007a' },
    }),
  ],
};
```

También puedes aplicar un tema a un subárbol con `<bip-theme-provider>` o la directiva
`[bipTheme]`. Los overlays (Modal, Toast, Dropdown…) heredan el tema, el esquema de color, la
densidad y la dirección del provider más cercano. Al sobrescribir un color de marca, el texto
sobre ese color se recalcula para mantener contraste AA.

### Sin flash de tema (SSR / anti-FOUC)

Inlinea `getThemeInitScript()` en el `<head>` **antes** de cualquier CSS:

```ts
import { getThemeInitScript } from '@bip-design-systems/angular/core';

const script = getThemeInitScript({ storageKey: 'bip-theme', defaultColorScheme: 'system' });
// <script>{{ script }}</script> en el <head> de tu index.html / render del servidor
```

`storageKey` debe coincidir con el pasado a `provideBipTheme()`.

## Internacionalización — `provideBipLocale()`

Los textos visibles y ARIA salen de un diccionario; el default es `esMX`.

```ts
import { enUS, provideBipLocale } from '@bip-design-systems/angular/core';

providers: [provideBipLocale(enUS)];
```

También acepta un `Signal<BipLocale>` para cambiar de idioma en runtime, y `mergeLocale()` para
sobrescribir solo algunas llaves.

## Toast

```ts
import { inject } from '@angular/core';
import { BipToast, provideBipToast } from '@bip-design-systems/angular/toast';

// providers: [provideBipToast({ position: 'bottom-right' })]
const toast = inject(BipToast);
toast.show({ variant: 'success', message: '¡Guardado!' });
```

## Utilidades

`formatCurrency()`, `formatDate()`, `validateRFC()`, los pipes `bipCurrency`/`bipDate` y el
validador `bipRfcValidator` viven en `@bip-design-systems/angular/core`.

## Licencia

[MIT](LICENSE)
