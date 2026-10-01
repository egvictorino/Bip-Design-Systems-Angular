import { NgTemplateOutlet } from '@angular/common';
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
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { Overlay, type OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  BipOverlay,
  addDays,
  dateKey,
  getMondayOffset,
  injectBipLocale,
  isSameDay,
} from '@bip-design-systems/angular/core';
import type { CalendarEventStatus, CalendarView } from '@bip-design-systems/angular/core';
import type {
  BipCalendarDateRange,
  BipCalendarEvent,
  BipCalendarEventMove,
  BipCalendarEventResize,
  BipCalendarResource,
  BipCalendarSlotInfo,
  BipCalendarStep,
} from './calendar.types';

interface BipCalendarDayCell {
  date: Date;
  inCurrentMonth: boolean;
  key: string;
}

const HOUR_HEIGHT_PX = 48;
const ALL_STATUSES: CalendarEventStatus[] = ['pending', 'confirmed', 'completed', 'cancelled'];
const STATUS_CLASS: Record<CalendarEventStatus, string> = {
  pending: 'bip-calendar-status-pending',
  confirmed: 'bip-calendar-status-confirmed',
  completed: 'bip-calendar-status-completed',
  cancelled: 'bip-calendar-status-cancelled',
};
const VIEWS: CalendarView[] = ['month', 'week', 'day', 'agenda'];

function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function startOfWeek(date: Date): Date {
  const offset = date.getDay() === 0 ? 6 : date.getDay() - 1;
  return addDays(startOfDay(date), -offset);
}

function parseHHMM(value: string): number {
  const [h, m] = value.split(':').map(Number);
  return h * 60 + (m || 0);
}

function minutesOfDay(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

/**
 * Agenda de citas con 4 vistas (mes/semana/día/agenda) — puerto de Calendar (React). `view` y
 * `date` son totalmente controlados (sin valor por defecto, como la referencia): el padre es
 * dueño del estado, este componente solo renderiza y emite eventos. La selección de rango por
 * arrastre en vista mes abre un popover de confirmación vía `BipOverlay` (la referencia React
 * usa `createPortal` directo; aquí pasa por `BipOverlay` para heredar tema, regla del Bloque 2).
 * La vista mes no tiene navegación por teclado en la grilla (gap conocido, igual que la
 * referencia) — solo Enter/Espacio por celda.
 */
@Component({
  selector: 'bip-calendar',
  imports: [NgTemplateOutlet],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'bip-calendar',
    role: 'application',
    '[class.bip-calendar--disabled]': 'disabled()',
    '[attr.aria-label]': 'locale().calendar.calendarLabel',
    '[attr.aria-disabled]': 'disabled() || null',
  },
})
export class BipCalendar implements OnDestroy {
  readonly events = input<BipCalendarEvent[]>([]);
  readonly resources = input<BipCalendarResource[]>([]);
  readonly view = model.required<CalendarView>();
  readonly date = model.required<Date>();
  readonly minTime = input<string>('07:00');
  readonly maxTime = input<string>('20:00');
  readonly step = input<BipCalendarStep>(30);
  readonly disabled = input(false, { transform: booleanAttribute });

  readonly eventClick = output<BipCalendarEvent>();
  readonly eventCreate = output<BipCalendarSlotInfo>();
  readonly rangeSelect = output<BipCalendarDateRange>();
  readonly eventMove = output<BipCalendarEventMove>();
  readonly eventResize = output<BipCalendarEventResize>();

  protected readonly locale = injectBipLocale();
  protected readonly views = VIEWS;
  protected readonly statusClass = STATUS_CLASS;
  protected readonly hourHeight = HOUR_HEIGHT_PX;

  // ── Encabezado ────────────────────────────────────────────────────────────

  protected readonly title = computed(() => {
    const view = this.view();
    const date = this.date();
    const locale = this.locale().locale;
    if (view === 'agenda') return this.locale().calendar.upcomingEvents;
    if (view === 'month') return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(date);
    if (view === 'day') {
      return new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(
        date
      );
    }
    const start = startOfWeek(date);
    const end = addDays(start, 6);
    const fmt = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' });
    return `${fmt.format(start)} – ${fmt.format(end)}, ${date.getFullYear()}`;
  });

  protected setView(view: CalendarView): void {
    if (this.disabled()) return;
    this.view.set(view);
  }

  protected goToday(): void {
    if (this.disabled()) return;
    this.date.set(startOfDay(new Date()));
  }

  protected goPrev(): void {
    if (this.disabled()) return;
    this.step_(-1);
  }

  protected goNext(): void {
    if (this.disabled()) return;
    this.step_(1);
  }

  private step_(dir: 1 | -1): void {
    const view = this.view();
    const date = this.date();
    if (view === 'month') {
      this.date.set(new Date(date.getFullYear(), date.getMonth() + dir, 1));
    } else if (view === 'week') {
      this.date.set(addDays(date, dir * 7));
    } else {
      this.date.set(addDays(date, dir));
    }
  }

  // ── Vista mes ─────────────────────────────────────────────────────────────

