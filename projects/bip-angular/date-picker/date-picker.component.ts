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
import { type OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  BipCalendarGrid,
  BipFormControlBase,
  BipOverlay,
  formatDate,
  injectBipLocale,
  isSameDay,
  startOfDay,
} from '@bip-design-systems/angular/core';
import type { BipCalendarGridStrings, BipSize } from '@bip-design-systems/angular/core';

const GAP_PX = 4;

const SIZE_CLASS: Record<BipSize, string> = {
  sm: 'bip-date-picker-trigger--sm',
  md: 'bip-date-picker-trigger--md',
  lg: 'bip-date-picker-trigger--lg',
};

/**
 * Selector de una fecha — puerto de DatePicker (React). Usa `BipCalendarGrid` (core) para el
 * popover de días/meses/años. `value: Date | null` vía CVA; el botón trigger muestra la fecha
 * formateada o el placeholder, con un ícono final de 3 estados (carga/limpiar/calendario).
 */
@Component({
  selector: 'bip-date-picker',
  imports: [BipCalendarGrid],
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'bip-date-picker-wrapper',
    '[class.bip-date-picker-wrapper--full-width]': 'fullWidth()',
  },
})
export class BipDatePicker extends BipFormControlBase implements ControlValueAccessor, OnDestroy {
  readonly value = model<Date | null>(null);

  readonly min = input<Date | undefined>(undefined);
  readonly max = input<Date | undefined>(undefined);
  readonly disabledDates = input<Date[]>([]);
  readonly placeholder = input<string>('');
  readonly label = input<string>('');
  readonly helperText = input<string>('');
  readonly error = input(false, { transform: booleanAttribute });
  readonly errorMessage = input<string>('');
  readonly loading = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly size = input<BipSize>('md');
  readonly fullWidth = input(false, { transform: booleanAttribute });

  protected readonly locale = injectBipLocale();
  protected readonly isOpen = signal(false);
  protected readonly viewDate = signal<Date>(startOfDay(new Date()));
  protected readonly today = startOfDay(new Date());

  private onChange: (value: Date | null) => void = () => {};

  @ViewChild('triggerRef', { static: true }) private readonly triggerRef!: ElementRef<HTMLButtonElement>;
  @ViewChild('panelTemplate', { static: true }) private readonly panelTemplate!: TemplateRef<unknown>;

  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly bipOverlay = inject(BipOverlay);
  private readonly injector = inject(Injector);
  private overlayRef: OverlayRef | null = null;

  protected readonly hasVisibleMessage = computed(() => (this.error() && !!this.errorMessage()) || !!this.helperText());
  protected readonly messageId = computed(() => (this.hasVisibleMessage() ? this.errorId : undefined));

  protected readonly gridStrings = computed<BipCalendarGridStrings>(() => {
    const dp = this.locale().datePicker;
    return {
      prevYear: dp.prevYear,
      nextYear: dp.nextYear,
      selectMonth: dp.selectMonth,
      monthOfYear: dp.monthOfYear,
      prevMonth: dp.prevMonth,
      nextMonth: dp.nextMonth,
      selectMonthAndYear: dp.selectMonthAndYear,
      selectYear: dp.selectYear,
      prevYears: dp.prevYears,
      nextYears: dp.nextYears,
      yearRange: dp.yearRange,
      monthNames: dp.monthNames,
      monthNamesShort: dp.monthNamesShort,
      dayLabels: dp.dayLabels,
    };
  });

  protected readonly triggerClass = computed(() => {
    const classes = [SIZE_CLASS[this.size()]];
    if (this.error()) classes.push('bip-date-picker-trigger--error');
    return classes.join(' ');
  });

  protected readonly displayValue = computed(() => {
    const value = this.value();
    if (!value) return '';
    return formatDate(value, {
      locale: this.locale().locale,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
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

  writeValue(value: Date | null): void {
    this.value.set(value ?? null);
  }

  registerOnChange(fn: (value: Date | null) => void): void {
    this.onChange = fn;
  }

  private emitChange(next: Date | null): void {
    this.value.set(next);
    this.onChange(next);
  }

  protected toggle(): void {
    if (this.disabled() || this.loading()) return;
    if (this.isOpen()) {
      this.closePanel();
    } else {
      this.viewDate.set(this.value() ?? this.today);
      this.isOpen.set(true);
    }
  }

  protected closePanel(refocusTrigger = false): void {
    this.isOpen.set(false);
    if (refocusTrigger) this.triggerRef.nativeElement.focus();
  }

  protected onDaySelected(date: Date): void {
    this.emitChange(date);
    this.closePanel();
  }

  protected onTodaySelected(): void {
    this.emitChange(this.today);
    this.closePanel();
  }

  protected onClear(event: Event): void {
    event.stopPropagation();
    this.emitChange(null);
  }

  protected onEscape(event: Event): void {
    event.preventDefault();
    this.closePanel(true);
  }

  protected onBlur(): void {
    this.markTouched();
  }

  protected readonly todayDisabled = computed(() => this.isDisabledDate(this.today));

  protected isDisabledDate(date: Date): boolean {
    const min = this.min();
    const max = this.max();
    const day = startOfDay(date);
    if (min && day < startOfDay(min)) return true;
    if (max && day > startOfDay(max)) return true;
    return this.disabledDates().some((d) => isSameDay(d, date));
  }

  private showPanel(): void {
    if (this.overlayRef) return;
    const overlayRef = this.bipOverlay.create(
      {
        positionStrategy: this.bipOverlay
          .position()
          .flexibleConnectedTo(this.triggerRef)
          .withPositions([
            { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: GAP_PX },
            { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -GAP_PX },
          ])
          .withPush(true),
        scrollStrategy: this.bipOverlay.scrollStrategies.reposition(),
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
