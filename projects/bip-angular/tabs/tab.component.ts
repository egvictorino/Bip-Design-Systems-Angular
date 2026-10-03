import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
} from '@angular/core';
import { BIP_TABS_CONTEXT } from './tabs-context';

const VARIANT_CLASS: Record<string, string> = {
  line: 'bip-tab--line',
  pill: 'bip-tab--pill',
  boxed: 'bip-tab--boxed',
};

const SIZE_CLASS: Record<string, string> = {
  sm: 'bip-tab--sm',
  md: 'bip-tab--md',
  lg: 'bip-tab--lg',
};

/**
 * Mejora un `<button>` nativo (selector de atributo) — conserva Enter/Espacio nativos para
 * activar. Las flechas (gestionadas por `<bip-tab-list>` vía `FocusKeyManager`) solo mueven el
 * foco (activación manual, igual que la referencia React) — clic o Enter/Espacio sobre el tab
 * ya enfocado es lo que realmente cambia `activeValue`. Roving tabindex: solo el tab activo
 * tiene `tabindex=0`, el resto `-1`.
 */
@Component({
  selector: 'button[bipTab]',
  template: `<ng-content />`,
  styleUrl: './tab.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'bip-tab',
    '[class]': 'hostClasses()',
    role: 'tab',
    '[id]': 'tabId()',
    '[attr.aria-controls]': 'panelId()',
    '[attr.aria-selected]': 'isActive()',
    '[attr.tabindex]': 'isActive() ? 0 : -1',
    '(click)': 'activate()',
  },
})
export class BipTab {
  /** Público para que `<bip-tab-list>` pueda medir su posición (indicador animado). */
  readonly elementRef = inject(ElementRef<HTMLButtonElement>);
  private readonly context = (() => {
    const ctx = inject(BIP_TABS_CONTEXT, { optional: true });
    if (!ctx) {
      throw new Error('<button bipTab> debe usarse dentro de <bip-tabs>');
    }
    return ctx;
  })();

  readonly value = input.required<string>();

  readonly isActive = computed(() => this.context.activeValue() === this.value());
  readonly tabId = computed(() => `${this.context.instanceId}-tab-${this.value()}`);
  readonly panelId = computed(() => `${this.context.instanceId}-panel-${this.value()}`);

  protected readonly hostClasses = computed(() => {
    const classes = [VARIANT_CLASS[this.context.variant()], SIZE_CLASS[this.context.size()]];
    if (this.isActive()) classes.push('bip-tab--active');
    return classes.join(' ');
  });

  /**
   * Sin `input()` propio para `disabled`: el consumidor pone el atributo nativo
   * (`<button bipTab disabled>`), que ya trae gratis el comportamiento correcto (no
   * focusable, no dispara `click`) — igual que `BipDropdownItem`. Se lee de
   * `nativeElement.disabled` (no de un `input()`) para que `FocusKeyManager.skipPredicate`
   * pueda usar esta misma clase sin que su tipo choque con `FocusableOption.disabled?:
   * boolean` del CDK.
   */
  get isDisabled(): boolean {
    return this.elementRef.nativeElement.disabled;
  }

  focus(): void {
    this.elementRef.nativeElement.focus();
  }

  protected activate(): void {
    if (this.isDisabled) return;
    this.context.setActive(this.value());
  }
}
