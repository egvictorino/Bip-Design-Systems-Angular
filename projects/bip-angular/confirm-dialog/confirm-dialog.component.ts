import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';
import { injectBipLocale } from '@bip-design-systems/angular/core';
import type { BipButtonVariant } from '@bip-design-systems/angular/button';
import { BipButton } from '@bip-design-systems/angular/button';
import { BipModal, BipModalHeader, BipModalBody, BipModalFooter } from '@bip-design-systems/angular/modal';

export type BipConfirmDialogVariant = 'danger' | 'warning' | 'info';

const CONFIRM_BTN_VARIANT: Record<BipConfirmDialogVariant, BipButtonVariant> = {
  info: 'primary',
  danger: 'danger',
  warning: 'primary',
};

const CONFIRM_BTN_CLASS: Record<BipConfirmDialogVariant, string> = {
  info: '',
  danger: '',
  warning: 'bip-confirm-dialog-confirm-btn--warning',
};

/**
 * Composición declarativa sobre `<bip-modal>` (`size="sm"`, `closeOnBackdrop` siempre `false`
 * — a diferencia de Modal, aquí cerrar accidentalmente con un clic fuera descarta una acción
 * destructiva/importante sin confirmación). `onConfirm` de React es el output `confirmed`.
 */
@Component({
  selector: 'bip-confirm-dialog',
  imports: [BipButton, BipModal, BipModalHeader, BipModalBody, BipModalFooter],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BipConfirmDialog {
  protected readonly locale = injectBipLocale();

  readonly open = model(false);
  readonly title = input.required<string>();
  readonly description = input<string | undefined>(undefined);
  readonly confirmLabel = input<string | undefined>(undefined);
  readonly cancelLabel = input<string | undefined>(undefined);
  readonly variant = input<BipConfirmDialogVariant>('info');

  readonly confirmed = output<void>();
  readonly closed = output<void>();

  protected readonly confirmBtnVariant = computed(() => CONFIRM_BTN_VARIANT[this.variant()]);
  protected readonly confirmBtnClass = computed(() => CONFIRM_BTN_CLASS[this.variant()]);
  protected readonly resolvedConfirmLabel = computed(
    () => this.confirmLabel() ?? this.locale().confirmDialog.confirm
  );
  protected readonly resolvedCancelLabel = computed(
    () => this.cancelLabel() ?? this.locale().confirmDialog.cancel
  );

  protected onCancel(): void {
    this.open.set(false);
    this.closed.emit();
  }

  protected onConfirm(): void {
    this.confirmed.emit();
  }
}
