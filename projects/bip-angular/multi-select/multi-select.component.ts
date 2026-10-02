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
  linkedSignal,
  model,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import { type OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  BipFormControlBase,
  BipIdGenerator,
  BipOverlay,
  firstEnabledIndex,
  injectBipLocale,
  matchesSearch,
  nextEnabledIndex,
} from '@bip-design-systems/angular/core';
import type { BipSize } from '@bip-design-systems/angular/core';

export type BipMultiSelectVariant = 'outlined' | 'filled' | 'bare';

/** Dónde se escribe la búsqueda: en el panel (default) o junto a los chips, en el propio campo. */
export type BipMultiSelectSearchPlacement = 'trigger' | 'panel';

export interface BipMultiSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
}

/** Entrada navegable con `aria-activedescendant` (modo `searchPlacement="trigger"`): "seleccionar todo" u opción. */
interface BipMultiSelectEntry {
  option: BipMultiSelectOption | null;
  disabled: boolean;
  id: string;
}

interface BipMultiSelectGroup {
  name: string;
  options: BipMultiSelectOption[];
}

const VARIANT_CLASS: Record<BipMultiSelectVariant, string> = {
  outlined: 'bip-multi-select--outlined',
  filled: 'bip-multi-select--filled',
  bare: 'bip-multi-select--bare',
};

const SIZE_CLASS: Record<BipSize, string> = {
  sm: 'bip-multi-select--sm',
  md: 'bip-multi-select--md',
  lg: 'bip-multi-select--lg',
};

const CHIP_SIZE_CLASS: Record<BipSize, string> = {
  sm: 'bip-multi-select-chip--sm',
  md: 'bip-multi-select-chip--md',
  lg: 'bip-multi-select-chip--lg',
};

/** Debe calzar con el `gap` del CSS entre trigger y panel. */
const GAP_PX = 4;

/**
 * Combobox multiselección con búsqueda, chips y agrupación — puerto de MultiSelect (React).
 * Por defecto (`searchPlacement="panel"`) el foco real se mueve entre los `<li role="option">` del
 * panel (no `aria-activedescendant`, igual que la referencia), vía `querySelectorAll` sobre el panel.
 * Con `searchPlacement="trigger"` se escribe junto a los chips, en el propio campo ("tags input"):
 * el foco real nunca sale del `<input role="combobox">` y la opción activa se anuncia con
 * `aria-activedescendant` (como `BipSelect`). Ver `testing/a11y.spec.ts` para ARIA/teclado.
 */
@Component({
  selector: 'bip-multi-select',
  templateUrl: './multi-select.component.html',
  styleUrl: './multi-select.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'bip-multi-select-wrapper',
    '[class.bip-multi-select-wrapper--full-width]': 'fullWidth()',
  },
})
export class BipMultiSelect extends BipFormControlBase implements ControlValueAccessor, OnDestroy {
  readonly value = model<string[]>([]);

  readonly options = input<BipMultiSelectOption[]>([]);
  readonly variant = input<BipMultiSelectVariant>('outlined');
  readonly size = input<BipSize>('md');
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  /** Muestra el buscador dentro del panel. Con `false` el panel abre directo en la lista de opciones. */
  readonly search = input(true, { transform: booleanAttribute });
  /**
   * Con `search`: `'panel'` (default) deja el buscador dentro del panel; `'trigger'` permite escribir
   * junto a los chips, en el propio campo (`placeholder` va en ese input; `searchPlaceholder` no aplica).
   */
  readonly searchPlacement = input<BipMultiSelectSearchPlacement>('panel');
  readonly searchPlaceholder = input<string>('');
  readonly helperText = input<string>('');
  readonly error = input(false, { transform: booleanAttribute });
  readonly errorMessage = input<string>('');
  readonly fullWidth = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly maxVisibleChips = input<number | undefined>(undefined);
  readonly showSelectAll = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  /** Si es `true`, no filtra internamente — asume que el consumidor ya filtró `options()` a partir de `search`. */
  readonly externalFilter = input(false, { transform: booleanAttribute });

  readonly searchQuery = output<string>();

  protected readonly locale = injectBipLocale();
  protected readonly listboxId = inject(BipIdGenerator).next('bip-multi-select-listbox');
  protected readonly focused = signal(false);
  protected readonly isOpen = signal(false);
  protected readonly query = signal('');
  /** Intención de la opción activa (modo `trigger`); `activeIndex` la corrige si ya no es válida. */
  private readonly activeRaw = signal(-1);

  private onChange: (value: string[]) => void = () => {};

