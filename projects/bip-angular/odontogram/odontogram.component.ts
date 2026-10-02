import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { BipIdGenerator, injectBipLocale, type BipSize } from '@bip-design-systems/angular/core';
import { BipToothDetail } from './tooth-detail.component';
import { BipToothSvg } from './tooth-svg.component';
import {
  EMPTY_TOOTH,
  LOWER_LEFT,
  LOWER_RIGHT,
  PRIMARY_LOWER_LEFT,
  PRIMARY_LOWER_RIGHT,
  PRIMARY_UPPER_LEFT,
  PRIMARY_UPPER_RIGHT,
  UPPER_LEFT,
  UPPER_RIGHT,
  toothArch,
  type DentitionMode,
  type OdontogramValue,
  type ToothData,
} from './odontogram.types';

export type {
  OdontogramValue,
  ToothData,
  ToothCondition,
  ToothSurface,
  SurfaceCondition,
  DentitionMode,
  ToothImageType,
  ToothImage,
} from './odontogram.types';

/**
 * Odontograma — puerto de `Odontogram` (React). `[(value)]` en vez de `value`+`onChange`: el
 * eje de datos es un `model()` (dos vías), y la interactividad depende solo de `disabled()` —
 * a diferencia de la referencia React, que también exigía un `onChange` no-nulo (gating que no
 * tiene sentido con un `model()` de Angular, siempre bidireccional).
 *
 * Al seleccionar un diente se abre `<bip-tooth-detail>` debajo de la cuadrícula; los cambios de
 * condición/notas/imágenes de ese diente vuelven aquí vía `(dataChange)` y se funden en `value()`.
 */
@Component({
  selector: 'bip-odontogram',
  imports: [NgTemplateOutlet, BipToothSvg, BipToothDetail],
  templateUrl: './odontogram.component.html',
  styleUrl: './odontogram.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'group',
    class: 'bip-odontogram',
    '[attr.aria-labelledby]': 'label() ? labelId : null',
  },
})
export class BipOdontogram {
  readonly value = model<OdontogramValue>({});
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly dentition = input<DentitionMode>('permanent');
  readonly label = input<string>('');
  readonly size = input<BipSize>('md');

  protected readonly locale = injectBipLocale();
  protected readonly labelId = inject(BipIdGenerator).next('bip-odontogram-label');

  protected readonly selectedTooth = signal<number | null>(null);
  protected readonly interactive = computed(() => !this.disabled());

  protected readonly upperRight = computed(() =>
    this.dentition() === 'primary' ? PRIMARY_UPPER_RIGHT : UPPER_RIGHT
  );
  protected readonly upperLeft = computed(() =>
    this.dentition() === 'primary' ? PRIMARY_UPPER_LEFT : UPPER_LEFT
  );
  protected readonly lowerRight = computed(() =>
    this.dentition() === 'primary' ? PRIMARY_LOWER_RIGHT : LOWER_RIGHT
  );
  protected readonly lowerLeft = computed(() =>
    this.dentition() === 'primary' ? PRIMARY_LOWER_LEFT : LOWER_LEFT
  );

  protected readonly numberSizeClass = computed(() => `bip-odontogram-number--${this.size()}`);

  protected readonly selectedToothArch = computed(() => {
    const selected = this.selectedTooth();
    return selected === null ? null : toothArch(selected);
  });

  protected readonly selectedToothData = computed(() => {
    const selected = this.selectedTooth();
    return selected === null ? EMPTY_TOOTH : (this.value()[selected] ?? EMPTY_TOOTH);
  });

  protected toothData(toothNumber: number): ToothData {
    return this.value()[toothNumber] ?? EMPTY_TOOTH;
  }

  protected toothSelectLabel(toothNumber: number): string {
    return this.locale().odontogram.selectTooth(toothNumber, this.selectedTooth() === toothNumber);
  }

  protected handleToothSelect(toothNumber: number): void {
    this.selectedTooth.update((prev) => (prev === toothNumber ? null : toothNumber));
  }

  protected handleDetailClose(): void {
    this.selectedTooth.set(null);
  }

  protected handleToothDataChange(toothData: ToothData): void {
    const selected = this.selectedTooth();
    if (selected === null) return;

    const current = this.value();
    if (Object.keys(toothData).length === 0) {
      const next = { ...current };
      delete next[selected];
      this.value.set(next);
    } else {
      this.value.set({ ...current, [selected]: toothData });
    }
  }
}
