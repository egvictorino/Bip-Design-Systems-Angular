import { APP_ID, Injectable, inject } from '@angular/core';

/**
 * Puerto de `useId()` (React) — `inject(BipIdGenerator).next('bip-input')` genera un id único
 * y estable, con un contador por app (no global) para que dos `<app-root>` en la misma página
 * (p. ej. micro-frontends) no colisionen, y un prefijo de `APP_ID` para que el id sea estable
 * entre el render de servidor y el de cliente en SSR (hidratación). Nunca derivar un id del
 * label/texto del control — eso rompe si el texto cambia (i18n) o se repite.
 */
@Injectable({ providedIn: 'root' })
export class BipIdGenerator {
  private readonly appId = inject(APP_ID);
  private counter = 0;

  next(prefix: string): string {
    this.counter += 1;
    return `${prefix}-${this.appId}-${this.counter}`;
  }
}
