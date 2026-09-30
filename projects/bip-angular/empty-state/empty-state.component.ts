import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { BipSize } from '@bip-design-systems/angular/core';

const SIZE_CLASS: Record<BipSize, string> = {
  sm: 'bip-empty-state--sm',
  md: 'bip-empty-state--md',
  lg: 'bip-empty-state--lg',
};

const ICON_BOX_SIZE_CLASS: Record<BipSize, string> = {
  sm: 'bip-empty-state-icon-box--sm',
  md: 'bip-empty-state-icon-box--md',
  lg: 'bip-empty-state-icon-box--lg',
};

const TITLE_SIZE_CLASS: Record<BipSize, string> = {
  sm: 'bip-empty-state-title--sm',
  md: 'bip-empty-state-title--md',
  lg: 'bip-empty-state-title--lg',
};

const DESCRIPTION_SIZE_CLASS: Record<BipSize, string> = {
  sm: 'bip-empty-state-description--sm',
  md: 'bip-empty-state-description--md',
  lg: 'bip-empty-state-description--lg',
};

/**
 * Placeholder para listas/vistas sin datos. El ícono (`[bipEmptyStateIcon]`) y la acción
 * (`[bipEmptyStateAction]`) son slots vía `<ng-content select>` — el ícono tiene contenido de
 * fallback nativo de Angular (`<ng-content>` con hijos = contenido por defecto cuando nada
 * matchea el `select`), y la acción se estiliza vía `::ng-deep` + el propio atributo marcador
 * (sin wrapper extra) para que no renderice un `<div>` vacío cuando no se proyecta nada.
 */
@Component({
  selector: 'bip-empty-state',
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'bip-empty-state',
    '[class]': 'hostClasses()',
  },
})
export class BipEmptyState {
  readonly title = input.required<string>();
  readonly description = input<string | undefined>(undefined);
  readonly size = input<BipSize>('md');

  protected readonly hostClasses = computed(() => SIZE_CLASS[this.size()]);
  protected readonly iconBoxClasses = computed(
    () => `bip-empty-state-icon-box ${ICON_BOX_SIZE_CLASS[this.size()]}`
  );
  protected readonly titleClasses = computed(
    () => `bip-empty-state-title ${TITLE_SIZE_CLASS[this.size()]}`
  );
  protected readonly descriptionClasses = computed(
    () => `bip-empty-state-description ${DESCRIPTION_SIZE_CLASS[this.size()]}`
  );
}