  protected readonly monthDays = computed<BipCalendarDayCell[]>(() => {
    const date = this.date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const offset = getMondayOffset(year, month);
    // Siempre 6 semanas (42 celdas) — misma decisión que la referencia React, para que la
    // altura de la grilla no "salte" entre meses de 4 y 6 semanas visibles.
    const totalCells = 42;
    const cells: BipCalendarDayCell[] = [];
    for (let i = 0; i < totalCells; i++) {
      const d = new Date(year, month, i - offset + 1);
      cells.push({ date: d, inCurrentMonth: d.getMonth() === month, key: dateKey(d) });
    }
    return cells;
  });

  protected eventsForDay(day: Date): BipCalendarEvent[] {
    return this.events()
      .filter((e) => isSameDay(e.start, day))
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  }

  protected isToday(date: Date): boolean {
    return isSameDay(date, new Date());
  }

  protected onDayCellKeydown(event: KeyboardEvent, day: Date): void {
    if (this.disabled()) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.eventCreate.emit({ start: day, end: addDays(day, 1) });
    }
  }

  protected onOverflowClick(day: Date): void {
    if (this.disabled()) return;
    this.date.set(day);
    this.view.set('day');
  }

  // ── Selección de rango por arrastre (vista mes) ──────────────────────────

  private readonly rangeAnchor = signal<Date | null>(null);
  protected readonly rangeHoverDate = signal<Date | null>(null);
  private selecting = false;
  private readonly boundMouseUp = () => this.finalizeRange();

  protected readonly pendingRange = signal<BipCalendarDateRange | null>(null);

  protected isInRange(day: Date): boolean {
    const anchor = this.rangeAnchor();
    const hover = this.rangeHoverDate();
    if (!anchor || !hover) return false;
    const [min, max] = anchor <= hover ? [anchor, hover] : [hover, anchor];
    return day >= min && day <= max;
  }

  protected onCellMouseDown(day: Date, event: MouseEvent): void {
    if (this.disabled() || event.button !== 0) return;
    this.rangeAnchor.set(day);
    this.rangeHoverDate.set(day);
    this.selecting = true;
    document.addEventListener('mouseup', this.boundMouseUp);
  }

  protected onCellMouseEnter(day: Date): void {
    if (this.selecting) this.rangeHoverDate.set(day);
  }

  private finalizeRange(): void {
    document.removeEventListener('mouseup', this.boundMouseUp);
    if (!this.selecting) return;
    this.selecting = false;
    const anchor = this.rangeAnchor();
    const hover = this.rangeHoverDate();
    this.rangeAnchor.set(null);
    this.rangeHoverDate.set(null);
    if (!anchor || !hover) return;
    const [min, max] = anchor <= hover ? [anchor, hover] : [hover, anchor];
    if (isSameDay(min, max)) {
      this.eventCreate.emit({ start: min, end: addDays(min, 1) });
      return;
    }
    this.pendingRange.set({ from: min, to: max });
    this.showRangePopover();
  }

  protected confirmRange(): void {
    const range = this.pendingRange();
    if (range) this.rangeSelect.emit(range);
    this.closeRangePopover();
  }

  protected cancelRange(): void {
    this.closeRangePopover();
  }

  @ViewChild('rangePopoverTemplate', { static: true })
  private readonly rangePopoverTemplate!: TemplateRef<unknown>;
  @ViewChild('monthGridRef') private readonly monthGridRef?: ElementRef<HTMLElement>;

  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly bipOverlay = inject(BipOverlay);
  private readonly cdkOverlay = inject(Overlay);
  private readonly injector = inject(Injector);
  private rangeOverlayRef: OverlayRef | null = null;

  private showRangePopover(): void {
    const anchor = this.monthGridRef;
    if (!anchor) return;
    this.rangeOverlayRef?.dispose();
    const overlayRef = this.bipOverlay.create(
      {
        positionStrategy: this.cdkOverlay
          .position()
          .flexibleConnectedTo(anchor)
          .withPositions([{ originX: 'center', originY: 'center', overlayX: 'center', overlayY: 'center' }])
          .withPush(true),
        scrollStrategy: this.cdkOverlay.scrollStrategies.reposition(),
        hasBackdrop: false,
      },
      this.injector
    );
    overlayRef.attach(new TemplatePortal(this.rangePopoverTemplate, this.viewContainerRef));
    this.rangeOverlayRef = overlayRef;
  }

  private closeRangePopover(): void {
    this.rangeOverlayRef?.dispose();
    this.rangeOverlayRef = null;
    this.pendingRange.set(null);
  }

  protected onRangePopoverEscape(event: Event): void {
    event.preventDefault();
    this.cancelRange();
  }

  ngOnDestroy(): void {
    document.removeEventListener('mouseup', this.boundMouseUp);
    this.rangeOverlayRef?.dispose();
  }

  // ── Vista semana / día (TimeGrid compartido) ─────────────────────────────

  protected readonly timeGridDays = computed<Date[]>(() => {
    if (this.view() === 'day') return [startOfDay(this.date())];
    const start = startOfWeek(this.date());
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  });

  protected readonly minMinutes = computed(() => parseHHMM(this.minTime()));
  protected readonly maxMinutes = computed(() => parseHHMM(this.maxTime()));

  protected readonly hourLabels = computed(() => {
    const start = Math.floor(this.minMinutes() / 60);
    const end = Math.ceil(this.maxMinutes() / 60);
    return Array.from({ length: Math.max(0, end - start) }, (_, i) => start + i);
  });

  protected readonly gridHeight = computed(() => ((this.maxMinutes() - this.minMinutes()) / 60) * this.hourHeight);

  protected eventsForColumn(day: Date, doctorId: string | undefined): BipCalendarEvent[] {
    return this.events().filter((e) => isSameDay(e.start, day) && (!doctorId || e.doctorId === doctorId));
  }

  protected eventTop(event: BipCalendarEvent): number {
    const startMin = Math.max(minutesOfDay(event.start), this.minMinutes());
    return ((startMin - this.minMinutes()) / 60) * this.hourHeight;
  }

  protected eventHeight(event: BipCalendarEvent): number {
    const startMin = minutesOfDay(event.start);
    const endMin = Math.min(minutesOfDay(event.end), this.maxMinutes());
    return Math.max(((endMin - startMin) / 60) * this.hourHeight, 16);
  }

  protected onSlotClick(day: Date, event: MouseEvent): void {
    if (this.disabled()) return;
    const target = event.currentTarget as HTMLElement;
    const offsetY = event.clientY - target.getBoundingClientRect().top;
    const rawMinutes = this.minMinutes() + (offsetY / this.hourHeight) * 60;
    const step = this.step();
    const snapped = Math.floor(rawMinutes / step) * step;
    const start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, snapped);
    this.eventCreate.emit({ start, end: new Date(start.getTime() + step * 60000) });
  }

  protected onEventBlockClick(event: BipCalendarEvent, domEvent: Event): void {
    domEvent.stopPropagation();
    if (this.disabled()) return;
    this.eventClick.emit(event);
  }

  protected onEventBlockKeydown(event: BipCalendarEvent, domEvent: KeyboardEvent): void {
    if (domEvent.key === 'Enter' || domEvent.key === ' ') {
      domEvent.preventDefault();
      domEvent.stopPropagation();
      if (!this.disabled()) this.eventClick.emit(event);
    }
  }

  protected eventAriaLabel(event: BipCalendarEvent): string {
    const statusLabel = this.locale().calendar.statusLabels[event.status];
    const time = new Intl.DateTimeFormat(this.locale().locale, { hour: '2-digit', minute: '2-digit' }).format(
      event.start
    );
    return `${event.title}, ${time}, ${statusLabel}`;
  }

  // ── Vista agenda ──────────────────────────────────────────────────────────

  protected readonly statuses: readonly CalendarEventStatus[] = ALL_STATUSES;
  protected readonly activeStatuses = signal<Set<CalendarEventStatus>>(new Set(ALL_STATUSES));

  protected toggleStatus(status: CalendarEventStatus): void {
    this.activeStatuses.update((current) => {
      const next = new Set(current);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  }

  protected readonly agendaRangeEvents = computed(() => {
    const from = startOfDay(this.date());
    const to = addDays(from, 30);
    return this.events()
      .filter((e) => e.start >= from && e.start < to)
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  });

  protected readonly agendaFilteredEvents = computed(() =>
    this.agendaRangeEvents().filter((e) => this.activeStatuses().has(e.status))
  );

  protected readonly agendaGroups = computed(() => {
    const groups: { day: Date; events: BipCalendarEvent[] }[] = [];
    for (const event of this.agendaFilteredEvents()) {
      const last = groups[groups.length - 1];
      if (last && isSameDay(last.day, event.start)) {
        last.events.push(event);
      } else {
        groups.push({ day: startOfDay(event.start), events: [event] });
      }
    }
    return groups;
  });

  protected readonly agendaEmptyMessage = computed(() => {
    if (this.agendaFilteredEvents().length > 0) return null;
    return this.agendaRangeEvents().length === 0
      ? this.locale().calendar.noEventsUpcoming
      : this.locale().calendar.noEventsFiltered;
  });

  protected resourceName(doctorId: string | undefined): string | null {
    if (!doctorId) return null;
    return this.resources().find((r) => r.id === doctorId)?.name ?? null;
  }

  protected eventTimeRange(event: BipCalendarEvent): string {
    const fmt = new Intl.DateTimeFormat(this.locale().locale, { hour: '2-digit', minute: '2-digit' });
    return `${fmt.format(event.start)} – ${fmt.format(event.end)}`;
  }

  protected agendaDayLabel(day: Date): string {
    return new Intl.DateTimeFormat(this.locale().locale, { weekday: 'long', day: 'numeric', month: 'long' }).format(
      day
    );
  }

  protected columnHeaderLabel(day: Date): string {
    return new Intl.DateTimeFormat(this.locale().locale, { weekday: 'short', day: 'numeric' }).format(day);
  }
}
