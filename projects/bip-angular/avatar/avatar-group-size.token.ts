import { InjectionToken, type Signal } from '@angular/core';
import type { BipSizeExtended } from '@bip-design-systems/angular/core';

/**
 * Cascada de `size` de `<bip-avatar-group>` hacia cada `<bip-avatar>` proyectado — equivalente
 * Angular a `React.cloneElement(child, { size })` de la referencia: en vez de clonar/mutar el
 * hijo, el padre provee el valor vía DI y el hijo lo lee como fallback si no trae su propio
 * `size` explícito. Token separado (no la clase `BipAvatarGroup`) para que `avatar.component.ts`
 * y `avatar-group.component.ts` no se importen circularmente entre sí.
 */
export const BIP_AVATAR_GROUP_SIZE = new InjectionToken<Signal<BipSizeExtended>>(
  'BIP_AVATAR_GROUP_SIZE'
);