  @ViewChild('triggerRef', { static: true })
  private readonly triggerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('panelTemplate', { static: true })
  private readonly panelTemplate!: TemplateRef<unknown>;
  @ViewChild('searchInputRef') private readonly searchInputRef?: ElementRef<HTMLInputElement>;
  private readonly inlineInputRef = viewChild<ElementRef<HTMLInputElement>>('inlineInputRef');

  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly bipOverlay = inject(BipOverlay);
  private readonly injector = inject(Injector);
  private overlayRef: OverlayRef | null = null;
  private panelElement: HTMLElement | null = null;

  protected readonly hasVisibleMessage = computed(
    () => (this.error() && !!this.errorMessage()) || !!this.helperText()
  );
  protected readonly messageId = computed(() =>
    this.hasVisibleMessage() ? this.errorId : undefined
  );
  /**
   * `<label for>` no asocia accesiblemente un `<div role="combobox">` — ese comportamiento
   * del navegador es solo para controles de formulario nativos. El trigger necesita
   * `aria-labelledby` apuntando al `id` del propio `<label>` para tener nombre accesible
   * (detectado por `visual/a11y-browser.spec.ts`: axe `aria-input-field-name`).
   */
  protected readonly labelId = `${this.fieldId}-label`;

  protected readonly filteredOptions = computed<BipMultiSelectOption[]>(() => {
    if (this.externalFilter()) return this.options();
    const q = this.query();
    if (!q.trim()) return this.options();
    const locale = this.locale().locale;
    return this.options().filter((option) => matchesSearch(option, q, locale));
  });

  protected readonly hasGroups = computed(() =>
    this.options().some((option) => option.group !== undefined)
  );

  protected readonly groupedOptions = computed<BipMultiSelectGroup[]>(() => {
    if (!this.hasGroups()) return [{ name: '', options: this.filteredOptions() }];
    const buckets = new Map<string, BipMultiSelectOption[]>();
    for (const option of this.filteredOptions()) {
      const key = option.group ?? '';
      const bucket = buckets.get(key);
      if (bucket) bucket.push(option);
      else buckets.set(key, [option]);
    }
    const groups: BipMultiSelectGroup[] = [];
    if (buckets.has('')) groups.push({ name: '', options: buckets.get('')! });
    for (const [name, opts] of buckets) {
      if (name === '') continue;
      groups.push({ name, options: opts });
    }
    return groups;
  });

  protected readonly selectableFiltered = computed(() =>
    this.filteredOptions().filter((o) => !o.disabled)
  );
  protected readonly allFilteredSelected = computed(() => {
    const selectable = this.selectableFiltered();
    return selectable.length > 0 && selectable.every((o) => this.value().includes(o.value));
  });

  protected readonly inlineSearch = computed(
    () => this.search() && this.searchPlacement() === 'trigger'
  );

  /**
   * Opciones elegidas conocidas. Las que ya no están en `options()` (p. ej. `externalFilter`, donde el
   * consumidor reemplaza la lista al buscar) se recuerdan para no perder su chip; un valor que nunca
   * estuvo en `options()` no tiene label conocido y no se muestra.
   */
  private readonly knownSelected = linkedSignal<
    { value: string[]; options: BipMultiSelectOption[] },
    Map<string, BipMultiSelectOption>
  >({
    source: () => ({ value: this.value(), options: this.options() }),
    computation: (source, previous) => {
      const known = new Map<string, BipMultiSelectOption>();
      for (const v of source.value) {
        const option = source.options.find((o) => o.value === v) ?? previous?.value.get(v);
        if (option) known.set(v, option);
      }
      return known;
    },
  });

  protected readonly selectedOptions = computed(() => {
    const selected = new Set(this.value());
    const current = this.options().filter((o) => selected.has(o.value));
    const present = new Set(current.map((o) => o.value));
    const remembered = [...this.knownSelected().values()].filter((o) => !present.has(o.value));
    return [...current, ...remembered];
  });
  protected readonly visibleChips = computed(() => {
    const max = this.maxVisibleChips();
    const selected = this.selectedOptions();
    return max !== undefined ? selected.slice(0, max) : selected;
  });
  protected readonly hiddenChipsCount = computed(() => {
    const max = this.maxVisibleChips();
    if (max === undefined) return 0;
    return Math.max(0, this.selectedOptions().length - max);
  });

  protected readonly selectAllLabel = computed(() =>
    this.query().trim() !== ''
      ? this.locale().multiSelect.selectVisible(this.selectableFiltered().length)
      : this.locale().multiSelect.selectAll
  );

  /** Lista plana navegable del modo `trigger`: "seleccionar todo" (si aplica) y luego las opciones en orden visual. */
  protected readonly entries = computed<BipMultiSelectEntry[]>(() => {
    const list: BipMultiSelectEntry[] = [];
    if (this.showSelectAll() && this.filteredOptions().length > 0) {
      list.push({ option: null, disabled: false, id: `${this.listboxId}-all` });
    }
    for (const group of this.groupedOptions()) {
      for (const option of group.options) {
        list.push({
          option,
          disabled: !!option.disabled,
          id: `${this.listboxId}-opt-${list.length}`,
        });
      }
    }
    return list;
  });

