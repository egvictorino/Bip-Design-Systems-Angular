import { ChangeDetectionStrategy, Component } from '@angular/core';

const SPACE_SCALE = [
  '0',
  'px',
  '0-5',
  '1',
  '1-5',
  '2',
  '2-5',
  '3',
  '3-5',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '12',
  '14',
  '16',
  '18',
  '22',
];

@Component({
  selector: 'bip-foundations-spacing',
  template: `
    <div class="page">
      <h1 class="title">Spacing</h1>
      <p class="lead">
        Grilla de 0.125rem (2px). Nomenclatura estilo Tailwind: el nombre es el valor en unidades de
        0.25rem/4px. Todo padding/margin/gap de un componente debe usar uno de estos tokens — ver el
        guard <code>testing/spacing.spec.ts</code>.
      </p>
      <div class="rows">
        @for (key of scale; track key) {
          <div class="row">
            <span class="name">--space-{{ key }}</span>
            <div class="track">
              <div class="bar" [style.inlineSize]="'var(--space-' + key + ')'"></div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styleUrl: './spacing.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BipFoundationsSpacing {
  protected readonly scale = SPACE_SCALE;
}
