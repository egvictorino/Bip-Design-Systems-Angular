import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
} from '@angular/core';
import { BipVisuallyHidden, injectBipLocale } from '@bip-design-systems/angular/core';

export type BipLinkUnderline = 'always' | 'hover' | 'none';

const UNDERLINE_CLASS: Record<BipLinkUnderline, string> = {
  always: '',
  hover: 'bip-link--underline-hover',
  none: 'bip-link--underline-none',
};

/**
 * Mejora un `<a>` nativo (selector de atributo `a[bipLink]`). El ícono de "abre en pestaña
 * nueva" y el texto accesible del hint se añaden como contenido del propio template del
 * componente — siguen apareciendo dentro del `<a>` host junto al `<ng-content>` proyectado,
 * igual que en la referencia React.
 */
@Component({
  selector: 'a[bipLink]',
  imports: [BipVisuallyHidden],
  templateUrl: './link.component.html',
  styleUrl: './link.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'bip-link',
    '[class]': 'hostClasses()',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
    '[attr.tabindex]': 'disabled() ? -1 : null',
    '[attr.target]': 'external() ? "_blank" : null',
    '[attr.rel]': 'external() ? "noopener noreferrer" : null',
  },
})
export class BipLink {
  protected readonly locale = injectBipLocale();

  readonly underline = input<BipLinkUnderline>('always');
  readonly external = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly hostClasses = computed(() => {
    const underline = this.underline();
    return [UNDERLINE_CLASS[underline], this.disabled() ? 'bip-link--disabled' : '']
      .filter(Boolean)
      .join(' ');
  });
}
