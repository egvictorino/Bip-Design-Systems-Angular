import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  OnDestroy,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  type WritableSignal,
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
import { A11yModule } from '@angular/cdk/a11y';
import { type OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  BipFormControlBase,
  BipIdGenerator,
  BipOverlay,
  injectBipLocale,
} from '@bip-design-systems/angular/core';
import type { BipSize } from '@bip-design-systems/angular/core';
import {
  getMinutes,
  isValidTextTime,
  normalizeTextTime,
  pad2,
  parseTime,
  snapToStep,
  to12h,
  to24h,
} from './time-picker-helpers';

export type BipTimePickerStep = 5 | 10 | 15 | 30;
export type BipTimePickerInputMode = 'picker' | 'text';
export type BipTimePickerHourCycle = '12' | '24';

const GAP_PX = 4;

const SIZE_CLASS: Record<BipSize, string> = {
  sm: 'bip-time-picker-trigger--sm',
  md: 'bip-time-picker-trigger--md',
  lg: 'bip-time-picker-trigger--lg',
};

/**
 * Selector de hora — puerto de TimePicker (React). A diferencia de MultiSelect/DatePicker, las
 * columnas de horas/minutos usan patrón `aria-activedescendant` (el foco DOM real se queda en
 * el contenedor `role="listbox"`, solo se resalta visualmente la opción activa) en vez de mover
 * el foco real — ver `testing/a11y.spec.ts`. `value` siempre es una hora 24h `"HH:mm"`
 * (`hourCycle` solo afecta la presentación).
 */
@Component({
  selector: 'bip-time-picker',
  imports: [A11yModule],
  templateUrl: './time-picker.component.html',
  styleUrl: './time-picker.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'bip-time-picker-wrapper',
    '[class.bip-time-picker-wrapper--full-width]': 'fullWidth()',
  },
})
export class BipTimePicker extends BipFormControlBase implements ControlValueAccessor, OnDestroy {
  readonly value = model<string>('');

  readonly placeholder = input<string>('');
  readonly label = input<string>('');
  readonly helperText = input<string>('');
  readonly error = input(false, { transform: booleanAttribute });
  readonly errorMessage = input<string>('');
  readonly loading = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly size = input<BipSize>('md');
  readonly fullWidth = input(false, { transform: booleanAttribute });
  readonly step = input<BipTimePickerStep>(5);
  readonly minTime = input<string | undefined>(undefined);
  readonly maxTime = input<string | undefined>(undefined);
  readonly inputMode = input<BipTimePickerInputMode>('picker');
  readonly hourCycle = input<BipTimePickerHourCycle>('24');

  protected readonly locale = injectBipLocale();
  protected readonly isOpen = signal(false);
  protected readonly focusedHourIdx = signal<number | null>(null);
  protected readonly focusedMinuteIdx = signal<number | null>(null);
  protected readonly announcement = signal('');
  protected readonly textValue = signal('');
  protected readonly textValid = signal(true);

  private readonly timePickerIdGenerator = inject(BipIdGenerator);
  protected readonly hoursListId = this.timePickerIdGenerator.next('bip-time-picker-hours');
  protected readonly minutesListId = this.timePickerIdGenerator.next('bip-time-picker-minutes');
  protected readonly periodListId = this.timePickerIdGenerator.next('bip-time-picker-period');
  protected readonly periods: readonly ('AM' | 'PM')[] = ['AM', 'PM'];

  private onChange: (value: string) => void = () => {};

  @ViewChild('triggerRef') private readonly triggerRef?: ElementRef<HTMLButtonElement>;
  @ViewChild('textInputRef') private readonly textInputRef?: ElementRef<HTMLInputElement>;
  /** Trigger + (en modo texto) input y botón del reloj: clic en cualquiera no cuenta como "fuera". */
  @ViewChild('triggerWrapperRef', { static: true })
  private readonly triggerWrapperRef!: ElementRef<HTMLElement>;
  @ViewChild('panelTemplate', { static: true })
  private readonly panelTemplate!: TemplateRef<unknown>;

  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly bipOverlay = inject(BipOverlay);
  private readonly injector = inject(Injector);
  private overlayRef: OverlayRef | null = null;

