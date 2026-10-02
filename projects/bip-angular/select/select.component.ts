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
  model,
  signal,
  untracked,
} from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';
import { type OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  BipFormControlBase,
  BipIdGenerator,
  BipOverlay,
  injectBipLocale,
  matchesSearch,
} from '@bip-design-systems/angular/core';
import type { BipSize } from '@bip-design-systems/angular/core';
import { input as ngInput } from '@angular/core';

export type BipSelectVariant = 'outlined' | 'filled' | 'bare';

export interface BipSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface BipSelectOptionGroup {
  label: string;
  options: BipSelectOption[];
  disabled?: boolean;
}

interface BipSelectEntry {
  option: BipSelectOption;
  disabled: boolean;
  /** Posición en la lista plana visible; también sufijo del id (`aria-activedescendant`). */
  index: number;
  id: string;
}

interface BipSelectVisibleGroup {
  label: string;
  id: string;
  entries: BipSelectEntry[];
}

/** Debe calzar con el `gap` del CSS entre el campo y el panel. */
const GAP_PX = 4;

const LABEL_SIZE_CLASS: Record<BipSize, string> = {
  sm: 'bip-select-label--sm',
  md: 'bip-select-label--md',
  lg: 'bip-select-label--lg',
};

const HELPER_SIZE_CLASS: Record<BipSize, string> = {
  sm: 'bip-select-helper--sm',
  md: 'bip-select-helper--sm',
  lg: 'bip-select-helper--lg',
};

const VARIANT_CLASS: Record<BipSelectVariant, string> = {
  outlined: 'bip-select--outlined',
  filled: 'bip-select--filled',
  bare: 'bip-select--bare',
};

const SIZE_CLASS: Record<BipSize, string> = {
  sm: 'bip-select--sm',
  md: 'bip-select--md',
  lg: 'bip-select--lg',
};

/**
 * Selector nativo (`<select>`) — misma decisión que la referencia React, sin reimplementar un listbox custom.
 *
 * Con `search` pasa a ser un combobox editable (patrón WAI-ARIA "editable combobox with list
 * autocomplete"): se escribe en el propio campo y el listbox del overlay se filtra. El foco real
 * nunca sale del `<input>`; la opción activa se anuncia con `aria-activedescendant`.
 */
@Component({
  selector: 'bip-select',
  templateUrl: './select.component.html',
  styleUrl: './select.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'bip-select-wrapper',
    '[class.bip-select-wrapper--full-width]': 'fullWidth()',
  },
})
export class BipSelect extends BipFormControlBase implements ControlValueAccessor, OnDestroy {
  readonly value = model('');

  readonly variant = ngInput<BipSelectVariant>('outlined');
  readonly size = ngInput<BipSize>('md');
  readonly label = ngInput<string>('');
  readonly helperText = ngInput<string>('');
  readonly error = ngInput(false, { transform: booleanAttribute });
  readonly errorMessage = ngInput<string>('');
  readonly fullWidth = ngInput(false, { transform: booleanAttribute });
  readonly required = ngInput(false, { transform: booleanAttribute });
  readonly placeholder = ngInput<string>('');
  readonly options = ngInput<BipSelectOption[]>([]);
  readonly groups = ngInput<BipSelectOptionGroup[]>([]);
  /** Convierte el campo en un combobox editable que filtra las opciones mientras se escribe. */
  readonly search = ngInput(false, { transform: booleanAttribute });

  protected readonly locale = injectBipLocale();
  protected readonly listboxId = inject(BipIdGenerator).next('bip-select-listbox');
  protected readonly focused = signal(false);
  protected readonly isOpen = signal(false);
  /** Texto que el usuario está escribiendo; `null` = no está escribiendo (el campo muestra la opción elegida). */
  protected readonly query = signal<string | null>(null);
  protected readonly activeIndex = signal(-1);

  @ViewChild('containerRef', { static: true })
  private readonly containerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('panelTemplate', { static: true })
  private readonly panelTemplate!: TemplateRef<unknown>;

  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly bipOverlay = inject(BipOverlay);
  private readonly injector = inject(Injector);
  private overlayRef: OverlayRef | null = null;
  private panelElement: HTMLElement | null = null;

  private onChange: (value: string) => void = () => {};

  protected readonly hasVisibleMessage = computed(
    () => (this.error() && !!this.errorMessage()) || !!this.helperText()
  );
  protected readonly messageId = computed(() =>
    this.hasVisibleMessage() ? this.errorId : undefined
  );

  protected readonly labelClass = computed(() => {
    const classes = [LABEL_SIZE_CLASS[this.size()]];
    classes.push(
      this.error()
        ? 'bip-select-label--error'
        : this.focused()
          ? 'bip-select-label--focused'
          : 'bip-select-label--normal'
    );
    if (this.disabled()) classes.push('bip-select-label--disabled');
    return classes.join(' ');
  });

  protected readonly helperClass = computed(() => HELPER_SIZE_CLASS[this.size()]);

  protected readonly selectClass = computed(() => {
    const classes = [VARIANT_CLASS[this.variant()], SIZE_CLASS[this.size()]];
    if (this.error()) classes.push('bip-select--error');
    return classes.join(' ');
  });

  protected readonly chevronClass = computed(() => {
    const classes = ['bip-select-chevron'];
    classes.push(
      this.error()
        ? 'bip-select-chevron--error'
        : this.focused()
          ? 'bip-select-chevron--focused'
          : 'bip-select-chevron--normal'
    );
    if (this.disabled()) classes.push('bip-select-chevron--disabled');
    return classes.join(' ');
  });

