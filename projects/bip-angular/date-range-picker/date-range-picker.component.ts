import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  OnDestroy,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  signal,
  untracked,
} from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import { Overlay, type OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { BipCalendarGrid, BipFormControlBase, BipOverlay, injectBipLocale } from '@bip-design-systems/angular/core';
import type { BipCalendarGridStrings, BipSize } from '@bip-design-systems/angular/core';

export interface BipDateRange {
  from: Date | null;
  to: Date | null;
}

const GAP_PX = 4;
const EMPTY_RANGE: BipDateRange = { from: null, to: null };

const SIZE_CLASS: Record<BipSize, string> = {
  sm: 'bip-date-range-picker-trigger--sm',
  md: 'bip-date-range-picker-trigger--md',
  lg: 'bip-date-range-picker-trigger--lg',
};

function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/**
 * Selector de rango de fechas — puerto de DateRangePicker (React), misma máquina de estados de
 * selección (`handleSelectDay` del original): primer click fija `from`, segundo click completa
 * el rango (intercambia si es anterior a `from`, limpia si es el mismo día que `from`), y
 * siempre que hay un rango completo el siguiente click empieza uno nuevo. Usa
 * `bip-calendar-grid` (core) en modo `range`, con preview en vivo del rango mientras se hace
 * hover sobre el segundo día.
 */
@Component({
  selector: 'bip-date-range-picker',
  imports: [BipCalendarGrid],
  templateUrl: './date-range-picker.component.html',
  styleUrl: './date-range-picker.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'bip-date-range-picker-wrapper',
    '[class.bip-date-range-picker-wrapper--full-width]': 'fullWidth()',
  },
})
export class BipDateRangePicker extends BipFormControlBase implements ControlValueAccessor, OnDestroy {
  readonly value = model<BipDateRange>({ ...EMPTY_RANGE });

  readonly min = input<Date | undefined>(undefined);
  readonly max = input<Date | undefined>(undefined);
  readonly disabledDates = input<Date[]>([]);
  readonly placeholder = input<string>('');
  readonly label = input<string>('');
  readonly helperText = input<string>('');
  readonly error = input(false, { transform: booleanAttribute });
  readonly errorMessage = input<string>('');
  readonly required = input(false, { transform: booleanAttribute });
  readonly size = input<BipSize>('md');
  readonly fullWidth = input(false, { transform: booleanAttribute });

  protected readonly locale = injectBipLocale();
  protected readonly isOpen = signal(false);
  protected readonly viewDate = signal<Date>(startOfDay(new Date()));
  protected readonly hoverDate = signal<Date | null>(null);

  private onChange: (value: BipDateRange) => void = () => {};

  @ViewChild('triggerRef', { static: true }) private readonly triggerRef!: ElementRef<HTMLButtonElement>;
  @ViewChild('panelTemplate', { static: true }) private readonly panelTemplate!: TemplateRef<unknown>;

  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly bipOverlay = inject(BipOverlay);
  private readonly cdkOverlay = inject(Overlay);
  private readonly injector = inject(Injector);
  private overlayRef: OverlayRef | null = null;

  protected readonly hasVisibleMessage = computed(() => (this.error() && !!this.errorMessage()) || !!this.helperText());
  protected readonly messageId = computed(() => (this.hasVisibleMessage() ? this.errorId : undefined));

  protected readonly previewTo = computed(() => {
    const range = this.value();
    return range.from && !range.to ? this.hoverDate() : null;
  });

  protected readonly showClearLink = computed(() => !!this.value().from || !!this.value().to);

  protected readonly gridStrings = computed<BipCalendarGridStrings>(() => {
    const drp = this.locale().dateRangePicker;
    return {
      prevYear: drp.prevYear,
      nextYear: drp.nextYear,
      selectMonth: drp.selectMonth,
      monthOfYear: drp.monthOfYear,
      prevMonth: drp.prevMonth,
      nextMonth: drp.nextMonth,
      selectMonthAndYear: drp.selectMonthAndYear,
      selectYear: drp.selectYear,
      prevYears: drp.prevYears,
      nextYears: drp.nextYears,
      yearRange: drp.yearRange,
      monthNames: drp.monthNames,
      monthNamesShort: drp.monthNamesShort,
      dayLabels: drp.dayLabels,
    };
  });

