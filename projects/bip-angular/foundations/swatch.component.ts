import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  computed,
  input,
  signal,
  viewChild,
} from '@angular/core';
import type { TokenEntry } from './tokens.data';

@Component({
  selector: 'bip-foundations-swatch',
  template: `
    <button
      type="button"
      class="swatchButton"
      (click)="copy()"
      [attr.aria-label]="'Copiar ' + token().name + ': ' + resolved()"
    >
      <div #box class="swatchBox" [style.backgroundColor]="'var(--' + token().name + ')'"></div>
      <div class="swatchLabel">
        <p class="swatchName">{{ token().name }}</p>
        <p class="swatchValue">{{ copied() ? '¡Copiado!' : resolved() || '…' }}</p>
        <span
          class="kindBadge"
          [class.kindSeed]="token().kind === 'seed'"
          [class.kindDerived]="token().kind === 'derived'"
        >
          {{ token().kind === 'seed' ? 'Semilla' : 'Derivado' }}
        </span>
        @if (token().kind === 'derived') {
          <p class="formula">{{ formula() }}</p>
        }
        @if (isInvariant()) {
          <p class="invariantNote">invariante entre esquemas</p>
        }
      </div>
    </button>
  `,
  styleUrl: './swatch.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BipFoundationsSwatch {
  readonly token = input.required<TokenEntry>();
  readonly scheme = input.required<'light' | 'dark'>();

  private readonly box = viewChild.required<ElementRef<HTMLDivElement>>('box');
  protected readonly resolved = signal('');
  protected readonly copied = signal(false);

  protected readonly formula = computed(() => {
    const t = this.token();
    return this.scheme() === 'dark' ? (t.dark ?? t.light) : t.light;
  });

  protected readonly isInvariant = computed(
    () => this.scheme() === 'dark' && this.token().dark === null
  );

  constructor() {
    afterNextRender(() => {
      this.resolved.set(getComputedStyle(this.box().nativeElement).backgroundColor);
    });
  }

  protected async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.resolved());
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1500);
    } catch {
      // clipboard API no disponible (contexto HTTP o permiso denegado)
    }
  }
}
