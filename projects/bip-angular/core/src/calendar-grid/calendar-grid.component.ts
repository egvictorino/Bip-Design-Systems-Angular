import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
} from '@angular/core';
import { BipIdGenerator } from '../a11y';
import { addDays, dateKey, getDaysInMonth, getMondayOffset, monthIndex } from '../utils';

export type BipCalendarGridMode = 'single' | 'range';
export type BipCalendarGridView = 'days' | 'months' | 'years';

/**
 * Subconjunto de `BipLocale['datePicker']`/`['dateRangePicker']` común a ambos diccionarios —
 * ambos tienen exactamente esta forma salvo las claves que no conciernen a la cuadrícula
 * (`placeholder`, `clear`/`today` de DatePicker, `selectRange`/`clearSelection` de
 * DateRangePicker), que se pasan por separado vía `todayLabel`/`clearLabel`.
 */
export interface BipCalendarGridStrings {
  prevYear: string;
  nextYear: string;
  selectMonth: string;
  monthOfYear: (month: string, year: number) => string;
  prevMonth: string;
  nextMonth: string;
  selectMonthAndYear: (month: string, year: number) => string;
  selectYear: string;
  prevYears: string;
  nextYears: string;
  yearRange: (fromYear: number, toYear: number) => string;
  monthNames: string[];
  monthNamesShort: string[];
  dayLabels: string[];
}

interface BipCalendarDayCell {
  date: Date;
  inCurrentMonth: boolean;
  key: string;
}

const YEARS_PER_BLOCK = 12;

function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function clampDayOfMonth(year: number, month: number, day: number): number {
  return Math.min(day, getDaysInMonth(year, month));
}

/**
 * Cuadrícula compartida día/mes/año de DatePicker y DateRangePicker — puerto unificado de
 * `CalendarGrid`/`RangeCalendarGrid` (React), que son casi idénticas salvo el resaltado de
 * selección. Vive en `core` (no en un secondary entry de componente) porque la comparten dos
 * entries distintos (`date-picker`, `date-range-picker`) y el CLAUDE.md prohíbe imports
 * cruzados entre entries que no pasen por `core`.
 *
 * Navegación de teclado (grid de días/años, sin wrap — ver DatePicker.test.tsx/
 * DateRangePicker.test.tsx portados): ← → ↑ ↓ mueven el foco (día: ±1/±7, año: ±1/±4),
 * Home/End van al primer/último día del mes o año del bloque visible, PageUp/PageDown saltan
 * un mes/década, Enter/Espacio seleccionan si la fecha/año no está deshabilitado. La
 * cuadrícula de meses no tiene navegación por flechas (gap conocido, igual que la referencia
 * React) — solo click/Enter nativo del botón.
 */
@Component({
  selector: 'bip-calendar-grid',
  templateUrl: './calendar-grid.component.html',
  styleUrl: './calendar-grid.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'bip-calendar-grid' },
})
export class BipCalendarGrid {
  readonly mode = input<BipCalendarGridMode>('single');
  readonly viewDate = model.required<Date>();
  readonly min = input<Date | undefined>(undefined);
  readonly max = input<Date | undefined>(undefined);
  readonly disabledDates = input<Date[]>([]);
  readonly selected = input<Date | null>(null);
  readonly rangeFrom = input<Date | null>(null);
  readonly rangeTo = input<Date | null>(null);
  readonly previewTo = input<Date | null>(null);
  readonly localeTag = input<string>('es-MX');
  readonly strings = input.required<BipCalendarGridStrings>();
  readonly todayLabel = input<string>('');
  readonly clearLabel = input<string>('');
  readonly showClearLink = input(false, { transform: booleanAttribute });

  readonly daySelected = output<Date>();
  readonly dayHover = output<Date | null>();
  readonly todaySelected = output<void>();
  readonly clearSelected = output<void>();

  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly idGenerator = inject(BipIdGenerator);
  protected readonly headingId = this.idGenerator.next('bip-calendar-grid-heading');

