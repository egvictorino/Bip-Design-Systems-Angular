import { Overlay, type OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  TemplateRef,
  ViewContainerRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { BipOverlay } from '../core/src/overlay';
import { BipThemeProvider, injectThemeControls } from '../core/src/theme';
import { contrastRatio } from '../core/src/utils';
import type { Meta, StoryObj } from '@storybook/angular-vite';

/**
 * Stories de `Foundations/Theming` — puerto de `ThemeProvider.stories.tsx` (React) sin los
 * componentes de los Bloques 4-6 (Button, Card, Avatar, Modal...) que todavía no existen en
 * este repo: las demos usan HTML plano estilado con tokens (`var(--color-*)`,
 * `var(--radius-*)`, `var(--space-*)`) para no bloquear el Bloque 2 en componentes futuros.
 */

@Component({
  selector: 'bip-theming-playground-demo',
  template: `
    <bip-theme-provider theme="rounded" [tokens]="{ colorPrimary: colorPrimary() }">
      <div style="display: flex; flex-direction: column; gap: var(--space-4); padding: var(--space-4);">
        <label style="display: flex; gap: var(--space-2); align-items: center; color: var(--color-txt);">
          colorPrimary
          <input type="color" [value]="colorPrimary()" (input)="onColorInput($event)" />
        </label>

        <div style="display: flex; gap: var(--space-3); align-items: center;">
          <button
            type="button"
            style="
              background: var(--color-primary);
              color: var(--color-txt-on-primary);
              border: none;
              border-radius: var(--radius-control);
              padding: var(--space-control-y-md) var(--space-control-x-md);
            "
          >
            Botón primario
          </button>
          <span
            style="
              padding: var(--space-1) var(--space-3);
              border-radius: var(--radius-pill);
              background: var(--color-primary);
              color: var(--color-txt-on-primary);
              font-size: var(--font-size-sm);
            "
          >
            Badge
          </span>
        </div>

        <p style="color: var(--color-txt);">
          Contraste --color-txt-on-primary vs colorPrimary:
          <strong>{{ contrastLabel() }}</strong> ({{ contrastLabel() === 'AA' ? '&gt;= 4.5:1' : '&lt; 4.5:1' }})
        </p>

        <pre
          style="
            background: var(--color-surface-2);
            color: var(--color-txt);
            padding: var(--space-4);
            border-radius: var(--radius-surface);
            overflow: auto;
          "
        >&lt;bip-theme-provider [tokens]="&#123; colorPrimary: '{{ colorPrimary() }}' &#125;"&gt;</pre
        >
      </div>
    </bip-theme-provider>
  `,
  imports: [BipThemeProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ThemingPlaygroundDemo {
  protected readonly colorPrimary = signal('#e2007a');

  protected onColorInput(event: Event): void {
    this.colorPrimary.set((event.target as HTMLInputElement).value);
  }

  protected contrastLabel(): 'AA' | 'fail' {
    const ratio = contrastRatio(this.colorPrimary(), '#ffffff');
    const ratioOnDark = contrastRatio(this.colorPrimary(), '#191919');
    return Math.max(ratio, ratioOnDark) >= 4.5 ? 'AA' : 'fail';
  }
}

function themedBoxStyle(): string {
  return `
    background: var(--color-surface-1);
    border: 1px solid var(--color-edge);
    border-radius: var(--radius-container);
    padding: var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    color: var(--color-txt);
  `;
}

@Component({
  selector: 'bip-theming-side-by-side-demo',
  template: `
    <div style="display: flex; gap: var(--space-6);">
      <bip-theme-provider theme="square">
        <div [style]="boxStyle">
          <strong>Square</strong>
          <button
            type="button"
            style="background: var(--color-primary); color: var(--color-txt-on-primary); border: none; border-radius: var(--radius-control); padding: var(--space-control-y-md) var(--space-control-x-md);"
          >
            Botón
          </button>
        </div>
      </bip-theme-provider>
      <bip-theme-provider theme="rounded">
        <div [style]="boxStyle">
          <strong>Rounded</strong>
          <button
            type="button"
            style="background: var(--color-primary); color: var(--color-txt-on-primary); border: none; border-radius: var(--radius-control); padding: var(--space-control-y-md) var(--space-control-x-md);"
          >
            Botón
          </button>
        </div>
      </bip-theme-provider>
    </div>
  `,
  imports: [BipThemeProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ThemingSideBySideDemo {
  protected readonly boxStyle = themedBoxStyle();
}

@Component({
  selector: 'bip-theming-portal-opener',
  template: `
    <button type="button" (click)="open()">Abrir overlay (rounded)</button>
    <ng-template #panel>
      <div [style]="boxStyle">
        El panel se crea vía <code>BipOverlay</code> (CDK Overlay + Portal, fuera del árbol
        DOM del provider) y aun así hereda el tema activo — theme="rounded".
        <button type="button" (click)="close()">Cerrar</button>
      </div>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ThemingPortalOpener {
  private readonly bipOverlay = inject(BipOverlay);
  private readonly cdkOverlay = inject(Overlay);
  private readonly injector = inject(Injector);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly panelTemplate = viewChild.required<TemplateRef<unknown>>('panel');
  private overlayRef: OverlayRef | null = null;
  protected readonly boxStyle = themedBoxStyle();

  protected open(): void {
    const positionStrategy = this.cdkOverlay.position().global().centerHorizontally().centerVertically();
    this.overlayRef = this.bipOverlay.create({ hasBackdrop: true, positionStrategy }, this.injector);
    this.overlayRef.backdropClick().subscribe(() => this.close());
    this.overlayRef.attach(new TemplatePortal(this.panelTemplate(), this.viewContainerRef));
  }

  protected close(): void {
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }
}

@Component({
  selector: 'bip-theming-system-demo',
  template: `
    <div [style]="boxStyle">
      colorScheme="system" → resuelto: <strong>{{ controls.resolvedColorScheme }}</strong>
      <p style="margin: 0; font-size: var(--font-size-sm);">
        Cambia el modo oscuro del sistema operativo con esta story abierta para verlo
        actualizarse en vivo.
      </p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ThemingSystemDemo {
  protected readonly boxStyle = themedBoxStyle();
  protected readonly controls = injectThemeControls();
}

@Component({
  selector: 'bip-theming-uncontrolled-demo',
  template: `
    <div [style]="boxStyle">
      <div style="display: flex; gap: var(--space-3);">
        <button type="button" (click)="controls.toggleColorScheme()">
          {{ controls.resolvedColorScheme === 'dark' ? 'Dark' : 'Light' }} (preferencia:
          {{ controls.colorScheme }})
        </button>
        <button
          type="button"
          (click)="controls.setTheme(controls.theme === 'square' ? 'rounded' : 'square')"
        >
          Tema: {{ controls.theme }}
        </button>
      </div>
      <p style="margin: 0; font-size: var(--font-size-sm);">
        Persistido en localStorage bajo <code>bip-storybook-theme</code> — recarga esta story
        para comprobarlo.
      </p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ThemingUncontrolledDemo {
  protected readonly boxStyle = themedBoxStyle();
  protected readonly controls = injectThemeControls();
}

const meta: Meta = {
  title: 'Foundations/Theming',
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Playground: Story = {
  render: () => ({ template: `<bip-theming-playground-demo />`, moduleMetadata: { imports: [ThemingPlaygroundDemo] } }),
};

export const SideBySide: Story = {
  render: () => ({
    template: `<bip-theming-side-by-side-demo />`,
    moduleMetadata: { imports: [ThemingSideBySideDemo] },
  }),
};

export const PortalTheming: Story = {
  render: () => ({
    template: `<bip-theme-provider theme="rounded"><bip-theming-portal-opener /></bip-theme-provider>`,
    moduleMetadata: { imports: [BipThemeProvider, ThemingPortalOpener] },
  }),
};

export const SystemColorScheme: Story = {
  render: () => ({
    template: `<bip-theme-provider theme="square" colorScheme="system"><bip-theming-system-demo /></bip-theme-provider>`,
    moduleMetadata: { imports: [BipThemeProvider, ThemingSystemDemo] },
  }),
};

export const UncontrolledWithPersistence: Story = {
  render: () => ({
    template: `<bip-theme-provider defaultTheme="square" defaultColorScheme="light" storageKey="bip-storybook-theme"><bip-theming-uncontrolled-demo /></bip-theme-provider>`,
    moduleMetadata: { imports: [BipThemeProvider, ThemingUncontrolledDemo] },
  }),
};
