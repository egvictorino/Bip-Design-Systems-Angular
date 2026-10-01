import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { TemplatePortal } from '@angular/cdk/portal';
import type { OverlayRef } from '@angular/cdk/overlay';
import { BipOverlay, injectBipLocale } from '@bip-design-systems/angular/core';
import { BipImagePopover } from './image-popover.component';
import { BipNotePopover } from './note-popover.component';
import { BipToothSvg } from './tooth-svg.component';
import {
  WHOLE_TOOTH_CONDITIONS,
  type SurfaceCondition,
  type ToothCondition,
  type ToothData,
  type ToothImage,
  type ToothSurface,
} from './odontogram.types';

export type { ToothCondition } from './odontogram.types';

interface OverlayPosition {
  top: number;
  left: number;
}

/**
 * Panel de detalle de un diente — puerto de `ToothDetail` (React). Se abre bajo la cuadrícula
 * principal al seleccionar un diente en `<bip-odontogram>`; permite pintar condiciones por
 * superficie (toolbar de herramientas), ver/editar la nota y las imágenes adjuntas.
 *
 * Los popovers de nota/imágenes van vía `BipOverlay` (regla transversal del CLAUDE.md), con
 * `position: fixed` calculada desde el `getBoundingClientRect()` del botón disparador en el
 * momento de abrir — igual que la referencia React (`createPortal` a `document.body` +
 * coordenadas de viewport), en vez de `FlexibleConnectedPositionStrategy` del CDK.
 */
@Component({
  selector: 'bip-tooth-detail',
  standalone: true,
  imports: [BipToothSvg, BipNotePopover, BipImagePopover],
  templateUrl: './tooth-detail.component.html',
  styleUrl: './tooth-detail.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BipToothDetail {
  readonly toothNumber = input.required<number>();
  readonly arch = input.required<'upper' | 'lower'>();
  readonly data = input.required<ToothData>();
  readonly disabled = input.required<boolean>();

  readonly dataChange = output<ToothData>();
  readonly closed = output<void>();

  protected readonly locale = injectBipLocale();

  protected readonly activeTool = signal<ToothCondition>('caries');

  protected readonly noteOpen = signal(false);
  protected readonly notePosition = signal<OverlayPosition | null>(null);

  protected readonly imageOpen = signal(false);
  protected readonly imagePosition = signal<OverlayPosition | null>(null);

  protected readonly toothName = computed(
    () => this.locale().odontogram.toothNames[this.toothNumber()] ?? ''
  );
  protected readonly hasNote = computed(() => Boolean(this.data().notes));
  protected readonly imageCount = computed(() => this.data().images?.length ?? 0);

  protected readonly conditionEntries = computed(() =>
    (Object.entries(this.locale().odontogram.conditionLabels) as [ToothCondition, string][]).map(
      ([condition, label]) => ({ condition, label })
    )
  );

  @ViewChild('noteTriggerBtn') private readonly noteTriggerBtn?: ElementRef<HTMLButtonElement>;
  @ViewChild('imageTriggerBtn') private readonly imageTriggerBtn?: ElementRef<HTMLButtonElement>;

  @ViewChild('noteOverlayTemplate', { static: true })
  private readonly noteOverlayTemplate!: TemplateRef<unknown>;
  @ViewChild('imageOverlayTemplate', { static: true })
  private readonly imageOverlayTemplate!: TemplateRef<unknown>;

  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly bipOverlay = inject(BipOverlay);
  private readonly injector = inject(Injector);

  private noteOverlayRef: OverlayRef | null = null;
  private imageOverlayRef: OverlayRef | null = null;

  constructor() {
    effect(() => {
      const open = this.noteOpen();
      untracked(() => {
        if (open) this.showNoteOverlay();
        else this.hideNoteOverlay();
      });
    });
    effect(() => {
      const open = this.imageOpen();
      untracked(() => {
        if (open) this.showImageOverlay();
        else this.hideImageOverlay();
      });
    });

    // Si el componente se destruye con un popover abierto, nadie más dispondría el overlay.
    inject(DestroyRef).onDestroy(() => {
      this.noteOverlayRef?.dispose();
      this.noteOverlayRef = null;
      this.imageOverlayRef?.dispose();
      this.imageOverlayRef = null;
    });
  }

  protected handleSurfaceClick(surface: ToothSurface): void {
    const current = this.data();
    const tool = this.activeTool();

    if (WHOLE_TOOTH_CONDITIONS.has(tool)) {
      this.dataChange.emit({ ...current, condition: tool, surfaces: {} });
      return;
    }

    const hadWholeTooth = current.condition != null;
    const baseSurfaces = hadWholeTooth ? {} : (current.surfaces ?? {});
    const newSurfaces: SurfaceCondition = { ...baseSurfaces };

    if (tool === 'healthy') {
      delete newSurfaces[surface];
    } else {
      newSurfaces[surface] = tool;
    }

    this.dataChange.emit({
      ...current,
      condition: hadWholeTooth ? undefined : current.condition,
      surfaces: newSurfaces,
    });
  }

  protected handleNoteOpen(event: MouseEvent): void {
    const rect = (event.currentTarget as HTMLButtonElement).getBoundingClientRect();
    this.notePosition.set({ top: rect.bottom + 4, left: rect.left });
    this.noteOpen.set(true);
  }

  protected handleNoteClose(): void {
    this.noteOpen.set(false);
    this.notePosition.set(null);
  }

  protected handleNoteSave(note: string): void {
    const trimmed = note.trim();
    const updated: ToothData = { ...this.data() };
    if (trimmed) {
      updated.notes = trimmed;
    } else {
      delete updated.notes;
    }
    this.dataChange.emit(updated);
    this.noteOpen.set(false);
    this.notePosition.set(null);
  }

  protected handleImageOpen(event: MouseEvent): void {
    const rect = (event.currentTarget as HTMLButtonElement).getBoundingClientRect();
    this.imagePosition.set({ top: rect.bottom + 4, left: rect.left });
    this.imageOpen.set(true);
  }

  protected handleImageClose(): void {
    this.imageOpen.set(false);
    this.imagePosition.set(null);
  }

  protected handleImageSave(images: ToothImage[]): void {
    const current = { ...this.data() };
    if (images.length > 0) {
      current.images = images;
    } else {
      delete current.images;
    }
    this.dataChange.emit(current);
  }

  private showNoteOverlay(): void {
    if (this.noteOverlayRef) return;
    const overlayRef = this.bipOverlay.create({}, this.injector);
    overlayRef.attach(new TemplatePortal(this.noteOverlayTemplate, this.viewContainerRef));
    overlayRef.keydownEvents().subscribe((event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        this.handleNoteClose();
      }
    });
    this.noteOverlayRef = overlayRef;
  }

  private hideNoteOverlay(): void {
    this.noteOverlayRef?.dispose();
    this.noteOverlayRef = null;
    this.noteTriggerBtn?.nativeElement.focus();
  }

  private showImageOverlay(): void {
    if (this.imageOverlayRef) return;
    const overlayRef = this.bipOverlay.create({}, this.injector);
    overlayRef.attach(new TemplatePortal(this.imageOverlayTemplate, this.viewContainerRef));
    overlayRef.keydownEvents().subscribe((event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        this.handleImageClose();
      }
    });
    this.imageOverlayRef = overlayRef;
  }

  private hideImageOverlay(): void {
    this.imageOverlayRef?.dispose();
    this.imageOverlayRef = null;
    this.imageTriggerBtn?.nativeElement.focus();
  }
}
