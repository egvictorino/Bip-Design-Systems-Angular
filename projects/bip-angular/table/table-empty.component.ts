import { ChangeDetectionStrategy, Component, computed, inject, numberAttribute, input } from '@angular/core';
import { injectBipLocale } from '@bip-design-systems/angular/core';
import { BIP_TABLE_CONTEXT } from './table-context';

/**
 * Fila de "sin datos" — selector `tr[bipTableEmpty]` (el componente ES la fila, no la envuelve)
 * con una única `<td colspan>` interna. El mensaje por defecto sale del locale
 * (`table.emptyMessage`); el consumidor puede sobreescribirlo proyectando contenido
 * (`<ng-content>` con fallback, igual que `BipEmptyState`).
 */
@Component({
  selector: 'tr[bipTableEmpty]',
  standalone: true,
  template: `
    <td [attr.colspan]="colSpan()" [class]="cellClasses()">
      <ng-content>{{ locale().table.emptyMessage }}</ng-content>
    </td>
  `,
  styleUrl: './table-empty.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BipTableEmpty {
  protected readonly locale = injectBipLocale();

  private readonly context = (() => {
    const ctx = inject(BIP_TABLE_CONTEXT, { optional: true });
    if (!ctx) {
      throw new Error('<tr bipTableEmpty> debe usarse dentro de <bip-table>');
    }
    return ctx;
  })();

  readonly colSpan = input.required<number, unknown>({ transform: numberAttribute });

  protected readonly cellClasses = computed(
    () => `bip-table-cell-empty ${this.context.compact() ? 'bip-table-cell--compact' : 'bip-table-cell--normal'}`
  );
}
