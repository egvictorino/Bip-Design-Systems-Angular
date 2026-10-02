/** Físico a propósito (como `placement` en DrawerPanel) — 'left' siempre es el lado físico izquierdo, sin importar `dir`. */
export type BipTooltipPosition = 'top' | 'bottom' | 'left' | 'right';

/** Lógico — relativo a inicio/fin de lectura ('start' = izquierda en LTR, derecha en RTL). */
export type BipTooltipAlign = 'start' | 'center' | 'end';

export type BipTooltipVariant = 'default' | 'light' | 'info' | 'success' | 'warning' | 'error';
