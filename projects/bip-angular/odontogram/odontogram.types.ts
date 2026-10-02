import type {
  BipSize,
  ToothCondition,
  ToothImageType,
  ToothSurface,
} from '@bip-design-systems/angular/core';

export type { ToothCondition, ToothImageType, ToothSurface };

/** Modo de dentición: permanente (32 piezas FDI 11-48) o primaria (20 piezas FDI 51-85). */
export type DentitionMode = 'permanent' | 'primary';

export type SurfaceCondition = Partial<Record<ToothSurface, ToothCondition>>;

export interface ToothImage {
  type: ToothImageType;
  /** Data URL en base64 o URL externa. */
  url: string;
}

export interface ToothData {
  condition?: ToothCondition;
  surfaces?: SurfaceCondition;
  notes?: string;
  images?: ToothImage[];
}

export type OdontogramValue = Record<number, ToothData>;

/** Tamaño del SVG del diente en el panel de detalle (siempre grande, no sigue `size()`). */
export type BipToothSvgSize = BipSize | 'xl';

export const TOOTH_SIZE: Record<BipToothSvgSize, number> = { sm: 24, md: 32, lg: 40, xl: 120 };

/** Condiciones que aplican a todo el diente, no por superficie. */
export const WHOLE_TOOTH_CONDITIONS = new Set<ToothCondition>(['missing', 'crown', 'implant']);

export const SURFACES: ToothSurface[] = ['buccal', 'lingual', 'mesial', 'distal', 'occlusal'];

/**
 * Puntos del polígono de cada superficie (SVG viewBox 0 0 100 100).
 * Arcada superior: bucal arriba, lingual abajo.
 */
export const UPPER_POINTS: Record<ToothSurface, string> = {
  buccal: '0,0 100,0 70,30 30,30',
  lingual: '30,70 70,70 100,100 0,100',
  mesial: '0,0 30,30 30,70 0,100',
  distal: '70,30 100,0 100,100 70,70',
  occlusal: '30,30 70,30 70,70 30,70',
};

/** Arcada inferior: bucal abajo, lingual arriba (invertido respecto a la superior). */
export const LOWER_POINTS: Record<ToothSurface, string> = {
  buccal: '30,70 70,70 100,100 0,100',
  lingual: '0,0 100,0 70,30 30,30',
  mesial: '0,0 30,30 30,70 0,100',
  distal: '70,30 100,0 100,100 70,70',
  occlusal: '30,30 70,30 70,70 30,70',
};

/** Referencia estable de diente vacío — evita crear un objeto nuevo por render. */
export const EMPTY_TOOTH: ToothData = {};

/** Números FDI por cuadrante, en el orden en que se muestran en pantalla (izq→der). */
export const UPPER_RIGHT = [18, 17, 16, 15, 14, 13, 12, 11];
export const UPPER_LEFT = [21, 22, 23, 24, 25, 26, 27, 28];
export const LOWER_RIGHT = [48, 47, 46, 45, 44, 43, 42, 41];
export const LOWER_LEFT = [31, 32, 33, 34, 35, 36, 37, 38];

export const PRIMARY_UPPER_RIGHT = [55, 54, 53, 52, 51];
export const PRIMARY_UPPER_LEFT = [61, 62, 63, 64, 65];
export const PRIMARY_LOWER_RIGHT = [85, 84, 83, 82, 81];
export const PRIMARY_LOWER_LEFT = [71, 72, 73, 74, 75];

export const IMAGE_TYPES: ToothImageType[] = ['radiograph', 'photo', 'other'];

/** Arcada de un número de diente FDI (superior = cuadrantes 1, 2, 5, 6). */
export function toothArch(toothNumber: number): 'upper' | 'lower' {
  const quadrant = Math.floor(toothNumber / 10);
  return quadrant === 1 || quadrant === 2 || quadrant === 5 || quadrant === 6 ? 'upper' : 'lower';
}

/** Clase CSS del relleno de superficie para una condición — ver odontogram's tokens de color en tooth-svg.component.css. */
export function conditionFillClass(condition: ToothCondition): string {
  return `bip-tooth-fill-${condition.replace(/_/g, '-')}`;
}
