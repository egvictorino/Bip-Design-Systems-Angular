import { isPlatformBrowser } from '@angular/common';
import { Injectable, Injector, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { ComponentPortal } from '@angular/cdk/portal';
import type { OverlayRef } from '@angular/cdk/overlay';
import { BipOverlay } from '@bip-design-systems/angular/core';
import { BIP_TOAST_CONFIG } from './provide-bip-toast';
import { BipToastRegion } from './toast-region.component';
import type { BipToastConfig, BipToastItem, BipToastPosition } from './toast.types';

const DEFAULT_DURATION = 5000;
/** Debe calzar con la transición de salida en toast-item.component.css. */
const EXIT_DURATION_MS = 250;

/**
 * `BipToast.show({...})` — equivalente a `useToast().addToast(...)` de React, pero sin
 * `<ToastProvider>` envolviendo el árbol: `providedIn: 'root'` + `provideBipToast()` (opcional,
 * solo para `max`/`position`) bastan. El overlay (vía `BipOverlay`, nunca `Overlay` directo) se
 * crea de forma perezosa en el primer `show()`, no en la construcción del servicio — así no hay
 * coste ni nodo en el DOM hasta que algo realmente muestra un toast.
 */
@Injectable({ providedIn: 'root' })
export class BipToast {
  private readonly config = inject(BIP_TOAST_CONFIG);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly bipOverlay = inject(BipOverlay);
  private readonly injector = inject(Injector);

  private readonly itemsSignal = signal<BipToastItem[]>([]);
  readonly items = this.itemsSignal.asReadonly();
  readonly position = computed<BipToastPosition>(() => this.config.position);

  private nextId = 0;
  private overlayRef: OverlayRef | null = null;

  /** Devuelve el id del toast (útil para `dismiss(id)` manual); `-1` en SSR (no-op). */
  show(config: BipToastConfig): number {
    if (!isPlatformBrowser(this.platformId)) return -1;

    this.ensureOverlay();
    const id = ++this.nextId;
    const max = this.config.max;
    this.itemsSignal.update((items) => {
      const next = [...items, { ...config, id, exiting: false }];
      return next.length > max ? next.slice(next.length - max) : next;
    });

    const duration = config.duration ?? DEFAULT_DURATION;
    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }
    return id;
  }

  /** Inicia la animación de salida; el item se quita de `items()` al terminar (ver EXIT_DURATION_MS). */
  dismiss(id: number): void {
    const current = this.itemsSignal().find((item) => item.id === id);
    if (!current || current.exiting) return;

    this.itemsSignal.update((items) =>
      items.map((item) => (item.id === id ? { ...item, exiting: true } : item))
    );
    setTimeout(() => {
      this.itemsSignal.update((items) => items.filter((item) => item.id !== id));
    }, EXIT_DURATION_MS);
  }

  private ensureOverlay(): void {
    if (this.overlayRef) return;
    this.overlayRef = this.bipOverlay.create({ hasBackdrop: false }, this.injector);
    this.overlayRef.attach(new ComponentPortal(BipToastRegion, null, this.injector));
  }
}
