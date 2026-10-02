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
  formatFileSize,
  injectBipLocale,
} from '@bip-design-systems/angular/core';
import { IMAGE_TYPES, type ToothImage, type ToothImageType } from './odontogram.types';

/** 10 MB — por encima de eso, una imagen convertida a data URL (ver handleFileChange) empieza
 * a ser un string base64 pesado de cargar en memoria; es un tope defensivo, no una regla de
 * negocio (a diferencia de FileUpload, aquí no hay `maxSize` en la referencia React). */
const DEFAULT_MAX_IMAGE_SIZE = 10 * 1024 * 1024;

export interface BipRejectedImage {
  file: File;
  reason: 'type' | 'size';
}

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
  /** Tamaño máximo en bytes antes de convertir el archivo a data URL. */
  readonly maxImageSize = input<number>(DEFAULT_MAX_IMAGE_SIZE);

  readonly closed = output<void>();
  /** Emite el array completo de imágenes cada vez que cambia (alta o baja). */
  readonly save = output<ToothImage[]>();
  /** Un archivo elegido que no es una imagen o supera `maxImageSize`. */
  readonly rejectedImage = output<BipRejectedImage>();

  protected readonly locale = injectBipLocale();
  protected readonly imageTypes = IMAGE_TYPES;
  protected readonly addTypeId = inject(BipIdGenerator).next('bip-image-popover-type');

  protected readonly images = signal<ToothImage[]>([]);
  protected readonly selectedIdx = signal<number | null>(null);
  protected readonly adding = signal(false);
  protected readonly fileError = signal<string | null>(null);
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

    // `accept="image/*"` en el <input> es solo una pista para el picker del sistema — el
    // usuario puede elegir "todos los archivos" y seleccionar cualquier cosa igual, así que
    // el tipo y el tamaño se revalidan aquí antes de leer el archivo. Sin el tope de tamaño,
    // un archivo grande convertido a data URL (string base64 completo en memoria, ver más
    // abajo) puede ser bastante más pesado que el propio archivo.
    if (!file.type.startsWith('image/')) {
      this.fileError.set(this.locale().odontogram.invalidImageType);
      this.rejectedImage.emit({ file, reason: 'type' });
      return;
    }
    const maxSize = this.maxImageSize();
    if (file.size > maxSize) {
      this.fileError.set(this.locale().odontogram.imageTooLarge(formatFileSize(maxSize)));
      this.rejectedImage.emit({ file, reason: 'size' });
      return;
    }
    this.fileError.set(null);

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
