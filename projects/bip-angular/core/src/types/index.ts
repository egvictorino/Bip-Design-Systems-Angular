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
