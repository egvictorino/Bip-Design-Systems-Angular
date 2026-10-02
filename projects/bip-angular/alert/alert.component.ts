import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input, output } from '@angular/core';
import { injectBipLocale } from '@bip-design-systems/angular/core';

export type BipAlertVariant = 'info' | 'success' | 'warning' | 'danger';

/** info/success → role="status" (aria-live polite, no interrumpe); warning/danger → role="alert" (aria-live assertive, urgente). */
const VARIANT_ROLE: Record<BipAlertVariant, 'alert' | 'status'> = {
  info: 'status',
  success: 'status',
  warning: 'alert',
  danger: 'alert',
};

const VARIANT_CLASS: Record<BipAlertVariant, string> = {
  info: 'bip-alert--info',
  success: 'bip-alert--success',
  warning: 'bip-alert--warning',
  danger: 'bip-alert--danger',
};

const CLOSE_BTN_VARIANT_CLASS: Record<BipAlertVariant, string> = {
  info: 'bip-alert-close-btn--info',
  success: 'bip-alert-close-btn--success',
  warning: 'bip-alert-close-btn--warning',
  danger: 'bip-alert-close-btn--danger',
};

/**
 * `closable` reemplaza el `onClose &&` condicional de la referencia (Angular no puede
 * detectar si el consumidor enlazó un output): el consumidor pide el botón explícitamente con
 * `closable` y reacciona al evento `(closed)` — típicamente ocultando/quitando el `<bip-alert>`
 * de su propio estado.
 */
@Component({
  selector: 'bip-alert',
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'bip-alert',
    '[class]': 'hostClasses()',
    '[attr.role]': 'role()',
  },
})
export class BipAlert {
  protected readonly locale = injectBipLocale();

  readonly variant = input<BipAlertVariant>('info');
  readonly title = input<string | undefined>(undefined);
  readonly closable = input(false, { transform: booleanAttribute });
  readonly closed = output<void>();

  protected readonly role = computed(() => VARIANT_ROLE[this.variant()]);
  protected readonly hostClasses = computed(() => VARIANT_CLASS[this.variant()]);
  protected readonly closeBtnClasses = computed(
    () => `bip-alert-close-btn ${CLOSE_BTN_VARIANT_CLASS[this.variant()]}`
  );

  protected onCloseClick(): void {
    this.closed.emit();
  }
}
