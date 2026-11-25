import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
} from '@angular/core';

export type BipTextSize = '3xs' | '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type BipTextWeight = 'normal' | 'medium' | 'semibold' | 'bold';
export type BipTextColor =
  | 'default'
  | 'secondary'
  | 'utility'
  | 'disabled'
  | 'important'
  | 'danger'
  | 'success'
  | 'warning'
  | 'info'
  | 'link';
export type BipTextAlign = 'start' | 'center' | 'end';

const SIZE_CLASS: Record<BipTextSize, string> = {
  '3xs': 'bip-text--size-3xs',
  '2xs': 'bip-text--size-2xs',
  xs: 'bip-text--size-xs',
  sm: 'bip-text--size-sm',
  md: 'bip-text--size-base',
  lg: 'bip-text--size-lg',
  xl: 'bip-text--size-xl',
  '2xl': 'bip-text--size-2xl',
};

const WEIGHT_CLASS: Record<BipTextWeight, string> = {
  normal: 'bip-text--weight-normal',
  medium: 'bip-text--weight-medium',
  semibold: 'bip-text--weight-semibold',
  bold: 'bip-text--weight-bold',
};

const COLOR_CLASS: Record<BipTextColor, string> = {
  default: 'bip-text--color-default',
  secondary: 'bip-text--color-secondary',
  utility: 'bip-text--color-utility',
  disabled: 'bip-text--color-disabled',
  important: 'bip-text--color-important',
  danger: 'bip-text--color-danger',
  success: 'bip-text--color-success',
  warning: 'bip-text--color-warning',
  info: 'bip-text--color-info',
  link: 'bip-text--color-link',
};

const ALIGN_CLASS: Record<BipTextAlign, string> = {
  start: 'bip-text--align-start',
  center: 'bip-text--align-center',
  end: 'bip-text--align-end',
};

/**
 * Primitiva de tipografía para texto de cuerpo — ver `bipHeading` para encabezados semánticos
 * con tamaño visual independiente. Selector de atributo: el consumidor elige el elemento host
 * (`<p bipText>` por defecto conceptual, pero también `<span bipText>`, `<label bipText>`...).
 */
@Component({
  selector: '[bipText]',
  template: `<ng-content />`,
  styleUrl: './text.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses()',
  },
})
export class BipText {
  readonly size = input<BipTextSize>('md');
  readonly weight = input<BipTextWeight>('normal');
  readonly color = input<BipTextColor>('default');
  readonly align = input<BipTextAlign | undefined>(undefined);
  readonly truncate = input(false, { transform: booleanAttribute });

  protected readonly hostClasses = computed(() => {
    const align = this.align();
    return [
      SIZE_CLASS[this.size()],
      WEIGHT_CLASS[this.weight()],
      COLOR_CLASS[this.color()],
      align ? ALIGN_CLASS[align] : '',
      this.truncate() ? 'bip-text--truncate' : '',
    ]
      .filter(Boolean)
      .join(' ');
  });
}
