/** Escala de tamaño estándar, usada por la mayoría de componentes (Button, Input, Badge...). */
export type BipSize = 'sm' | 'md' | 'lg';

/** Escala de tamaño extendida, para componentes que necesitan extremos (Avatar, Spinner...). */
export type BipSizeExtended = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Tipos del eje de theming — implementados por bipTheme en el Bloque 2, declarados aquí
 * porque core/types es la capa transversal que el resto de bloques puede importar sin
 * depender de core/theme todavía.
 */
export type BipThemeName = 'square' | 'rounded';
export type BipColorScheme = 'light' | 'dark' | 'system';
export type BipResolvedColorScheme = 'light' | 'dark';
export type BipDensity = 'comfortable' | 'compact';
export type BipDir = 'ltr' | 'rtl';

/**
 * Tipos de dominio de Calendar/Odontogram (Bloques 8/10), declarados aquí porque
 * `BipLocale` (Bloque 3) ya necesita tipar `calendar.views`/`calendar.statusLabels` y
 * `odontogram.conditionLabels`/`surfaceLabels`/`imageTypeLabels` antes de que esos
 * componentes existan. Cuando lleguen sus bloques, importan estos mismos tipos desde
 * aquí en vez de redeclararlos.
 */
export type CalendarView = 'month' | 'week' | 'day' | 'agenda';
export type CalendarEventStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export type ToothCondition =
  | 'healthy'
  | 'caries'
  | 'restoration'
  | 'crown'
  | 'missing'
  | 'implant'
  | 'fracture'
  | 'root_canal'
  | 'extraction_planned';
export type ToothSurface = 'occlusal' | 'buccal' | 'lingual' | 'mesial' | 'distal';
export type ToothImageType = 'radiograph' | 'photo' | 'other';
