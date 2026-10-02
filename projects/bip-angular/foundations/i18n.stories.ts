import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { enUS, esMX, injectBipLocale, provideBipLocale } from '../core/src/i18n';
import type { BipLocale } from '../core/src/i18n';
import type { Meta, StoryObj } from '@storybook/angular-vite';

/**
 * Stories de `Foundations/I18n` — puerto conceptual de las demos de `useBipLocale()`/
 * `LocaleContext` (React), sin los componentes de los Bloques 4-6 que todavía no existen:
 * las demos leen directo de `injectBipLocale()` y muestran una muestra representativa de
 * claves del diccionario (no las ~250 que trae `BipLocale` completo).
 */

function sampleBoxStyle(): string {
  return `
    background: var(--color-surface-1);
    border: 1px solid var(--color-edge);
    border-radius: var(--radius-container);
    padding: var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    color: var(--color-txt);
    font-size: var(--font-size-sm);
    min-inline-size: 20rem;
  `;
}

@Component({
  selector: 'bip-i18n-sample',
  template: `
    <div [style]="boxStyle">
      <strong>{{ locale().locale }}</strong>
      <dl
        style="display: grid; grid-template-columns: auto 1fr; gap: var(--space-1) var(--space-3); margin: 0;"
      >
        <dt style="color: var(--color-txt-secondary);">alert.close</dt>
        <dd style="margin: 0;">{{ locale().alert.close }}</dd>
        <dt style="color: var(--color-txt-secondary);">modal.close</dt>
        <dd style="margin: 0;">{{ locale().modal.close }}</dd>
        <dt style="color: var(--color-txt-secondary);">pagination.page(3)</dt>
        <dd style="margin: 0;">{{ locale().pagination.page(3) }}</dd>
        <dt style="color: var(--color-txt-secondary);">dataTable.selectedCount(2)</dt>
        <dd style="margin: 0;">{{ locale().dataTable.selectedCount(2) }}</dd>
        <dt style="color: var(--color-txt-secondary);">fileUpload.dragHere</dt>
        <dd style="margin: 0;">{{ locale().fileUpload.dragHere }}</dd>
      </dl>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class I18nSampleDemo {
  protected readonly boxStyle = sampleBoxStyle();
  protected readonly locale = injectBipLocale();
}

/** `provideBipLocale(esMX)` / `provideBipLocale(enUS)` uno al lado del otro, sin switcher. */
@Component({
  selector: 'bip-i18n-es-provider',
  template: `<bip-i18n-sample />`,
  imports: [I18nSampleDemo],
  providers: [provideBipLocale(esMX)],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class I18nEsProviderDemo {}

@Component({
  selector: 'bip-i18n-en-provider',
  template: `<bip-i18n-sample />`,
  imports: [I18nSampleDemo],
  providers: [provideBipLocale(enUS)],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class I18nEnProviderDemo {}

@Component({
  selector: 'bip-i18n-side-by-side',
  template: `
    <div style="display: flex; gap: var(--space-6); flex-wrap: wrap;">
      <bip-i18n-es-provider />
      <bip-i18n-en-provider />
    </div>
  `,
  imports: [I18nEsProviderDemo, I18nEnProviderDemo],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class I18nSideBySideDemo {}

/**
 * `provideBipLocale()` también acepta un `Signal<BipLocale>` ya reactivo — este signal se
 * declara a nivel de módulo porque `providers` de un componente se evalúa una sola vez, al
 * decorar la clase (no hay `this` todavía); `injectBipLocale()` en `I18nSampleDemo` reacciona
 * a cada `.set()` sin recrear el árbol.
 */
const liveLocale = signal<BipLocale>(esMX);

@Component({
  selector: 'bip-i18n-live-switch',
  template: `
    <div style="display: flex; flex-direction: column; gap: var(--space-3);">
      <div style="display: flex; gap: var(--space-2);">
        <button type="button" (click)="select('es')">es-MX</button>
        <button type="button" (click)="select('en')">en-US</button>
      </div>
      <bip-i18n-sample />
    </div>
  `,
  imports: [I18nSampleDemo],
  providers: [provideBipLocale(liveLocale)],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class I18nLiveSwitchDemo {
  protected select(value: 'es' | 'en'): void {
    liveLocale.set(value === 'es' ? esMX : enUS);
  }
}

const meta: Meta = {
  title: 'Foundations/I18n',
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const SideBySide: Story = {
  render: () => ({
    template: `<bip-i18n-side-by-side />`,
    moduleMetadata: { imports: [I18nSideBySideDemo] },
  }),
};

export const LiveSwitch: Story = {
  render: () => ({
    template: `<bip-i18n-live-switch />`,
    moduleMetadata: { imports: [I18nLiveSwitchDemo] },
  }),
};
