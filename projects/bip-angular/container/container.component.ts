import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Coincide con la escala `BREAKPOINTS` (`sm`/`md`/`lg`/`xl`, ver `core/utils/breakpoints.ts`); `'full'` quita el tope. */
export type BipContainerMaxWidth = 'sm' | 'md' | 'lg' | 'xl' | 'full';

const MAX_WIDTH_CLASS: Record<BipContainerMaxWidth, string> = {
  sm: 'bip-container--max-sm',
  md: 'bip-container--max-md',
  lg: 'bip-container--max-lg',
  xl: 'bip-container--max-xl',
  full: 'bip-container--max-full',
};

/**
 * Centra contenido y limita su ancho — la primitiva de layout más externa, envuelve
 * composiciones de `bipStack`/`bipGrid`. Puerto de `<Container as="div">` (React): en vez de una
 * prop `as`, el consumidor elige el elemento host (`<section bipContainer>`, `<main
 * bipContainer>`...) — selector de atributo porque solo aplica clases, no restructura contenido.
 */
@Component({
  selector: '[bipContainer]',
  template: `<ng-content />`,
  styleUrl: './container.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'bip-container',
    '[class]': 'maxWidthClass()',
  },
})
export class BipContainer {
  readonly maxWidth = input<BipContainerMaxWidth>('lg');

  protected readonly maxWidthClass = computed(() => MAX_WIDTH_CLASS[this.maxWidth()]);
}
