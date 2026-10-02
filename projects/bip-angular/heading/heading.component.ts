import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
} from '@angular/core';

export type BipHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type BipHeadingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type BipHeadingWeight = 'semibold' | 'bold';

const DEFAULT_SIZE_BY_LEVEL: Record<BipHeadingLevel, BipHeadingSize> = {
  1: '2xl',
  2: 'xl',
  3: 'lg',
  4: 'md',
  5: 'sm',
  6: 'xs',
};

const SIZE_CLASS: Record<BipHeadingSize, string> = {
  xs: 'bip-heading--size-xs',
  sm: 'bip-heading--size-sm',
  md: 'bip-heading--size-md',
  lg: 'bip-heading--size-lg',
  xl: 'bip-heading--size-xl',
  '2xl': 'bip-heading--size-2xl',
};

const WEIGHT_CLASS: Record<BipHeadingWeight, string> = {
  semibold: 'bip-heading--weight-semibold',
  bold: 'bip-heading--weight-bold',
};

const TAG_LEVEL: Record<string, BipHeadingLevel> = {
  H1: 1,
  H2: 2,
  H3: 3,
  H4: 4,
  H5: 5,
  H6: 6,
};

/**
 * Encabezado semántico con tamaño visual independiente del nivel del documento — ver `bipText`
 * para texto de cuerpo. Selector de atributo aplicado directamente a `<h1>`-`<h6>`
 * (`<h2 bipHeading>` infiere `level=2` del propio tag, sin duplicarlo en un input); si el
 * consumidor necesita desacoplar el nivel accesible del tag renderizado (equivalente al `as`
 * de la referencia React), puede aplicarlo sobre cualquier otro elemento pasando `level`
 * explícito — en ese caso se añaden `role="heading"`/`aria-level` porque el tag host no los
 * aporta de forma nativa.
 */
@Component({
  selector: '[bipHeading]',
  template: `<ng-content />`,
  styleUrl: './heading.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'bip-heading',
    '[class]': 'hostClasses()',
    '[attr.role]': 'ariaRole()',
    '[attr.aria-level]': 'ariaLevel()',
  },
})
export class BipHeading {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly level = input<BipHeadingLevel | undefined>(undefined);
  readonly size = input<BipHeadingSize | undefined>(undefined);
  readonly weight = input<BipHeadingWeight>('semibold');

  private readonly tagLevel: BipHeadingLevel | undefined =
    TAG_LEVEL[this.elementRef.nativeElement.tagName];

  protected readonly resolvedLevel = computed(() => this.level() ?? this.tagLevel ?? 2);

  protected readonly ariaRole = computed(() => (this.tagLevel === undefined ? 'heading' : null));
  protected readonly ariaLevel = computed(() =>
    this.tagLevel === undefined ? this.resolvedLevel() : null
  );

  protected readonly hostClasses = computed(() => {
    const resolvedSize = this.size() ?? DEFAULT_SIZE_BY_LEVEL[this.resolvedLevel()];
    return `${SIZE_CLASS[resolvedSize]} ${WEIGHT_CLASS[this.weight()]}`;
  });
}