  protected readonly hasVisibleMessage = computed(
    () => (this.error() && !!this.errorMessage()) || !!this.helperText()
  );
  protected readonly messageId = computed(() =>
    this.hasVisibleMessage() ? this.errorId : undefined
  );

  protected readonly triggerClass = computed(() => {
    const classes = [SIZE_CLASS[this.size()]];
    if (this.error()) classes.push('bip-time-picker-trigger--error');
    return classes.join(' ');
  });

  protected readonly selected = computed(() => parseTime(this.value()));
  protected readonly selectedHour = computed(() => this.selected().hour);
  protected readonly selectedMinute = computed(() => this.selected().minute);
  protected readonly selectedPeriod = computed<'AM' | 'PM' | null>(() => {
    const hour = this.selectedHour();
    return hour === null ? null : hour < 12 ? 'AM' : 'PM';
  });
  protected readonly selectedHourDisplay = computed(() => {
    const hour = this.selectedHour();
    if (hour === null) return null;
    return this.hourCycle() === '12' ? to12h(hour) : hour;
  });

  protected readonly hoursOptions = computed(() =>
    this.hourCycle() === '12'
      ? [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
      : Array.from({ length: 24 }, (_, i) => i)
  );
  protected readonly minutesOptions = computed(() => getMinutes(this.step()));

  private readonly minParsed = computed(() => parseTime(this.minTime()));
  private readonly maxParsed = computed(() => parseTime(this.maxTime()));

  protected readonly displayValue = computed(() => {
    const { hour, minute } = this.selected();
    if (hour === null || minute === null) return '';
    if (this.hourCycle() === '24') return `${pad2(hour)}:${pad2(minute)}`;
    const period = hour < 12 ? 'AM' : 'PM';
    return `${pad2(to12h(hour))}:${pad2(minute)} ${period}`;
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
    effect(() => {
      const v = this.value();
      untracked(() => this.textValue.set(v));
    });
    effect(() => {
      this.focusedHourIdx();
      this.focusedMinuteIdx();
      untracked(() => this.scrollActiveOptionsIntoView());
    });
    // Auto-ajuste: si el valor queda fuera de [minTime,maxTime] (p.ej. el consumidor cambia
    // minTime en caliente), se recorta al límite más cercano, redondeando al step.
    effect(() => {
      const value = this.value();
      const step = this.step();
      const min = this.minParsed();
      const max = this.maxParsed();
      untracked(() => {
        const parsed = parseTime(value);
        if (parsed.hour === null) return;
        let hour = parsed.hour;
        let minute = parsed.minute ?? 0;
        let changed = false;
        if (min.hour !== null) {
          if (hour < min.hour) {
            hour = min.hour;
            minute = min.minute ?? 0;
            changed = true;
          } else if (hour === min.hour && min.minute !== null && minute < min.minute) {
            minute = Math.min(Math.ceil(min.minute / step) * step, 60 - step);
            changed = true;
          }
        }
        if (max.hour !== null) {
          if (hour > max.hour) {
            hour = max.hour;
            minute = max.minute ?? 0;
            changed = true;
          } else if (hour === max.hour && max.minute !== null && minute > max.minute) {
            minute = snapToStep(max.minute, step);
            changed = true;
          }
        }
        if (changed) this.emitChange(`${pad2(hour)}:${pad2(minute)}`);
      });
    });
  }

  ngOnDestroy(): void {
    this.hidePanel();
  }

  writeValue(value: string): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  private emitChange(next: string): void {
    this.value.set(next);
    this.onChange(next);
  }

  protected isHourDisabled(hour24: number): boolean {
    const min = this.minParsed();
    const max = this.maxParsed();
    if (min.hour !== null && hour24 < min.hour) return true;
    if (max.hour !== null && hour24 > max.hour) return true;
    return false;
  }

  protected isHourOptionDisabled(hourOption: number): boolean {
    if (this.hourCycle() === '24') return this.isHourDisabled(hourOption);
    const period = this.selectedPeriod() ?? 'AM';
    return this.isHourDisabled(to24h(hourOption, period));
  }

  protected isMinuteDisabled(minute: number): boolean {
    const hour = this.selectedHour();
    if (hour === null) return false;
    const min = this.minParsed();
    const max = this.maxParsed();
    if (min.hour !== null && hour === min.hour && min.minute !== null && minute < min.minute)
      return true;
    if (max.hour !== null && hour === max.hour && max.minute !== null && minute > max.minute)
      return true;
    return false;
  }

  protected toggle(): void {
    if (this.disabled() || this.loading()) return;
    if (this.isOpen()) {
      this.closePanel();
      return;
    }
    const hourIdx = this.hoursOptions().indexOf(this.selectedHourDisplay() ?? -1);
    const minuteIdx = this.minutesOptions().indexOf(this.selectedMinute() ?? -1);
    this.focusedHourIdx.set(hourIdx >= 0 ? hourIdx : 0);
    this.focusedMinuteIdx.set(minuteIdx >= 0 ? minuteIdx : 0);
    this.isOpen.set(true);
  }

  protected closePanel(refocusTrigger = false): void {
    this.isOpen.set(false);
    if (refocusTrigger) {
      if (this.inputMode() === 'text') this.textInputRef?.nativeElement.focus();
      else this.triggerRef?.nativeElement.focus();
    }
  }

  protected onEscape(event: Event): void {
    event.preventDefault();
    this.closePanel(true);
  }

  protected onHourSelect(hourOption: number): void {
    if (this.isHourOptionDisabled(hourOption)) return;
    const hour24 =
      this.hourCycle() === '12' ? to24h(hourOption, this.selectedPeriod() ?? 'AM') : hourOption;
    const minute = this.selectedMinute() ?? 0;
    this.emitChange(`${pad2(hour24)}:${pad2(minute)}`);
    this.announcement.set(this.locale().timePicker.hourSelectedAnnouncement(String(hourOption)));
  }

  protected onMinuteSelect(minute: number): void {
    if (this.isMinuteDisabled(minute)) return;
    const hour = this.selectedHour() ?? 0;
    this.emitChange(`${pad2(hour)}:${pad2(minute)}`);
    this.announcement.set(
      this.locale().timePicker.timeSelectedAnnouncement(`${pad2(hour)}:${pad2(minute)}`)
    );
    // El foco real está en el panel (listbox): sin refocus caería a <body> al destruirse.
    this.closePanel(true);
  }

  protected onPeriodSelect(period: 'AM' | 'PM'): void {
    if (this.selectedHour() === null) return;
    const hour24 = to24h(to12h(this.selectedHour()!), period);
    const minute = this.selectedMinute() ?? 0;
    this.emitChange(`${pad2(hour24)}:${pad2(minute)}`);
    this.announcement.set(this.locale().timePicker.periodSelectedAnnouncement(period));
  }

  protected onNow(): void {
    const now = new Date();
    const minute = snapToStep(now.getMinutes(), this.step());
    this.emitChange(`${pad2(now.getHours())}:${pad2(minute)}`);
    this.closePanel(true);
  }

  protected onTextChange(text: string): void {
    this.textValue.set(text);
    if (isValidTextTime(text)) {
      this.textValid.set(true);
      this.emitChange(normalizeTextTime(text));
    } else {
      this.textValid.set(text.trim() === '');
    }
  }

  protected onTextBlur(): void {
    if (!this.textValid()) {
      this.textValue.set(this.value());
      this.textValid.set(true);
    } else if (this.textValue().trim() === '') {
      this.emitChange('');
    }
    this.markTouched();
  }

  protected pad(value: number): string {
    return pad2(value);
  }

  protected onClockClick(): void {
    this.toggle();
  }

  protected onBlur(): void {
    this.markTouched();
  }

  private moveColumnFocus(
    options: number[],
    isDisabled: (value: number) => boolean,
    focusedIdx: WritableSignal<number | null>,
    from: number,
    dir: 1 | -1
  ): void {
    let idx = from + dir;
    while (idx >= 0 && idx < options.length) {
      if (!isDisabled(options[idx])) {
        focusedIdx.set(idx);
        return;
      }
      idx += dir;
    }
    // Sin wrap: si no se encuentra un destino válido, el foco se queda donde estaba.
  }

  protected onHourColumnKeydown(event: KeyboardEvent): void {
    this.onColumnKeydown(
      event,
      this.hoursOptions(),
      (v) => this.isHourOptionDisabled(v),
      this.focusedHourIdx,
      (v) => this.onHourSelect(v)
    );
  }

  protected onMinuteColumnKeydown(event: KeyboardEvent): void {
    this.onColumnKeydown(
      event,
      this.minutesOptions(),
      (v) => this.isMinuteDisabled(v),
      this.focusedMinuteIdx,
      (v) => this.onMinuteSelect(v)
    );
  }

  private onColumnKeydown(
    event: KeyboardEvent,
    options: number[],
    isDisabled: (value: number) => boolean,
    focusedIdx: WritableSignal<number | null>,
    onSelect: (value: number) => void
  ): void {
    const current = focusedIdx() ?? -1;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.moveColumnFocus(options, isDisabled, focusedIdx, current, 1);
        return;
      case 'ArrowUp':
        event.preventDefault();
        this.moveColumnFocus(options, isDisabled, focusedIdx, current, -1);
        return;
      case 'Home':
        event.preventDefault();
        this.moveColumnFocus(options, isDisabled, focusedIdx, -1, 1);
        return;
      case 'End':
        event.preventDefault();
        this.moveColumnFocus(options, isDisabled, focusedIdx, options.length, -1);
        return;
      case 'Enter':
      case ' ': {
        event.preventDefault();
        const idx = focusedIdx();
        if (idx !== null && !isDisabled(options[idx])) onSelect(options[idx]);
        return;
      }
    }
  }

  private showPanel(): void {
    // Modo texto: no hay `#triggerRef`; el panel se ancla al input.
    const origin = this.triggerRef ?? this.textInputRef;
    if (this.overlayRef || !origin) return;
    const overlayRef = this.bipOverlay.create(
      {
        positionStrategy: this.bipOverlay
          .position()
          .flexibleConnectedTo(origin)
          .withPositions([
            {
              originX: 'start',
              originY: 'bottom',
              overlayX: 'start',
              overlayY: 'top',
              offsetY: GAP_PX,
            },
            {
              originX: 'start',
              originY: 'top',
              overlayX: 'start',
              overlayY: 'bottom',
              offsetY: -GAP_PX,
            },
          ])
          .withPush(true),
        scrollStrategy: this.bipOverlay.scrollStrategies.reposition(),
        hasBackdrop: false,
      },
      this.injector
    );
    overlayRef.attach(new TemplatePortal(this.panelTemplate, this.viewContainerRef));
    overlayRef.outsidePointerEvents().subscribe((event) => {
      // El wrapper incluye el botón del reloj: pulsarlo no cuenta como clic fuera (si no, cerraría
      // el panel y el `toggle()` del mismo clic lo reabriría).
      const wrapper = this.triggerWrapperRef.nativeElement;
      if (event.target instanceof Node && wrapper.contains(event.target)) return;
      this.closePanel();
    });
    this.overlayRef = overlayRef;
    queueMicrotask(() => {
      overlayRef.overlayElement.querySelector<HTMLElement>('[role="dialog"]')?.focus();
      // El effect de scroll ya corrió al abrir; aquí se repite por si el overlay se adjuntó después.
      this.scrollActiveOptionsIntoView();
    });
  }

  /**
   * Con `aria-activedescendant` el navegador no hace scroll a la opción activa: se hace aquí, al
   * abrir (para ver el valor actual) y al moverse con el teclado.
   */
  private scrollActiveOptionsIntoView(): void {
    const panel = this.overlayRef?.overlayElement;
    if (!panel) return;
    const hour = this.focusedHourIdx();
    const minute = this.focusedMinuteIdx();
    const ids = [
      hour !== null ? `${this.hoursListId}-opt-${this.hoursOptions()[hour]}` : null,
      minute !== null ? `${this.minutesListId}-opt-${this.minutesOptions()[minute]}` : null,
    ];
    for (const id of ids)
      // `scrollIntoView` no existe en jsdom.
      if (id)
        panel.querySelector(`[id="${CSS.escape(id)}"]`)?.scrollIntoView?.({ block: 'nearest' });
  }

  private hidePanel(): void {
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }
}
