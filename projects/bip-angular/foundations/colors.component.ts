import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BipFoundationsSwatch } from './swatch.component';
import { TOKEN_GROUPS, SHADOW_TOKENS } from './tokens.data';

@Component({
  selector: 'bip-foundations-colors',
  imports: [BipFoundationsSwatch],
  template: `
    <div class="page">
      <h1 class="title">Color Palette</h1>
      <p class="lead">
        Los siguientes colores son los tokens base del design system. Haz clic en cualquier muestra
        para copiar el color resuelto al portapapeles.
        <strong>Semilla</strong> — hex editable vía <code>bipTheme tokens</code>.
        <strong>Derivado</strong> — calculado desde una semilla con <code>color-mix()</code>;
        recolorea automáticamente al sobrescribir la semilla.
      </p>
      <div class="panels">
        @for (scheme of schemes; track scheme) {
          <div class="panel" [attr.data-color-scheme]="scheme">
            <h2 class="panelTitle">{{ scheme === 'light' ? 'Light' : 'Dark' }}</h2>
            @for (group of tokenGroups; track group.title) {
              <div class="group">
                <h3 class="groupTitle">{{ group.title }}</h3>
                <div class="grid">
                  @for (token of group.tokens; track token.name) {
                    <bip-foundations-swatch [token]="token" [scheme]="scheme" />
                  }
                </div>
              </div>
            }
            <div class="group">
              <h3 class="groupTitle">Shadows</h3>
              <div class="grid">
                @for (shadow of shadowTokens; track shadow.name) {
                  <div class="swatchButton shadowSwatch">
                    <div class="swatchBox" [style.boxShadow]="'var(--' + shadow.name + ')'"></div>
                    <p class="swatchName">{{ shadow.name }}</p>
                  </div>
                }
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styleUrl: './colors.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BipFoundationsColors {
  protected readonly schemes: Array<'light' | 'dark'> = ['light', 'dark'];
  protected readonly tokenGroups = TOKEN_GROUPS;
  protected readonly shadowTokens = SHADOW_TOKENS;
}
