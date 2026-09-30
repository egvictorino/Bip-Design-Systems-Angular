import { ChangeDetectionStrategy, Component, afterNextRender, signal } from '@angular/core';
import { BREAKPOINTS, type BreakpointKey } from '../core/src/utils/breakpoints';

const ROWS: BreakpointKey[] = ['sm', 'md', 'lg', 'xl'];

@Component({
  selector: 'bip-foundations-breakpoints',
  template: `
    <div class="page">
      <h1 class="title">Breakpoints</h1>
      <p class="lead">
        Escala única para <code>@media (min-width)</code> en CSS (donde no se puede usar
        <code>var()</code> dentro de <code>@media</code>) y para consultas de
        <code>BreakpointObserver</code> en runtime (<code>core/a11y mediaQuery()</code>, Bloque 3).
        El ancho de viewport actual: <strong>{{ viewportWidth() }}px</strong>.
      </p>
      <table class="table">
        <thead>
          <tr>
            <th>Token</th>
            <th>min-width</th>
            <th>Activo</th>
          </tr>
        </thead>
        <tbody>
          @for (key of rows; track key) {
            <tr>
              <td class="name">{{ key }}</td>
              <td class="value">{{ breakpoints[key] }}px</td>
              <td>
                <span class="badge" [class.badgeActive]="viewportWidth() >= breakpoints[key]">
                  {{ viewportWidth() >= breakpoints[key] ? 'sí' : 'no' }}
                </span>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styleUrl: './breakpoints.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:resize)': 'onResize()',
  },
})
export class BipFoundationsBreakpoints {
  protected readonly rows = ROWS;
  protected readonly breakpoints = BREAKPOINTS;
  protected readonly viewportWidth = signal(0);

  constructor() {
    afterNextRender(() => this.viewportWidth.set(window.innerWidth));
  }

  protected onResize(): void {
    this.viewportWidth.set(window.innerWidth);
  }
}
