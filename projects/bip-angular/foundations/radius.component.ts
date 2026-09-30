import { ChangeDetectionStrategy, Component } from '@angular/core';

interface RadiusToken {
  name: string;
  note: string;
}

const RADIUS_TOKENS: RadiusToken[] = [
  { name: 'radius-marker', note: 'Marcadores pequeños (checkbox, radio, dot)' },
  { name: 'radius-field', note: 'Campos de formulario (Input, Select, Textarea)' },
  { name: 'radius-control', note: 'Controles interactivos (Button, Badge, Tag)' },
  { name: 'radius-surface', note: 'Superficies medianas (Card, Dropdown, Popover)' },
  { name: 'radius-container', note: 'Contenedores grandes (Modal, DrawerPanel)' },
  { name: 'radius-container-lg', note: 'Contenedores extra grandes' },
];

const INVARIANT_TOKENS: RadiusToken[] = [
  { name: 'radius-pill', note: 'Invariante — Badge, Toggle track' },
  { name: 'radius-circle', note: 'Invariante — Avatar, Spinner' },
  { name: 'radius-none', note: 'Invariante — elementos deliberadamente rectos' },
];

@Component({
  selector: 'bip-foundations-radius',
  template: `
    <div class="page">
      <h1 class="title">Radius</h1>
      <p class="lead">
        Capa semántica de radio — los componentes consumen <code>--radius-field</code>,
        <code>--radius-control</code>, etc., nunca la escala cruda. Cada tema
        (<code>square</code>/<code>rounded</code>) resuelve estos tokens a un valor distinto;
        <code>--radius-pill</code>/<code>--radius-circle</code>/<code>--radius-none</code> son
        invariantes.
      </p>
      <div class="panels">
        @for (theme of themes; track theme) {
          <div class="panel" [attr.data-theme]="theme">
            <h2 class="panelTitle">{{ theme === 'square' ? 'Square (default)' : 'Rounded' }}</h2>
            <div class="grid">
              @for (token of radiusTokens; track token.name) {
                <div class="swatch">
                  <div class="box" [style.borderRadius]="'var(--' + token.name + ')'"></div>
                  <p class="name">{{ token.name }}</p>
                  <p class="note">{{ token.note }}</p>
                </div>
              }
              @for (token of invariantTokens; track token.name) {
                <div class="swatch">
                  <div class="box" [style.borderRadius]="'var(--' + token.name + ')'"></div>
                  <p class="name">{{ token.name }}</p>
                  <p class="note">{{ token.note }}</p>
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styleUrl: './radius.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BipFoundationsRadius {
  protected readonly themes: Array<'square' | 'rounded'> = ['square', 'rounded'];
  protected readonly radiusTokens = RADIUS_TOKENS;
  protected readonly invariantTokens = INVARIANT_TOKENS;
}
