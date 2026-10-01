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
  abstract readonly disabled: boolean;
}
