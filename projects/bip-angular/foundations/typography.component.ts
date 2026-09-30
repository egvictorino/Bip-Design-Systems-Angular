import { ChangeDetectionStrategy, Component } from '@angular/core';

const TEXT_SCALE = ['3xs', '2xs', 'xs', 'sm', 'base', 'lg', 'xl', '2xl'];
const FONT_WEIGHTS = ['normal', 'medium', 'semibold', 'bold'];
const LINE_HEIGHTS = ['tight', 'normal', 'relaxed'];

@Component({
  selector: 'bip-foundations-typography',
  template: `
    <div class="page">
      <h1 class="title">Typography</h1>
      <p class="lead">
        <code>--font-sans</code> cambia según el tema activo — Inter Variable en
        <code>square</code>, Figtree Variable en <code>rounded</code>.
      </p>

      <section class="section">
        <h2 class="sectionTitle">Escala de tamaño</h2>
        <div class="stack">
          @for (key of textScale; track key) {
            <p class="sample" [style.fontSize]="'var(--text-' + key + ')'">
              --text-{{ key }} — El veloz murciélago hindú
            </p>
          }
        </div>
      </section>

      <section class="section">
        <h2 class="sectionTitle">Peso</h2>
        <div class="stack">
          @for (key of fontWeights; track key) {
            <p class="sample" [style.fontWeight]="'var(--font-' + key + ')'">
              --font-{{ key }} — El veloz murciélago hindú
            </p>
          }
        </div>
      </section>

      <section class="section">
        <h2 class="sectionTitle">Interlineado</h2>
        <div class="stack">
          @for (key of lineHeights; track key) {
            <p class="sample paragraph" [style.lineHeight]="'var(--leading-' + key + ')'">
              --leading-{{ key }} — El veloz murciélago hindú comía feliz cardillo y kiwi. La
              cigüeña tocaba el saxofón detrás del palenque de paja.
            </p>
          }
        </div>
      </section>
    </div>
  `,
  styleUrl: './typography.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BipFoundationsTypography {
  protected readonly textScale = TEXT_SCALE;
  protected readonly fontWeights = FONT_WEIGHTS;
  protected readonly lineHeights = LINE_HEIGHTS;
}
