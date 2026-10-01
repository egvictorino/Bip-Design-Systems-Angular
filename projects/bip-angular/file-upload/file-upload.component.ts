import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  effect,
  model,
  output,
  signal,
} from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import { BipFormControlBase, injectBipLocale } from '@bip-design-systems/angular/core';
import type { BipSize } from '@bip-design-systems/angular/core';
import { BipSpinner } from '@bip-design-systems/angular/spinner';
import { input as ngInput } from '@angular/core';

export type BipFileUploadVariant = 'default' | 'compact';

export interface BipRejectedFile {
  file: File;
  reason: 'size' | 'count';
}

const OUTER_LABEL_SIZE_CLASS: Record<BipSize, string> = {
  sm: 'bip-file-upload-outer-label--sm',
  md: 'bip-file-upload-outer-label--md',
  lg: 'bip-file-upload-outer-label--lg',
};

const HELPER_SIZE_CLASS: Record<BipSize, string> = {
  sm: 'bip-file-upload-helper--sm',
  md: 'bip-file-upload-helper--sm',
  lg: 'bip-file-upload-helper--lg',
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * `value` es `File[]` (CVA). El `<label>` ES la zona de drop y el disparador del selector de
 * archivos nativo — el `<input type="file">` real queda visualmente oculto pero mantiene foco
 * y teclado nativos (Enter/Espacio sobre el label activa el input).
 */
@Component({
  selector: 'bip-file-upload',
  imports: [BipSpinner],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'bip-file-upload-wrapper',
    '[class.bip-file-upload-wrapper--full-width]': 'fullWidth()',
  },
})
export class BipFileUpload extends BipFormControlBase implements ControlValueAccessor {
  protected readonly locale = injectBipLocale();

  readonly value = model<File[]>([]);

  readonly label = ngInput<string>('');
  readonly helperText = ngInput<string>('');
  readonly error = ngInput(false, { transform: booleanAttribute });
  readonly errorMessage = ngInput<string>('');
  readonly fullWidth = ngInput(false, { transform: booleanAttribute });
  readonly required = ngInput(false, { transform: booleanAttribute });
  readonly loading = ngInput(false, { transform: booleanAttribute });
  readonly size = ngInput<BipSize>('md');
  readonly variant = ngInput<BipFileUploadVariant>('default');
  readonly multiple = ngInput(false, { transform: booleanAttribute });
  readonly accept = ngInput<string>('');
  readonly maxSize = ngInput<number | undefined>(undefined);
  readonly maxFiles = ngInput<number | undefined>(undefined);

  readonly rejected = output<BipRejectedFile[]>();

  protected readonly isDragging = signal(false);
  protected readonly isFocused = signal(false);
  private dragCounter = 0;

  private onChange: (files: File[]) => void = () => {};

  protected readonly isDisabled = computed(() => this.disabled() || this.loading());

  protected readonly hasVisibleMessage = computed(
    () => (this.error() && !!this.errorMessage()) || !!this.helperText()
  );
  protected readonly messageId = computed(() => (this.hasVisibleMessage() ? this.errorId : undefined));

  protected readonly outerLabelClass = computed(() => {
    const classes = [OUTER_LABEL_SIZE_CLASS[this.size()]];
    classes.push(this.error() ? 'bip-file-upload-outer-label--error' : 'bip-file-upload-outer-label--normal');
    if (this.isDisabled()) classes.push('bip-file-upload-outer-label--disabled');
    return classes.join(' ');
  });

  protected readonly helperClass = computed(() => HELPER_SIZE_CLASS[this.size()]);

  protected readonly dropzoneClass = computed(() => {
    const classes = ['bip-file-upload-dropzone'];
    if (this.variant() === 'compact') classes.push('bip-file-upload-dropzone--compact');
    if (this.isFocused()) classes.push('bip-file-upload-dropzone--focused');
    if (this.isDisabled()) {
      classes.push('bip-file-upload-dropzone--disabled');
    } else if (this.error()) {
      classes.push(this.isDragging() ? 'bip-file-upload-dropzone--error-dragging' : 'bip-file-upload-dropzone--error');
    } else {
      classes.push(this.isDragging() ? 'bip-file-upload-dropzone--dragging' : 'bip-file-upload-dropzone--default');
    }
    return classes.join(' ');
  });

  protected readonly uploadIconClass = computed(() => {
    const classes = ['bip-file-upload-upload-icon'];
    if (this.variant() === 'compact') classes.push('bip-file-upload-upload-icon--compact');
    classes.push(this.error() ? 'bip-file-upload-upload-icon--error' : 'bip-file-upload-upload-icon--normal');
    return classes.join(' ');
  });

  protected readonly dropzoneTitleClass = computed(
    () => `bip-file-upload-dropzone-title ${this.error() ? 'bip-file-upload-dropzone-title--error' : 'bip-file-upload-dropzone-title--normal'}`
  );

  protected readonly maxSizeLabel = computed(() => {
    const maxSize = this.maxSize();
    return maxSize === undefined ? '' : this.locale().fileUpload.maxSize(formatFileSize(maxSize));
  });

  constructor() {
    super();
    effect(() => {
      this.explicitError.set(this.error() ? this.errorMessage() || 'error' : null);
    });
  }

  writeValue(value: File[]): void {
    this.value.set(value ?? []);
  }

  registerOnChange(fn: (files: File[]) => void): void {
    this.onChange = fn;
  }

  private commit(files: File[]): void {
    this.value.set(files);
    this.onChange(files);
  }

  private processFiles(incoming: FileList | null): void {
    if (!incoming || incoming.length === 0) return;
    const rejected: BipRejectedFile[] = [];
    let newFiles = Array.from(incoming);

    const maxSize = this.maxSize();
    if (maxSize !== undefined) {
      newFiles.filter((f) => f.size > maxSize).forEach((f) => rejected.push({ file: f, reason: 'size' }));
      newFiles = newFiles.filter((f) => f.size <= maxSize);
    }

    const maxFiles = this.maxFiles();
    const current = this.value();
    if (this.multiple() && maxFiles !== undefined) {
      const available = maxFiles - current.length;
      if (available <= 0) {
        newFiles.forEach((f) => rejected.push({ file: f, reason: 'count' }));
        newFiles = [];
      } else if (newFiles.length > available) {
        newFiles.slice(available).forEach((f) => rejected.push({ file: f, reason: 'count' }));
        newFiles = newFiles.slice(0, available);
      }
    }

    if (rejected.length > 0) this.rejected.emit(rejected);
    if (newFiles.length === 0) return;

    const merged = this.multiple() ? [...current, ...newFiles] : [newFiles[0]];
    this.commit(merged);
  }

  protected removeFile(file: File): void {
    this.commit(this.value().filter((f) => f !== file));
  }

  protected formatFileSize(bytes: number): string {
    return formatFileSize(bytes);
  }

  protected onDragEnter(event: DragEvent): void {
    event.preventDefault();
    if (this.isDisabled()) return;
    this.dragCounter += 1;
    if (this.dragCounter === 1) this.isDragging.set(true);
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  protected onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragCounter -= 1;
    if (this.dragCounter === 0) this.isDragging.set(false);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragCounter = 0;
    this.isDragging.set(false);
    if (!this.isDisabled()) this.processFiles(event.dataTransfer?.files ?? null);
  }

  protected onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.processFiles(input.files);
    input.value = '';
  }

  protected onFocus(): void {
    this.isFocused.set(true);
  }

  protected onBlur(): void {
    this.isFocused.set(false);
    this.markTouched();
  }
}
