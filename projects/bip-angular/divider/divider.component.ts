import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type BipDividerOrientation = 'horizontal' | 'vertical';
export type BipDividerVariant = 'solid' | 'dashed';

/**
 * Separador visual/semántico (`role="separator"`). Renderiza `<hr>` nativo para el caso
 * horizontal sin label (estructura más simple y semántica), o `<div>` cuando necesita
 * estructura interna (vertical, o horizontal con label intercalado) — por eso es un componente
 * con selector de elemento, no un directive de atributo: la estructura interna varía según
 * `orientation`/`label`, no solo las clases.
 */
@Component({
  selector: 'bip-divider',
  templateUrl: './divider.component.html',
  styleUrl: './divider.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BipDivider {
  readonly orientation = input<BipDividerOrientation>('horizontal');
  readonly variant = input<BipDividerVariant>('solid');
  readonly label = input<string | undefined>(undefined);
}
