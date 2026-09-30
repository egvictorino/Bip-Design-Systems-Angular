import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input } from '@angular/core';

export type BipStackGap =
  | '0'
  | '0-5'
  | '1'
  | '1-5'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '8'
  | '10'
  | '12'
  | '16';
export type BipStackDirection = 'row' | 'column';
export type BipStackAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
export type BipStackJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

const GAP_CLASS: Record<BipStackGap, string> = {
  '0': 'bip-stack--gap-0',
  '0-5': 'bip-stack--gap-0-5',
  '1': 'bip-stack--gap-1',
  '1-5': 'bip-stack--gap-1-5',
  '2': 'bip-stack--gap-2',
  '3': 'bip-stack--gap-3',
  '4': 'bip-stack--gap-4',
  '5': 'bip-stack--gap-5',
  '6': 'bip-stack--gap-6',
  '8': 'bip-stack--gap-8',
  '10': 'bip-stack--gap-10',
  '12': 'bip-stack--gap-12',
  '16': 'bip-stack--gap-16',
};

const ALIGN_CLASS: Record<BipStackAlign, string> = {
  start: 'bip-stack--align-start',
  center: 'bip-stack--align-center',
  end: 'bip-stack--align-end',
  stretch: 'bip-stack--align-stretch',
  baseline: 'bip-stack--align-baseline',
};

const JUSTIFY_CLASS: Record<BipStackJustify, string> = {
  start: 'bip-stack--justify-start',
  center: 'bip-stack--justify-center',
  end: 'bip-stack--justify-end',
  between: 'bip-stack--justify-between',
  around: 'bip-stack--justify-around',
  evenly: 'bip-stack--justify-evenly',
};

/**
 * Primitiva de layout para disposiciones flex unidimensionales — ver también `bipGrid` para
 * layouts bidimensionales. Selector de atributo: solo aplica clases al elemento host elegido
 * por el consumidor (`<div bipStack direction="row">`), no restructura contenido.
 */
@Component({
  selector: '[bipStack]',
  template: `<ng-content />`,
  styleUrl: './stack.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'bip-stack',
    '[class]': 'hostClasses()',
  },
})
export class BipStack {
  readonly direction = input<BipStackDirection>('column');
  readonly gap = input<BipStackGap>('4');
  readonly align = input<BipStackAlign | undefined>(undefined);
  readonly justify = input<BipStackJustify | undefined>(undefined);
  readonly wrap = input(false, { transform: booleanAttribute });

  protected readonly hostClasses = computed(() => {
    const align = this.align();
    const justify = this.justify();
    return [
      this.direction() === 'row' ? 'bip-stack--row' : 'bip-stack--column',
      GAP_CLASS[this.gap()],
      align ? ALIGN_CLASS[align] : '',
      justify ? JUSTIFY_CLASS[justify] : '',
      this.wrap() ? 'bip-stack--wrap' : '',
    ]
      .filter(Boolean)
      .join(' ');
  });
}
