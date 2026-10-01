import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { A11yModule } from '@angular/cdk/a11y';
import {
  BipIdGenerator,
  BipVisuallyHidden,
  injectBipLocale,
} from '@bip-design-systems/angular/core';
import { IMAGE_TYPES, type ToothImage, type ToothImageType } from './odontogram.types';

interface BipOverlayPosition {
  top: number;
  left: number;
}

/**
 * Popover de imágenes de un diente — puerto de `ImagePopover` (React). Auto-contenido como
 * `BipNotePopover` (backdrop + diálogo con `cdkTrapFocus` en su propia plantilla). Gestiona su
 * propia galería (miniaturas + vista previa) y el formulario de alta (`<input type="file">`
 * oculto vía `<bip-visually-hidden>`, nunca `display:none`, para no perder el input del teclado
 * nativo); cada alta/baja emite `save` de inmediato — a diferencia de `BipNotePopover`, este
 * popover no se cierra al guardar.
 */
@Component({
  selector: 'bip-image-popover',
  imports: [A11yModule, BipVisuallyHidden],
  templateUrl: './image-popover.component.html',
  styleUrl: './image-popover.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BipImagePopover implements OnInit {
  readonly toothNumber = input.required<number>();
  readonly initialImages = input.required<ToothImage[]>();
  readonly editable = input.required<boolean>();
  readonly position = input.required<BipOverlayPosition>();

  readonly closed = output<void>();
  /** Emite el array completo de imágenes cada vez que cambia (alta o baja). */
  readonly save = output<ToothImage[]>();

  protected readonly locale = injectBipLocale();
  protected readonly imageTypes = IMAGE_TYPES;
  protected readonly addTypeId = inject(BipIdGenerator).next('bip-image-popover-type');

  protected readonly images = signal<ToothImage[]>([]);
  protected readonly selectedIdx = signal<number | null>(null);
  protected readonly adding = signal(false);
  protected readonly addType = signal<ToothImageType>('radiograph');
  protected readonly addUrl = signal('');

  protected readonly selectedImage = computed(() => {
    const idx = this.selectedIdx();
    return idx !== null ? (this.images()[idx] ?? null) : null;
  });

  @ViewChild('fileInputRef') private readonly fileInputRef?: ElementRef<HTMLInputElement>;
  @ViewChild('addSelectRef') private readonly addSelectRef?: ElementRef<HTMLSelectElement>;
  @ViewChild('closeButtonRef') private readonly closeButtonRef?: ElementRef<HTMLButtonElement>;

  constructor() {
    effect(() => {
      const isAdding = this.adding();
      untracked(() => {
        queueMicrotask(() => {
          if (isAdding) this.addSelectRef?.nativeElement.focus();
          else this.closeButtonRef?.nativeElement.focus();
        });
      });
    });
  }

  ngOnInit(): void {
    const initialImages = this.initialImages();
    this.images.set(initialImages);
    this.selectedIdx.set(initialImages.length > 0 ? 0 : null);
    this.adding.set(initialImages.length === 0 && this.editable());
  }

  protected selectImage(idx: number): void {
    this.selectedIdx.set(idx === this.selectedIdx() ? null : idx);
  }

  protected openFilePicker(): void {
    this.fileInputRef?.nativeElement.click();
  }

  protected handleFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (typeof result === 'string') this.addUrl.set(result);
    };
    reader.readAsDataURL(file);
  }

  protected handleAddConfirm(): void {
    const url = this.addUrl();
    if (!url) return;

    const newImage: ToothImage = { type: this.addType(), url };
    const updated = [...this.images(), newImage];
    this.images.set(updated);
    this.selectedIdx.set(updated.length - 1);
    this.save.emit(updated);
    this.adding.set(false);
    this.addUrl.set('');
    this.addType.set('radiograph');
  }

  protected handleAddCancel(): void {
    this.adding.set(false);
    this.addUrl.set('');
    this.addType.set('radiograph');
  }

  protected handleDelete(idx: number): void {
    const updated = this.images().filter((_, i) => i !== idx);
    this.images.set(updated);
    this.selectedIdx.set(updated.length > 0 ? Math.min(idx, updated.length - 1) : null);
    this.save.emit(updated);
    if (updated.length === 0 && this.editable()) this.adding.set(true);
  }

  protected startAdding(): void {
    this.adding.set(true);
  }
}
