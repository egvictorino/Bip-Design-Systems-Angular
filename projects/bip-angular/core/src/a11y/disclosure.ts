import { type Signal, signal } from '@angular/core';

export interface Disclosure {
  readonly isOpen: Signal<boolean>;
  open(): void;
  close(): void;
  toggle(): void;
}

/**
 * Estado abierto/cerrado con signals — el patrón que cada consumidor de Modal/Drawer/Dropdown
 * repetiría a mano. Puerto de `useDisclosure()` (React); llamar dentro de un campo de clase o
 * `constructor` del componente, como cualquier otro helper basado en signals de este repo.
 */
export function disclosure(defaultOpen = false): Disclosure {
  const isOpenSignal = signal(defaultOpen);

  return {
    isOpen: isOpenSignal.asReadonly(),
    open: () => isOpenSignal.set(true),
    close: () => isOpenSignal.set(false),
    toggle: () => isOpenSignal.update((value) => !value),
  };
}
