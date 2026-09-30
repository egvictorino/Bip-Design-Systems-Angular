import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type BipGridColumns = 1 | 2 | 3 | 4 | 5 | 6 | 12;
export type BipGridColumnsOrResponsive = BipGridColumns | 'responsive';
export type BipGridGap = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '8' | '10' | '12' | '16';

const COLUMNS_CLASS: Record<BipGridColumnsOrResponsive, string> = {
  1: 'bip-grid--cols-1',
  2: 'bip-grid--cols-2',
  3: 'bip-grid--cols-3',
  4: 'bip-grid--cols-4',
  5: 'bip-grid--cols-5',
  6: 'bip-grid--cols-6',
  12: 'bip-grid--cols-12',
  responsive: 'bip-grid--cols-responsive',
};

const GAP_CLASS: Record<BipGridGap, string> = {
  '0': 'bip-grid--gap-0',
  '1': 'bip-grid--gap-1',
  '2': 'bip-grid--gap-2',
  '3': 'bip-grid--gap-3',
  '4': 'bip-grid--gap-4',
  '5': 'bip-grid--gap-5',
  '6': 'bip-grid--gap-6',
  '8': 'bip-grid--gap-8',
  '10': 'bip-grid--gap-10',
  '12': 'bip-grid--gap-12',
  '16': 'bip-grid--gap-16',
};

/**
 * Primitiva de layout bidimensional. `columns` fijo es 1 columna por debajo de `md` (768px,
 * mobile-first, ver `core/utils/breakpoints.ts`). Selector de atributo: solo aplica clases al
 * elemento host elegido por el consumidor.
 */
@Component({
  selector: '[bipGrid]',
  template: `<ng-content />`,
  styleUrl: './grid.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'bip-grid',
    '[class]': 'hostClasses()',
  },
})
export class BipGrid {
  readonly columns = input<BipGridColumnsOrResponsive>('responsive');
  readonly gap = input<BipGridGap>('4');

  protected readonly hostClasses = computed(
    () => `${COLUMNS_CLASS[this.columns()]} ${GAP_CLASS[this.gap()]}`
  );
}
