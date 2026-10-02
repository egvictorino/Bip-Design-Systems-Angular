import { ChangeDetectionStrategy, Component, booleanAttribute, input } from '@angular/core';
import { BIP_TABLE_CONTEXT, type BipTableContext } from './table-context';

/**
 * Envuelve `<table>` en un `div` con scroll horizontal (`overflow-x: auto`) — necesario porque
 * el borde/radius vive en el wrapper, no en la propia `<table>` (igual que `Table.module.css`
 * de la referencia). Compound component (contexto + estructura): a diferencia de
 * `BipTabs`/`BipDropdown` (que solo proveen contexto sobre `<ng-content>`), aquí sí hay markup
 * propio porque la referencia React también envuelve `<table>` en un `div.wrapper`.
 */
@Component({
  selector: 'bip-table',
  template: `
    <table class="bip-table">
      @if (caption()) {
        <caption class="bip-table-caption">{{ caption() }}</caption>
      }
      <ng-content />
    </table>
  `,
  styleUrl: './table.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: BIP_TABLE_CONTEXT, useExisting: BipTable }],
  host: { class: 'bip-table-wrapper' },
})
export class BipTable implements BipTableContext {
  readonly striped = input(false, { transform: booleanAttribute });
  readonly compact = input(false, { transform: booleanAttribute });
  readonly stickyHeader = input(false, { transform: booleanAttribute });
  readonly caption = input<string | undefined>(undefined);
}
