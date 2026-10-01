import { InjectionToken } from '@angular/core';

/**
 * Identifica qué `<bip-dropdown-menu>`/`<bip-dropdown-submenu>` es dueño "directo" de un
 * `[bipDropdownItem]`/`<bip-dropdown-item-checkbox>` — hace falta porque `contentChildren(...,
 * { descendants: true })` también atraviesa las plantillas de componentes hijos (como el panel
 * interno de un `<bip-dropdown-submenu>`), así que sin este filtro el `FocusKeyManager` del
 * menú raíz navegaría también por los items de un submenú cerrado. Puerto de `getDirectItems()`
 * (React), que compara `.closest('[role="menu"]') === menu` sobre el DOM — aquí se resuelve con
 * jerarquía de injectors en vez de recorrer el DOM: cada `<bip-dropdown-menu>`/`<bip-dropdown-submenu>`
 * se provee a sí mismo como este token, así que un item inyecta "el menú/submenú más cercano".
 */
export const BIP_DROPDOWN_MENU_SCOPE = new InjectionToken<unknown>('BIP_DROPDOWN_MENU_SCOPE');
