import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type BipModalFooterAlign = 'left' | 'center' | 'right';

const ALIGN_CLASS: Record<BipModalFooterAlign, string> = {
  left: 'bip-modal-footer--left',
  center: 'bip-modal-footer--center',
  right: 'bip-modal-footer--right',
};

@Component({
  selector: 'bip-modal-footer',
  standalone: true,
  template: `<ng-content />`,
  styleUrl: './modal-footer.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'bip-modal-footer', '[class]': 'alignClass()' },
})
export class BipModalFooter {
  readonly align = input<BipModalFooterAlign>('right');
  protected readonly alignClass = computed(() => ALIGN_CLASS[this.align()]);
}
