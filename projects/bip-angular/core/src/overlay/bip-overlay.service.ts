import {
  Overlay,
  type OverlayConfig,
  type OverlayPositionBuilder,
  type OverlayRef,
} from '@angular/cdk/overlay';
import { EnvironmentInjector, Injectable, Injector, effect, inject } from '@angular/core';
import { BipThemeContext, defaultThemeAttributes } from '../theme';

/**
 * Wrapper del CDK `Overlay` que estampa el theming del `<bip-theme-provider>`/`[bipTheme]`
 * más cercano al llamador en el panel del overlay — equivalente a `useThemeAttributes()`
 * de React aplicado a `createPortal`. **Todos** los overlays de la librería (Modal,
 * Drawer, Toast, Dropdown, Popover, Tooltip, Select, pickers, Odontogram) deben crearse
 * vía `BipOverlay.create()`, nunca con `Overlay` directo — de lo contrario el overlay
 * queda fuera del árbol DOM del provider (como cualquier `cdk-overlay-container`, que
 * cuelga de `document.body`) y no hereda el tema.
 *
 * `position()` y `scrollStrategies` se reexponen aquí (pasan tal cual al `Overlay` del CDK)
 * para que ningún componente necesite `inject(Overlay)` por su cuenta solo para construir
 * una `PositionStrategy` o una `ScrollStrategy` — `testing/no-direct-overlay.spec.ts` falla
 * si aparece ese import fuera de este archivo.
 *
 * `hostInjector` es obligatorio para resolver el theme-context correcto: `Overlay` (CDK) y
 * `BipOverlay` son singletons `providedIn: 'root'`, así que no tienen forma de saber qué
 * `<bip-theme-provider>` envuelve al componente que está abriendo el overlay. El llamador
 * inyecta su propio `Injector` (`private readonly injector = inject(Injector)`) y lo pasa:
 *
 * ```ts
 * const overlayRef = this.bipOverlay.create(config, this.injector);
 * ```
 */
@Injectable({ providedIn: 'root' })
export class BipOverlay {
  private readonly cdkOverlay = inject(Overlay);
  private readonly rootInjector = inject(EnvironmentInjector);

  readonly scrollStrategies = this.cdkOverlay.scrollStrategies;

  position(): OverlayPositionBuilder {
    return this.cdkOverlay.position();
  }

  create(config?: OverlayConfig, hostInjector?: Injector): OverlayRef {
    const overlayRef = this.cdkOverlay.create(config);
    this.syncTheme(overlayRef, hostInjector);
    return overlayRef;
  }

  private syncTheme(overlayRef: OverlayRef, hostInjector: Injector | undefined): void {
    const themeContext = hostInjector?.get(BipThemeContext, null) ?? null;
    const pane = overlayRef.overlayElement;
    // CSS vars estampadas en la pasada anterior del effect — se limpian las que ya no
    // aparecen en `attrs.style` (p. ej. tras cambiar `tokens`/`cssVars` en el provider), para
    // no dejar custom properties obsoletas colgando del pane indefinidamente.
    let previousStyleKeys: string[] = [];

    const ref = effect(
      () => {
        const attrs = themeContext ? themeContext.attributes() : defaultThemeAttributes();
        pane.setAttribute('data-theme', attrs['data-theme']);
        pane.setAttribute('data-color-scheme', attrs['data-color-scheme']);
        if (attrs['data-density']) {
          pane.setAttribute('data-density', attrs['data-density']);
        } else {
          pane.removeAttribute('data-density');
        }
        if (attrs.dir) {
          pane.setAttribute('dir', attrs.dir);
        } else {
          pane.removeAttribute('dir');
        }

        const nextStyleKeys = Object.keys(attrs.style);
        for (const prop of previousStyleKeys) {
          if (!nextStyleKeys.includes(prop)) pane.style.removeProperty(prop);
        }
        for (const [prop, value] of Object.entries(attrs.style) as Array<[string, string]>) {
          pane.style.setProperty(prop, value);
        }
        previousStyleKeys = nextStyleKeys;
      },
      { injector: hostInjector ?? this.rootInjector }
    );

    // El overlay no vive dentro del árbol de componentes (cdk-overlay-container cuelga de
    // document.body), así que no hay un DestroyRef propio que limpie el effect. Se destruye
    // en `dispose()` (no en el primer `detachments()`: un `OverlayRef` puede volver a
    // adjuntarse — Modal/Drawer lo reusan entre show()/hide() — y en ese caso el effect debe
    // seguir vivo para seguir sincronizando el tema).
    const originalDispose = overlayRef.dispose.bind(overlayRef);
    overlayRef.dispose = () => {
      ref.destroy();
      originalDispose();
    };
  }
}