  protected readonly today = startOfDay(new Date());

  protected readonly calendarView = signal<BipCalendarGridView>('days');
  protected readonly focusedDate = signal<Date>(this.today);
  protected readonly pickerYear = signal<number>(this.today.getFullYear());
  protected readonly focusedYear = signal<number>(this.today.getFullYear());
  protected readonly yearRangeStart = signal<number>(
    Math.floor(this.today.getFullYear() / YEARS_PER_BLOCK) * YEARS_PER_BLOCK
  );

  private readonly disabledSet = computed(() => new Set(this.disabledDates().map((d) => dateKey(d))));
  private readonly minDay = computed(() => {
    const min = this.min();
    return min ? startOfDay(min) : undefined;
  });
  private readonly maxDay = computed(() => {
    const max = this.max();
    return max ? startOfDay(max) : undefined;
  });

  protected readonly year = computed(() => this.viewDate().getFullYear());
  protected readonly month = computed(() => this.viewDate().getMonth());

  protected readonly monthYearLabel = computed(() =>
    this.strings().monthOfYear(this.strings().monthNames[this.month()], this.year())
  );

  protected readonly days = computed<BipCalendarDayCell[]>(() => {
    const year = this.year();
    const month = this.month();
    const offset = getMondayOffset(year, month);
    const daysInMonth = getDaysInMonth(year, month);
    const totalCells = Math.ceil((offset + daysInMonth) / 7) * 7;
    const cells: BipCalendarDayCell[] = [];
    for (let i = 0; i < totalCells; i++) {
      const date = new Date(year, month, i - offset + 1);
      cells.push({ date, inCurrentMonth: date.getMonth() === month, key: dateKey(date) });
    }
    return cells;
  });

  protected readonly canGoPrevMonth = computed(() => {
    const min = this.minDay();
    return !min || monthIndex(new Date(this.year(), this.month() - 1, 1)) >= monthIndex(min);
  });
  protected readonly canGoNextMonth = computed(() => {
    const max = this.maxDay();
    return !max || monthIndex(new Date(this.year(), this.month() + 1, 1)) <= monthIndex(max);
  });

  protected readonly visibleYears = computed(() => {
    const start = this.yearRangeStart();
    return Array.from({ length: YEARS_PER_BLOCK }, (_, i) => start + i);
  });
  protected readonly yearRangeLabel = computed(() => {
    const start = this.yearRangeStart();
    return this.strings().yearRange(start, start + YEARS_PER_BLOCK - 1);
  });
  protected readonly canGoPrevYears = computed(() => {
    const min = this.minDay();
    return !min || this.yearRangeStart() - 1 >= min.getFullYear();
  });
  protected readonly canGoNextYears = computed(() => {
    const max = this.maxDay();
    return !max || this.yearRangeStart() + YEARS_PER_BLOCK <= max.getFullYear();
  });

  protected readonly todayDisabled = computed(() => this.isDayDisabled(this.today));
  protected readonly focusedDateKey = computed(() => dateKey(this.focusedDate()));

