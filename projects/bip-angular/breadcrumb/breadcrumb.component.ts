import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  input,
  TemplateRef,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { injectBipLocale } from '@bip-design-systems/angular/core';
import { BipBreadcrumbSeparator } from './breadcrumb-separator.directive';

export interface BipBreadcrumbItem {
  readonly label: string;
  readonly href?: string;
  readonly routerLink?: string | unknown[];
  readonly queryParams?: Record<string, unknown>;
}

/**
 * Sin partes compuestas ni contexto: el consumidor pasa `items`, el componente arma la lista.
 * El último item siempre se renderiza como texto no interactivo con `aria-current="page"` —
 * incluso si trae `href`/`routerLink` (igual que la referencia React: la página actual no
 * necesita ser un link a sí misma). El separador es reemplazable vía
 * `<ng-template bipBreadcrumbSeparator>` proyectado (no `<ng-content>` directo, porque el
 * separador se repite una vez por item — `<ng-content>` solo puede proyectar un nodo una vez).
 */
@Component({
  selector: 'bip-breadcrumb',
  imports: [NgTemplateOutlet, RouterLink],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'bip-breadcrumb' },
})
export class BipBreadcrumb {
  private readonly locale = injectBipLocale();

  readonly items = input.required<readonly BipBreadcrumbItem[]>();
  readonly ariaLabel = input<string | undefined>(undefined);

  protected readonly resolvedAriaLabel = computed(
    () => this.ariaLabel() ?? this.locale().breadcrumb.nav
  );

  protected readonly separatorTemplate = contentChild(BipBreadcrumbSeparator, {
    read: TemplateRef,
  });
}