  protected readonly triggerClass = computed(() => {
    const classes = [SIZE_CLASS[this.size()]];
    if (this.error()) classes.push('bip-date-range-picker-trigger--error');
    return classes.join(' ');
  });

  protected readonly displayValue = computed(() => {
    const { from, to } = this.value();
    if (!from) return '';
    const fmt = new Intl.DateTimeFormat(this.locale().locale, { day: '2-digit', month: '2-digit', year: 'numeric' });
    return to ? `${fmt.format(from)} – ${fmt.format(to)}` : `${fmt.format(from)} – ...`;
  });

  constructor() {
    super();
    effect(() => {
      this.explicitError.set(this.error() ? this.errorMessage() || 'error' : null);
    });
    effect(() => {
      const open = this.isOpen();
      untracked(() => {
        if (open) this.showPanel();
        else this.hidePanel();
      });
    });
  }

  ngOnDestroy(): void {
    this.hidePanel();
  }

  writeValue(value: BipDateRange): void {
    this.value.set(value ?? { ...EMPTY_RANGE });
  }

  registerOnChange(fn: (value: BipDateRange) => void): void {
    this.onChange = fn;
  }

  private commitRange(next: BipDateRange): void {
    this.value.set(next);
    this.onChange(next);
  }

  protected toggle(): void {
    if (this.disabled()) return;
    if (this.isOpen()) {
      this.closePanel();
    } else {
      this.viewDate.set(this.value().from ?? startOfDay(new Date()));
      this.isOpen.set(true);
    }
  }

  protected closePanel(refocusTrigger = false): void {
    this.isOpen.set(false);
    this.hoverDate.set(null);
    if (refocusTrigger) this.triggerRef.nativeElement.focus();
  }

  protected onDaySelected(date: Date): void {
    const range = this.value();
    if (!range.from || range.to) {
      this.commitRange({ from: date, to: null });
      return;
    }
    if (date < range.from) {
      this.commitRange({ from: date, to: range.from });
    } else if (isSameDay(date, range.from)) {
      this.commitRange({ ...EMPTY_RANGE });
    } else {
      this.commitRange({ from: range.from, to: date });
    }
    this.closePanel();
  }

  protected onDayHover(date: Date | null): void {
    this.hoverDate.set(date);
  }

  protected onClearRange(event: Event): void {
    event.stopPropagation();
    this.commitRange({ ...EMPTY_RANGE });
  }

  protected onClearFromGrid(): void {
    this.commitRange({ ...EMPTY_RANGE });
  }

  protected onEscape(event: Event): void {
    event.preventDefault();
    this.closePanel(true);
  }

  protected onBlur(): void {
    this.markTouched();
  }

  private showPanel(): void {
    if (this.overlayRef) return;
    const overlayRef = this.bipOverlay.create(
      {
        positionStrategy: this.cdkOverlay
          .position()
          .flexibleConnectedTo(this.triggerRef)
          .withPositions([
            { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: GAP_PX },
            { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -GAP_PX },
          ])
          .withPush(true),
        scrollStrategy: this.cdkOverlay.scrollStrategies.reposition(),
        hasBackdrop: false,
      },
      this.injector
    );
    overlayRef.attach(new TemplatePortal(this.panelTemplate, this.viewContainerRef));
    overlayRef.outsidePointerEvents().subscribe((event) => {
      const trigger = this.triggerRef.nativeElement;
      if (event.target instanceof Node && trigger.contains(event.target)) return;
      this.closePanel();
    });
    this.overlayRef = overlayRef;
    queueMicrotask(() => overlayRef.overlayElement.querySelector<HTMLElement>('[role="dialog"]')?.focus());
  }

  private hidePanel(): void {
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }
}
