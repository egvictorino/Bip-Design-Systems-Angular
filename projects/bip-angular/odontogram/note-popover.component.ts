import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  input,
  output,
  signal,
} from '@angular/core';
import { A11yModule } from '@angular/cdk/a11y';
import { injectBipLocale } from '@bip-design-systems/angular/core';

interface BipOverlayPosition {
  top: number;
  left: number;
}

/**
 * Popover de nota de un diente — puerto de `NotePopover` (React). Auto-contenido: su propia
 * plantilla incluye el backdrop (clic cierra sin guardar) y el diálogo con foco atrapado
 * (`cdkTrapFocus`); `<bip-tooth-detail>` solo decide cuándo montarlo/desmontarlo vía `BipOverlay`
 * y escucha `Escape` a nivel de overlay (ver `tooth-detail.component.ts`).
 */
@Component({
  selector: 'bip-note-popover',
  imports: [A11yModule],
  templateUrl: './note-popover.component.html',
  styleUrl: './note-popover.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BipNotePopover implements OnInit, AfterViewInit {
  readonly toothNumber = input.required<number>();
  readonly initialNote = input.required<string>();
  readonly editable = input.required<boolean>();
  readonly position = input.required<BipOverlayPosition>();

  readonly closed = output<void>();
  readonly save = output<string>();

  protected readonly locale = injectBipLocale();
  protected readonly draft = signal('');

  @ViewChild('textareaRef') private readonly textareaRef?: ElementRef<HTMLTextAreaElement>;

  ngOnInit(): void {
    this.draft.set(this.initialNote());
  }

  ngAfterViewInit(): void {
    this.textareaRef?.nativeElement.focus();
  }

  protected onDraftInput(value: string): void {
    if (!this.editable()) return;
    this.draft.set(value);
  }
}