  protected readonly selectedLabel = computed(() => {
    const current = this.value();
    const all = [...this.options(), ...this.groups().flatMap((group) => group.options)];
    return all.find((option) => option.value === current)?.label ?? '';
  });

  /** Lo que muestra el `<input>`: lo escrito mientras se busca, la opción elegida el resto del tiempo. */
  protected readonly displayText = computed(() => this.query() ?? this.selectedLabel());

  /** Opciones visibles tras filtrar, ya con índice/id; sin grupos que se quedaron vacíos. */
  protected readonly visible = computed(() => {
    const q = this.query() ?? '';
    const locale = this.locale().locale;
    let index = 0;
    const toEntries = (list: BipSelectOption[], groupDisabled: boolean): BipSelectEntry[] =>
      list
        .filter((option) => matchesSearch(option, q, locale))
        .map((option) => {
          const entry = {
            option,
            disabled: !!option.disabled || groupDisabled,
            index,
            id: `${this.listboxId}-opt-${index}`,
          };
          index++;
          return entry;
        });
    const loose = toEntries(this.options(), false);
    const groups: BipSelectVisibleGroup[] = this.groups()
      .map((group, i) => ({
        label: group.label,
        id: `${this.listboxId}-grp-${i}`,
        entries: toEntries(group.options, !!group.disabled),
      }))
      .filter((group) => group.entries.length > 0);
    return { loose, groups, entries: [...loose, ...groups.flatMap((group) => group.entries)] };
  });

  protected readonly activeOptionId = computed(() =>
    this.isOpen() ? (this.visible().entries[this.activeIndex()]?.id ?? null) : null
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

  protected onSelectChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.value.set(value);
    this.onChange(value);
  }

  protected onSearchFocus(): void {
    this.focused.set(true);
  }

  protected onSearchBlur(): void {
    this.closePanel();
    this.onBlur();
  }

  protected onSearchClick(): void {
    this.openPanel();
  }

  protected onChevronClick(): void {
    if (this.disabled()) return;
    if (this.isOpen()) this.closePanel();
    else this.openPanel();
  }

  protected onSearchInput(value: string): void {
    this.query.set(value);
    this.isOpen.set(true);
    this.activeIndex.set(this.firstEnabledIndex());
  }

  protected onSearchKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!this.isOpen()) this.openPanel();
        else if (!event.altKey) this.step(1);
        return;
      case 'ArrowUp':
        event.preventDefault();
        if (!this.isOpen()) this.openPanel();
        else this.step(-1);
        return;
      case 'Enter': {
        if (!this.isOpen()) return;
        // Evita que Enter envíe el <form> mientras el panel está abierto.
        event.preventDefault();
        const entry = this.visible().entries[this.activeIndex()];
        if (entry) this.selectEntry(entry);
        return;
      }
      case 'Escape':
        if (!this.isOpen()) return;
        event.preventDefault();
        event.stopPropagation();
        this.closePanel();
        return;
    }
  }

  protected selectEntry(entry: BipSelectEntry): void {
    if (entry.disabled) return;
    this.value.set(entry.option.value);
    this.onChange(entry.option.value);
    this.closePanel();
  }

  protected openPanel(): void {
    if (this.disabled() || this.isOpen()) return;
    this.activeIndex.set(this.selectedEntryIndex());
    this.isOpen.set(true);
  }

  /** Cierra el panel y descarta lo escrito (el campo vuelve a mostrar la opción elegida). */
  protected closePanel(): void {
    this.isOpen.set(false);
    this.query.set(null);
    this.activeIndex.set(-1);
  }

  /** Evita que un clic en el panel le quite el foco al `<input>` (y dispare blur/touched). */
  protected keepFocus(event: Event): void {
    event.preventDefault();
  }

  private firstEnabledIndex(): number {
    return this.visible().entries.findIndex((entry) => !entry.disabled);
  }

  private selectedEntryIndex(): number {
    const current = this.value();
    const entries = this.visible().entries;
    const selected = entries.find((entry) => entry.option.value === current && !entry.disabled);
    return selected ? selected.index : this.firstEnabledIndex();
  }

  /** Mueve la opción activa saltando las deshabilitadas; sin wrap (se queda en el borde). */
  private step(direction: 1 | -1): void {
    const entries = this.visible().entries;
    let i = this.activeIndex();
    do {
      i += direction;
    } while (i >= 0 && i < entries.length && entries[i].disabled);
    if (i < 0 || i >= entries.length) return;
    this.activeIndex.set(i);
  }

  private showPanel(): void {
    if (this.overlayRef) return;
    const overlayRef = this.bipOverlay.create(
      {
        positionStrategy: this.bipOverlay
          .position()
          .flexibleConnectedTo(this.containerRef)
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
        minWidth: this.containerRef.nativeElement.offsetWidth,
        hasBackdrop: false,
      },
      this.injector
    );
    overlayRef.attach(new TemplatePortal(this.panelTemplate, this.viewContainerRef));
    this.panelElement = overlayRef.overlayElement;
    this.overlayRef = overlayRef;
  }

  private hidePanel(): void {
    this.overlayRef?.dispose();
    this.overlayRef = null;
    this.panelElement = null;
  }

  protected onFocus(): void {
    this.focused.set(true);
  }

  protected onBlur(): void {
    this.focused.set(false);
    this.markTouched();
  }
}
