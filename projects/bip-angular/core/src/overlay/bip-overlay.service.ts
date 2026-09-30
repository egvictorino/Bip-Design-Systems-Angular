import { Overlay, type OverlayConfig, type OverlayRef } from '@angular/cdk/overlay';
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

  create(config?: OverlayConfig, hostInjector?: Injector): OverlayRef {
    const overlayRef = this.cdkOverlay.create(config);
    this.syncTheme(overlayRef, hostInjector);
    return overlayRef;
  }

  private syncTheme(overlayRef: OverlayRef, hostInjector: Injector | undefined): void {
    const themeContext = hostInjector?.get(BipThemeContext, null) ?? null;
    const pane = overlayRef.overlayElement;

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
        for (const [prop, value] of Object.entries(attrs.style) as Array<[string, string]>) {
          pane.style.setProperty(prop, value);
        }
      },
      { injector: hostInjector ?? this.rootInjector }
    );

    // El overlay no vive dentro del árbol de componentes (cdk-overlay-container cuelga de
    // document.body), así que no hay un DestroyRef propio que limpie el effect — se destruye
    // a mano en cuanto el overlay se desprende (dispose() llama a detach() primero).
    const subscription = overlayRef.detachments().subscribe(() => {
      ref.destroy();
      subscription.unsubscribe();
    });
  }
}
