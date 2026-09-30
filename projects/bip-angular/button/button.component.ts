import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  inject,
  input,
} from '@angular/core';
import type { BipSize } from '@bip-design-systems/angular/core';

export type BipButtonVariant = 'primary' | 'secondary' | 'bare' | 'soul' | 'danger';

const VARIANT_CLASS: Record<BipButtonVariant, string> = {
  primary: 'bip-button--primary',
  secondary: 'bip-button--secondary',
  bare: 'bip-button--bare',
  soul: 'bip-button--soul',
  danger: 'bip-button--danger',
};

const SIZE_CLASS: Record<BipSize, string> = {
  sm: 'bip-button--sm',
  md: 'bip-button--md',
  lg: 'bip-button--lg',
};

/**
 * Mejora un elemento nativo (selector de atributo `button[bipButton], a[bipButton]`) en vez de
 * envolverlo — así el consumidor conserva la semántica de `<button>`/`<a>` que elija. El estado
 * `disabled`/`loading` en `<a>` se emula (no existe `disabled` nativo en anchors): `aria-disabled`
 * + `tabindex=-1` + bloqueo del click, igual que `BipLink`.
 */
@Component({
  selector: 'button[bipButton], a[bipButton]',
  templateUrl: './button.component.html',
  styleUrl: './button.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'bip-button',
    '[class]': 'hostClasses()',
    '[attr.type]': 'isAnchor ? null : type()',
    '[attr.disabled]': 'isAnchor ? null : (isDisabled() ? "" : null)',
    '[attr.aria-disabled]': 'isAnchor && isDisabled() ? "true" : null',
    '[attr.tabindex]': 'isAnchor && isDisabled() ? -1 : null',
    '[attr.aria-busy]': 'loading() ? "true" : null',
    '(click)': 'isAnchor && isDisabled() ? $event.preventDefault() : null',
  },
})
export class BipButton {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  protected readonly isAnchor = this.elementRef.nativeElement.tagName === 'A';

  readonly variant = input<BipButtonVariant>('primary');
  readonly size = input<BipSize>('md');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly loading = input(false, { transform: booleanAttribute });
  readonly fullWidth = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly isDisabled = computed(() => this.disabled() || this.loading());

  protected readonly hostClasses = computed(() => {
    const classes = [VARIANT_CLASS[this.variant()], SIZE_CLASS[this.size()]];
    if (this.fullWidth()) classes.push('bip-button--full-width');
    if (this.loading()) classes.push('bip-button--loading');
    return classes.join(' ');
  });
}