  private readonly entryIdByValue = computed(
    () =>
      new Map(this.entries().flatMap((e) => (e.option ? [[e.option.value, e.id] as const] : [])))
  );

  protected readonly activeIndex = computed(() => {
    if (this.loading()) return -1;
    const entries = this.entries();
    const raw = this.activeRaw();
    return entries[raw] && !entries[raw].disabled ? raw : firstEnabledIndex(entries);
  });

  protected readonly activeOptionId = computed(() =>
    this.inlineSearch() && this.isOpen() ? (this.entries()[this.activeIndex()]?.id ?? null) : null
  );

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
      const id = this.activeOptionId();
      if (!id) return;
      untracked(() => {
        // `scrollIntoView` no existe en jsdom.
        this.panelElement?.querySelector(`#${id}`)?.scrollIntoView?.({ block: 'nearest' });
      });
    });
    effect(() => {
      // Se emite en cada cambio de query (incluido el '' inicial al abrir), para que un
      // consumidor con `externalFilter` pueda filtrar `options()` él mismo.
      const q = this.query();
      untracked(() => this.searchQuery.emit(q));
    });
  }

  ngOnDestroy(): void {
    this.hidePanel();
  }

  writeValue(value: string[]): void {
    this.value.set(value ?? []);
  }

  registerOnChange(fn: (value: string[]) => void): void {
    this.onChange = fn;
  }

  private emitChange(next: string[]): void {
    this.value.set(next);
    this.onChange(next);
  }

  protected onTriggerClick(event: MouseEvent): void {
    if (!this.inlineSearch()) {
      this.toggle();
      return;
    }
    if (this.disabled()) return;
    this.inlineInputRef()?.nativeElement.focus();
    const onChevron =
      event.target instanceof Element && !!event.target.closest('.bip-multi-select-chevron');
    if (onChevron) this.toggle();
    else this.openPanel();
  }

  /** En modo `trigger` el foco no debe salir del `<input>` al pulsar chips, botones o el marco. */
  protected onTriggerMousedown(event: MouseEvent): void {
    if (this.inlineSearch() && event.target !== this.inlineInputRef()?.nativeElement)
      event.preventDefault();
  }

  /** En modo `trigger` el panel completo mantiene el foco en el `<input>`. */
  protected onPanelMousedown(event: MouseEvent): void {
    if (this.inlineSearch()) event.preventDefault();
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (this.inlineSearch()) return;
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
      event.preventDefault();
      this.openPanel();
    }
  }

  protected toggle(): void {
    if (this.disabled()) return;
    this.isOpen.update((open) => !open);
  }

  protected openPanel(): void {
    if (this.disabled()) return;
    this.isOpen.set(true);
  }

  protected closePanel(refocusTrigger = false): void {
    this.isOpen.set(false);
    this.query.set('');
    this.activeRaw.set(-1);
    if (refocusTrigger) this.triggerRef.nativeElement.focus();
  }

  protected toggleOption(option: BipMultiSelectOption): void {
    if (option.disabled) return;
    const current = this.value();
    const next = current.includes(option.value)
      ? current.filter((v) => v !== option.value)
      : [...current, option.value];
    this.emitChange(next);
  }

  protected removeOption(value: string, event: Event): void {
    event.stopPropagation();
    this.emitChange(this.value().filter((v) => v !== value));
  }

  protected clearAll(event: Event): void {
    event.stopPropagation();
    this.emitChange([]);
  }

  protected handleSelectAll(): void {
    const selectable = this.selectableFiltered();
    if (this.allFilteredSelected()) {
      const toRemove = new Set(selectable.map((o) => o.value));
      this.emitChange(this.value().filter((v) => !toRemove.has(v)));
    } else {
      const toAdd = selectable.map((o) => o.value).filter((v) => !this.value().includes(v));
      this.emitChange([...this.value(), ...toAdd]);
    }
  }

  protected onSearchInput(value: string): void {
    this.query.set(value);
  }

  protected onInlineInput(value: string): void {
    this.query.set(value);
    this.activeRaw.set(-1);
    this.openPanel();
  }

  protected onInlineBlur(): void {
    this.closePanel();
    this.onBlur();
  }

  protected onInlineKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp':
        event.preventDefault();
        if (!this.isOpen()) this.openPanel();
        else
          this.activeRaw.set(
            nextEnabledIndex(this.entries(), this.activeIndex(), event.key === 'ArrowDown' ? 1 : -1)
          );
        return;
      case 'Enter': {
        if (!this.isOpen()) return;
        // Evita que Enter envíe el <form> mientras el panel está abierto.
        event.preventDefault();
        const entry = this.entries()[this.activeIndex()];
        if (!entry) return;
        if (entry.option) this.toggleOption(entry.option);
        else this.handleSelectAll();
        // Multiselección: el panel sigue abierto; se limpia lo escrito y la opción activa se queda donde estaba.
        this.query.set('');
        this.activeRaw.set(this.entries().findIndex((e) => e.id === entry.id));
        return;
      }
      case 'Escape':
        if (!this.isOpen()) return;
        event.preventDefault();
        event.stopPropagation();
        this.closePanel();
        return;
      case 'Backspace': {
        if (this.query() !== '') return;
        const last = this.visibleChips().at(-1);
        if (!last || last.disabled) return;
        event.preventDefault();
        this.emitChange(this.value().filter((v) => v !== last.value));
        return;
      }
    }
  }

  protected entryId(option: BipMultiSelectOption): string | null {
    return this.inlineSearch() ? (this.entryIdByValue().get(option.value) ?? null) : null;
  }

  protected isActive(option: BipMultiSelectOption): boolean {
    const id = this.activeOptionId();
    return !!id && id === this.entryIdByValue().get(option.value);
  }

  protected onSearchKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.focusableOptionElements()[0]?.focus();
    }
  }

  protected onListboxKeydown(event: KeyboardEvent): void {
    const items = this.focusableOptionElements();
    if (items.length === 0) return;
    const active = this.panelElement?.ownerDocument.activeElement as HTMLElement | null;
    const idx = active ? items.indexOf(active) : -1;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        items[(idx + 1 + items.length) % items.length]?.focus();
        return;
      case 'ArrowUp':
        event.preventDefault();
        items[(idx - 1 + items.length) % items.length]?.focus();
        return;
      case 'Home':
        event.preventDefault();
        items[0]?.focus();
        return;
      case 'End':
        event.preventDefault();
        items[items.length - 1]?.focus();
        return;
      case 'Tab':
        if (event.shiftKey) {
          event.preventDefault();
          if (this.search()) this.searchInputRef?.nativeElement.focus();
          else this.closePanel(true);
        } else {
          this.closePanel();
        }
        return;
    }
  }

  protected onOptionKeydown(event: KeyboardEvent, option: BipMultiSelectOption): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggleOption(option);
    }
  }

  protected onSelectAllKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.handleSelectAll();
    }
  }

  protected onFocus(): void {
    this.focused.set(true);
  }

  protected onBlur(): void {
    this.focused.set(false);
    this.markTouched();
  }

  protected isSelected(value: string): boolean {
    return this.value().includes(value);
  }

  protected readonly triggerClass = computed(() => {
    const classes = [VARIANT_CLASS[this.variant()], SIZE_CLASS[this.size()]];
    if (this.error()) classes.push('bip-multi-select--error');
    if (this.disabled()) classes.push('bip-multi-select--disabled');
    if (this.inlineSearch()) classes.push('bip-multi-select--inline');
    return classes.join(' ');
  });

  protected readonly chipClass = computed(() => CHIP_SIZE_CLASS[this.size()]);

  private focusableOptionElements(): HTMLElement[] {
    if (!this.panelElement) return [];
    return Array.from(
      this.panelElement.querySelectorAll<HTMLElement>('[data-bip-option]:not([data-bip-disabled])')
    );
  }

  private showPanel(): void {
    if (this.overlayRef) return;
    const overlayRef = this.bipOverlay.create(
      {
        positionStrategy: this.bipOverlay
          .position()
          .flexibleConnectedTo(this.triggerRef)
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
          .withPush(true)
          .withFlexibleDimensions(false),
        scrollStrategy: this.bipOverlay.scrollStrategies.reposition(),
        minWidth: this.triggerRef.nativeElement.offsetWidth,
        hasBackdrop: false,
      },
      this.injector
    );
    overlayRef.attach(new TemplatePortal(this.panelTemplate, this.viewContainerRef));
    this.panelElement = overlayRef.overlayElement;
    overlayRef.outsidePointerEvents().subscribe((event) => {
      const trigger = this.triggerRef.nativeElement;
      if (event.target instanceof Node && trigger.contains(event.target)) return;
      this.closePanel();
    });
    this.overlayRef = overlayRef;
    if (this.inlineSearch()) return;
    queueMicrotask(() => {
      if (this.search()) this.searchInputRef?.nativeElement.focus();
      else this.focusableOptionElements()[0]?.focus();
    });
  }

  private hidePanel(): void {
    this.overlayRef?.dispose();
    this.overlayRef = null;
    this.panelElement = null;
  }

  protected onPanelEscape(event: Event): void {
    event.preventDefault();
    this.closePanel(true);
  }
}