  private readonly dayLabelFormatter = computed(
    () =>
      new Intl.DateTimeFormat(this.localeTag(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  );

  protected dayAriaLabel(date: Date): string {
    return this.dayLabelFormatter().format(date);
  }

  constructor() {
    let seeded = false;
    effect(() => {
      const seed = this.selected() ?? this.rangeFrom() ?? this.viewDate();
      if (seeded) return;
      seeded = true;
      untracked(() => {
        this.focusedDate.set(seed);
        this.pickerYear.set(seed.getFullYear());
        this.focusedYear.set(seed.getFullYear());
        this.yearRangeStart.set(Math.floor(seed.getFullYear() / YEARS_PER_BLOCK) * YEARS_PER_BLOCK);
      });
    });

    effect(() => {
      const date = this.focusedDate();
      const view = this.calendarView();
      if (view !== 'days') return;
      queueMicrotask(() => {
        const el = this.elementRef.nativeElement.querySelector<HTMLButtonElement>(
          `[data-date="${dateKey(date)}"]`
        );
        el?.focus({ preventScroll: true });
      });
    });
    effect(() => {
      const year = this.focusedYear();
      const view = this.calendarView();
      if (view !== 'years') return;
      queueMicrotask(() => {
        const el = this.elementRef.nativeElement.querySelector<HTMLButtonElement>(`[data-year="${year}"]`);
        el?.focus({ preventScroll: true });
      });
    });
  }

  protected isDayDisabled(date: Date): boolean {
    const min = this.minDay();
    const max = this.maxDay();
    if (min && date < min) return true;
    if (max && date > max) return true;
    return this.disabledSet().has(dateKey(date));
  }

  protected isMonthDisabled(monthIdx: number): boolean {
    const min = this.minDay();
    const max = this.maxDay();
    const idx = this.pickerYear() * 12 + monthIdx;
    if (min && idx < min.getFullYear() * 12 + min.getMonth()) return true;
    if (max && idx > max.getFullYear() * 12 + max.getMonth()) return true;
    return false;
  }

  protected isYearDisabled(year: number): boolean {
    const min = this.minDay();
    const max = this.maxDay();
    if (min && year < min.getFullYear()) return true;
    if (max && year > max.getFullYear()) return true;
    return false;
  }

  protected isSelected(date: Date): boolean {
    const selected = this.selected();
    return !!selected && dateKey(selected) === dateKey(date);
  }

  protected isRangeFrom(date: Date): boolean {
    const from = this.rangeFrom();
    return !!from && dateKey(from) === dateKey(date);
  }

  protected isRangeTo(date: Date): boolean {
    const to = this.rangeTo();
    return !!to && dateKey(to) === dateKey(date);
  }

  protected isInRange(date: Date): boolean {
    const from = this.rangeFrom();
    const to = this.rangeTo() ?? this.previewTo();
    if (!from || !to) return false;
    const [start, end] = from <= to ? [from, to] : [to, from];
    return date > start && date < end;
  }

  protected isToday(date: Date): boolean {
    return dateKey(date) === dateKey(this.today);
  }

  protected prevMonth(): void {
    if (!this.canGoPrevMonth()) return;
    this.viewDate.set(new Date(this.year(), this.month() - 1, 1));
  }

  protected nextMonth(): void {
    if (!this.canGoNextMonth()) return;
    this.viewDate.set(new Date(this.year(), this.month() + 1, 1));
  }

  protected selectDay(date: Date): void {
    if (this.isDayDisabled(date)) return;
    this.daySelected.emit(date);
  }

  protected onDayHover(date: Date | null): void {
    this.dayHover.emit(date);
  }

  protected onToday(): void {
    if (this.todayDisabled()) return;
    this.todaySelected.emit();
  }

  protected onClear(): void {
    this.clearSelected.emit();
  }

  protected showMonthPicker(): void {
    this.pickerYear.set(this.year());
    this.calendarView.set('months');
  }

  protected showYearPicker(): void {
    this.yearRangeStart.set(Math.floor(this.pickerYear() / YEARS_PER_BLOCK) * YEARS_PER_BLOCK);
    this.focusedYear.set(this.pickerYear());
    this.calendarView.set('years');
  }

  protected selectMonth(monthIdx: number): void {
    if (this.isMonthDisabled(monthIdx)) return;
    const day = clampDayOfMonth(this.pickerYear(), monthIdx, this.focusedDate().getDate());
    this.viewDate.set(new Date(this.pickerYear(), monthIdx, 1));
    this.focusedDate.set(new Date(this.pickerYear(), monthIdx, day));
    this.calendarView.set('days');
  }

  protected prevPickerYear(): void {
    this.pickerYear.update((y) => y - 1);
  }

  protected nextPickerYear(): void {
    this.pickerYear.update((y) => y + 1);
  }

  protected selectYear(year: number): void {
    if (this.isYearDisabled(year)) return;
    this.pickerYear.set(year);
    this.calendarView.set('months');
  }

  protected prevYears(): void {
    if (!this.canGoPrevYears()) return;
    this.yearRangeStart.update((start) => start - YEARS_PER_BLOCK);
  }

  protected nextYears(): void {
    if (!this.canGoNextYears()) return;
    this.yearRangeStart.update((start) => start + YEARS_PER_BLOCK);
  }

  protected onDaysKeydown(event: KeyboardEvent): void {
    const moveToDay = (delta: number) => {
      const next = addDays(this.focusedDate(), delta);
      this.focusedDate.set(next);
      if (next.getMonth() !== this.month() || next.getFullYear() !== this.year()) {
        this.viewDate.set(new Date(next.getFullYear(), next.getMonth(), 1));
      }
    };
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        moveToDay(-1);
        return;
      case 'ArrowRight':
        event.preventDefault();
        moveToDay(1);
        return;
      case 'ArrowUp':
        event.preventDefault();
        moveToDay(-7);
        return;
      case 'ArrowDown':
        event.preventDefault();
        moveToDay(7);
        return;
      case 'Home':
        event.preventDefault();
        this.focusedDate.set(new Date(this.year(), this.month(), 1));
        return;
      case 'End':
        event.preventDefault();
        this.focusedDate.set(new Date(this.year(), this.month() + 1, 0));
        return;
      case 'PageUp': {
        event.preventDefault();
        const day = clampDayOfMonth(this.year(), this.month() - 1, this.focusedDate().getDate());
        this.focusedDate.set(new Date(this.year(), this.month() - 1, day));
        this.prevMonth();
        return;
      }
      case 'PageDown': {
        event.preventDefault();
        const day = clampDayOfMonth(this.year(), this.month() + 1, this.focusedDate().getDate());
        this.focusedDate.set(new Date(this.year(), this.month() + 1, day));
        this.nextMonth();
        return;
      }
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.selectDay(this.focusedDate());
        return;
    }
  }

  protected onYearsKeydown(event: KeyboardEvent): void {
    const moveToYear = (delta: number) => {
      const next = this.focusedYear() + delta;
      if (this.isYearOutOfBounds(next)) return;
      this.focusedYear.set(next);
      if (next < this.yearRangeStart() || next > this.yearRangeStart() + YEARS_PER_BLOCK - 1) {
        this.yearRangeStart.set(Math.floor(next / YEARS_PER_BLOCK) * YEARS_PER_BLOCK);
      }
    };
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        moveToYear(-1);
        return;
      case 'ArrowRight':
        event.preventDefault();
        moveToYear(1);
        return;
      case 'ArrowUp':
        event.preventDefault();
        moveToYear(-4);
        return;
      case 'ArrowDown':
        event.preventDefault();
        moveToYear(4);
        return;
      case 'Home':
        event.preventDefault();
        this.focusedYear.set(this.yearRangeStart());
        return;
      case 'End':
        event.preventDefault();
        this.focusedYear.set(this.yearRangeStart() + YEARS_PER_BLOCK - 1);
        return;
      case 'PageUp':
        event.preventDefault();
        moveToYear(-YEARS_PER_BLOCK);
        return;
      case 'PageDown':
        event.preventDefault();
        moveToYear(YEARS_PER_BLOCK);
        return;
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.selectYear(this.focusedYear());
        return;
    }
  }

  private isYearOutOfBounds(year: number): boolean {
    const min = this.minDay();
    const max = this.maxDay();
    return (!!min && year < min.getFullYear()) || (!!max && year > max.getFullYear());
  }
}
