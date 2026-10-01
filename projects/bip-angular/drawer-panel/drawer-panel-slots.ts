import { Directive } from '@angular/core';

/**
 * Marcadores sin comportamiento propio — solo existen para que `BipDrawerPanel` pueda hacer
 * `contentChild(BipDrawerPanelFooter)` y saber si el consumidor proyectó algo en ese slot (así
 * el contenedor `.bip-drawer-panel-footer`/`-header-actions`, con su propio padding/border, solo
 * se renderiza cuando hay contenido real — igual que el `footer &&`/`headerActions &&`
 * condicional de la referencia React).
 */
@Directive({ selector: '[bipDrawerPanelFooter]', standalone: true })
export class BipDrawerPanelFooter {}

@Directive({ selector: '[bipDrawerPanelHeaderActions]', standalone: true })
export class BipDrawerPanelHeaderActions {}
