import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { BipAlert } from '@bip-design-systems/angular/alert';
import type { BipToastPosition, BipToastVariant } from './toast.types';

const PROGRESS_INTERVAL_MS = 100;

const SLIDE_OUT_CLASS: Record<BipToastPosition, string> = {
  'top-left': 'bip-toast-item--slide-out-top-left',
  'top-center': 'bip-toast-item--slide-out-top-center',
  'top-right': 'bip-toast-item--slide-out-top-right',
  'bottom-left': 'bip-toast-item--slide-out-bottom-left',
  'bottom-center': 'bip-toast-item--slide-out-bottom-center',
  'bottom-right': 'bip-toast-item--slide-out-bottom-right',
};

const PROGRESS_CLASS: Record<BipToastVariant, string> = {
  info: 'bip-toast-progress-bar--info',
  success: 'bip-toast-progress-bar--success',
  warning: 'bip-toast-progress-bar--warning',
  danger: 'bip-toast-progress-bar--danger',
};

/** Un toast individual — reusa `<bip-alert>` para el contenido, igual que la referencia React. */
@Component({
  selector: 'bip-toast-item',
  standalone: true,
  imports: [BipAlert],
  templateUrl: './toast-item.component.html',
  styleUrl: './toast-item.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'bip-toast-item',
    '[class.bip-toast-item--in]': 'isIn()',
    '[class]': 'isIn() ? "" : slideOutClass()',
  },
})
export class BipToastItemComponent {
  readonly variant = input<BipToastVariant>('info');
  readonly title = input<string | undefined>(undefined);
  readonly message = input.required<string>();
  readonly duration = input(5000);
  readonly exiting = input(false);
  readonly position = input<BipToastPosition>('top-right');

  readonly dismissed = output<void>();
  readonly heightChange = output<number>();

  private readonly elementRef = inject(ElementRef<HTMLElement>);

  protected readonly visible = signal(false);
  protected readonly progress = signal(100);

  protected readonly isIn = computed(() => this.visible() && !this.exiting());
  protected readonly slideOutClass = computed(() => SLIDE_OUT_CLASS[this.position()]);
  protected readonly showProgress = computed(() => this.duration() > 0);
  protected readonly progressBarClass = computed(() => PROGRESS_CLASS[this.variant()]);

  constructor() {
    afterNextRender(() => {
      requestAnimationFrame(() => this.visible.set(true));
      this.reportHeight();

      if (typeof ResizeObserver === 'undefined') return;
      const observer = new ResizeObserver(() => this.reportHeight());
      observer.observe(this.elementRef.nativeElement);
      inject(DestroyRef).onDestroy(() => observer.disconnect());
    });

    effect((onCleanup) => {
      const duration = this.duration();
      if (duration === 0 || this.exiting()) return;

      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const pct = Math.max(0, 100 - (elapsed / duration) * 100);
        this.progress.set(pct);
        if (pct === 0) clearInterval(interval);
      }, PROGRESS_INTERVAL_MS);
      onCleanup(() => clearInterval(interval));
    });
  }

  private reportHeight(): void {
    this.heightChange.emit(this.elementRef.nativeElement.offsetHeight);
  }

  protected onAlertClosed(): void {
    this.dismissed.emit();
  }
}
