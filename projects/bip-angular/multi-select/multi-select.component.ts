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
  output,
  signal,
  untracked,
} from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import { Overlay, type OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { BipFormControlBase, BipIdGenerator, BipOverlay, injectBipLocale } from '@bip-design-systems/angular/core';
import type { BipSize } from '@bip-design-systems/angular/core';

export type BipMultiSelectVariant = 'outlined' | 'filled' | 'bare';

export interface BipMultiSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
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
 * El foco real se mueve entre los `<li role="option">` del panel (no `aria-activedescendant`,
 * igual que la referencia), vía `querySelectorAll` sobre el panel — ver
 * `testing/a11y.spec.ts` para el detalle de ARIA/teclado.
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

  private onChange: (value: string[]) => void = () => {};

  @ViewChild('triggerRef', { static: true }) private readonly triggerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('panelTemplate', { static: true }) private readonly panelTemplate!: TemplateRef<unknown>;
  @ViewChild('searchInputRef') private readonly searchInputRef?: ElementRef<HTMLInputElement>;

  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly bipOverlay = inject(BipOverlay);
  private readonly cdkOverlay = inject(Overlay);
  private readonly injector = inject(Injector);
  private overlayRef: OverlayRef | null = null;
  private panelElement: HTMLElement | null = null;

  protected readonly hasVisibleMessage = computed(() => (this.error() && !!this.errorMessage()) || !!this.helperText());
  protected readonly messageId = computed(() => (this.hasVisibleMessage() ? this.errorId : undefined));

  protected readonly filteredOptions = computed<BipMultiSelectOption[]>(() => {
    if (this.externalFilter()) return this.options();
    const q = this.query().trim().toLowerCase();
    if (!q) return this.options();
    return this.options().filter(
      (option) => option.label.toLowerCase().includes(q) || option.value.toLowerCase().includes(q)
    );
  });

  protected readonly hasGroups = computed(() => this.options().some((option) => option.group !== undefined));

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

  protected readonly selectableFiltered = computed(() => this.filteredOptions().filter((o) => !o.disabled));
  protected readonly allFilteredSelected = computed(() => {
    const selectable = this.selectableFiltered();
    return selectable.length > 0 && selectable.every((o) => this.value().includes(o.value));
  });

  protected readonly selectedOptions = computed(() => this.options().filter((o) => this.value().includes(o.value)));
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

  protected onTriggerClick(): void {
    this.toggle();
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
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
          this.searchInputRef?.nativeElement.focus();
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
    return classes.join(' ');
  });

  protected readonly chipClass = computed(() => CHIP_SIZE_CLASS[this.size()]);

  private focusableOptionElements(): HTMLElement[] {
    if (!this.panelElement) return [];
    return Array.from(this.panelElement.querySelectorAll<HTMLElement>('[data-bip-option]:not([data-bip-disabled])'));
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
          .withPush(true)
          .withFlexibleDimensions(false),
        scrollStrategy: this.cdkOverlay.scrollStrategies.reposition(),
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
    queueMicrotask(() => this.searchInputRef?.nativeElement.focus());
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
