import type { FocusableOption } from '@angular/cdk/a11y';

/**
 * Base para que `BipDropdownMenu` pueda consultar `contentChildren(BipDropdownFocusableItem)` y
 * encontrar tanto `[bipDropdownItem]` como `<bip-dropdown-item-checkbox>` con una sola query —
 * cada uno se registra como este token vía `providers: [{ provide: BipDropdownFocusableItem,
 * useExisting: ... }]` (evita que la query dependa de una clase concreta). Implementa
 * `FocusableOption` del CDK para poder pasarse directo a un `FocusKeyManager`.
 */
export abstract class BipDropdownFocusableItem implements FocusableOption {
  abstract focus(): void;
  /** Nombrado `isDisabled` (no `disabled`) para no chocar con el input nativo/de componente
   * de cada implementación — `@angular-eslint/no-input-rename` prohíbe alias en inputs, así que
   * `BipDropdownSubmenu` no puede exponer su input `disabled` bajo otro nombre y reservar
   * `disabled` para este getter. */
  abstract readonly isDisabled: boolean;
  /** El `<bip-dropdown-menu>`/`<bip-dropdown-submenu>` más cercano — ver dropdown-menu-scope.ts. */
  abstract readonly menuScope: unknown;
}
