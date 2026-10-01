import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { injectBipLocale } from '@bip-design-systems/angular/core';

/**
 * `[(value)]` en vez de `value`+`onChange` de React. El `(keydown)` deja pasar Escape (para que
 * `<bip-dropdown-menu>` lo capture y cierre el menú) y bloquea el resto — evita que
 * ArrowUp/Down/Home/End muevan el `FocusKeyManager` mientras se está escribiendo.
 */
@Component({
  selector: 'bip-dropdown-search',
  template: `
    <input
      type="text"
      role="searchbox"
      class="bip-dropdown-search-input"
      [attr.aria-label]="locale().dropdown.search"
      [placeholder]="resolvedPlaceholder()"
      [value]="value()"
      (input)="onInput($event)"
      (keydown)="onKeydown($event)"
    />
  `,
  styleUrl: './dropdown-search.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'bip-dropdown-search' },
})
export class BipDropdownSearch {
  protected readonly locale = injectBipLocale();

  readonly value = model('');
  readonly placeholder = input<string | undefined>(undefined);

  protected readonly resolvedPlaceholder = computed(
    () => this.placeholder() ?? this.locale().dropdown.searchPlaceholder
  );

  protected onInput(event: Event): void {
    this.value.set((event.target as HTMLInputElement).value);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Escape') {
      event.stopPropagation();
    }
  }
}
