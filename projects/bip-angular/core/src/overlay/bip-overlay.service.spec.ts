import { Component, Injector, inject } from '@angular/core';
import { By } from '@angular/platform-browser';
import { render } from '@testing-library/angular';
import { afterEach, describe, expect, it } from 'vitest';
import { BipThemeProvider } from '../theme/theme-provider.component';
import { BipOverlay } from './bip-overlay.service';

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

/**
 * `BipOverlay.create()` crea el panel vía el `Overlay` de CDK y lo mantiene en sync con el
 * `BipThemeContext` del `Injector` del llamador (ver doc en bip-overlay.service.ts) — estos
 * tests cubren los dos casos: sin ancestro (defaults square/light) y con un
 * `<bip-theme-provider>` real por encima del componente que abre el overlay.
 */
@Component({ selector: 'bip-overlay-opener-test', template: '' })
class OverlayOpenerTest {
  readonly injector = inject(Injector);
}

@Component({
  selector: 'bip-overlay-host-test',
  template: `
    <bip-theme-provider theme="rounded" colorScheme="dark">
      <bip-overlay-opener-test />
    </bip-theme-provider>
  `,
  imports: [BipThemeProvider, OverlayOpenerTest],
})
class OverlayHostTest {}

describe('BipOverlay', () => {
  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  it('stamps default square/light attributes on the pane without a hostInjector', async () => {
    const { fixture } = await render(OverlayHostTest);
    const bipOverlay = fixture.debugElement.injector.get(BipOverlay);
    const overlayRef = bipOverlay.create();
    await flush();

    expect(overlayRef.overlayElement).toHaveAttribute('data-theme', 'square');
    expect(overlayRef.overlayElement).toHaveAttribute('data-color-scheme', 'light');
    overlayRef.dispose();
  });

  it("stamps the nearest theme context's attributes/vars when given the caller injector", async () => {
    const { fixture } = await render(OverlayHostTest);
    const opener = fixture.debugElement.query(By.directive(OverlayOpenerTest))
      .componentInstance as OverlayOpenerTest;
    const bipOverlay = fixture.debugElement.injector.get(BipOverlay);

    const overlayRef = bipOverlay.create({}, opener.injector);
    await flush();

    expect(overlayRef.overlayElement).toHaveAttribute('data-theme', 'rounded');
    expect(overlayRef.overlayElement).toHaveAttribute('data-color-scheme', 'dark');
    overlayRef.dispose();
  });

  it('removes the effect subscription once the overlay is disposed (does not throw)', async () => {
    const { fixture } = await render(OverlayHostTest);
    const bipOverlay = fixture.debugElement.injector.get(BipOverlay);
    const overlayRef = bipOverlay.create();
    await flush();

    expect(() => overlayRef.dispose()).not.toThrow();
  });
});
