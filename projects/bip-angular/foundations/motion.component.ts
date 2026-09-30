import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

const DURATIONS = ['instant', 'fast', 'normal', 'slow'];
const EASINGS = ['standard', 'out', 'in'];

@Component({
  selector: 'bip-foundations-motion',
  template: `
    <div class="page">
      <h1 class="title">Motion</h1>
      <p class="lead">
        <code>--duration-*</code> y <code>--ease-*</code> — invariantes a theme/esquema. Bajo
        <code>prefers-reduced-motion: reduce</code>, todas las duraciones colapsan a 0ms (ver
        <code>styles/base.css</code>). Pasa el cursor para disparar la transición.
      </p>
      <div class="grid">
        @for (duration of durations; track duration) {
          @for (easing of easings; track easing) {
            <div
              class="cell"
              (mouseenter)="activate(duration + '-' + easing)"
              (mouseleave)="deactivate(duration + '-' + easing)"
            >
              <div
                class="dot"
                [class.active]="active().has(duration + '-' + easing)"
                [style.transitionDuration]="'var(--duration-' + duration + ')'"
                [style.transitionTimingFunction]="'var(--ease-' + easing + ')'"
              ></div>
              <p class="label">--duration-{{ duration }} · --ease-{{ easing }}</p>
            </div>
          }
        }
      </div>
    </div>
  `,
  styleUrl: './motion.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BipFoundationsMotion {
  protected readonly durations = DURATIONS;
  protected readonly easings = EASINGS;
  protected readonly active = signal(new Set<string>());

  protected activate(key: string): void {
    this.active.update((s) => new Set(s).add(key));
  }

  protected deactivate(key: string): void {
    this.active.update((s) => {
      const next = new Set(s);
      next.delete(key);
      return next;
    });
  }
}
