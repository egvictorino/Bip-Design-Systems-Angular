import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'bip-foundations-welcome',
  template: `
    <div style="padding: 2rem; font-family: sans-serif;">
      <h1>BipUI — Angular</h1>
      <p>Bootstrap del workspace (Bloque 0). Las Foundations llegan en el Bloque 1.</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BipFoundationsWelcome {}
