import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { injectBipLocale } from '@bip-design-systems/angular/core';
import { BIP_SIDEBAR_CONTEXT } from './sidebar-context';

/** Mejora un `<button>` nativo — alterna `collapsed` en el `<bip-sidebar>` ancestro. */
@Component({
  selector: 'button[bipSidebarTrigger]',
  template: `<ng-content />`,
  styleUrl: './sidebar-trigger.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'bip-sidebar-trigger',
    '[attr.aria-label]':
      'context.isCollapsed() ? locale().sidebar.expand : locale().sidebar.collapse',
    '[attr.aria-expanded]': '!context.isCollapsed()',
    '[attr.aria-controls]': 'context.sidebarId',
    '(click)': 'context.toggleCollapsed()',
  },
})
export class BipSidebarTrigger {
  protected readonly locale = injectBipLocale();

  protected readonly context = (() => {
    const ctx = inject(BIP_SIDEBAR_CONTEXT, { optional: true });
    if (!ctx) {
      throw new Error('<button bipSidebarTrigger> debe usarse dentro de <bip-sidebar>');
    }
    return ctx;
  })();
}
