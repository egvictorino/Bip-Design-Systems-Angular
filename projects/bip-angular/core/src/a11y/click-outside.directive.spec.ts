import { Component, signal } from '@angular/core';
import { fireEvent, render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { BipClickOutsideDirective } from './click-outside.directive';

@Component({
  selector: 'bip-click-outside-test',
  template: `
    <div data-testid="inside" bipClickOutside [enabled]="enabled()" (bipClickOutside)="onOutside()">
      Inside
    </div>
    <div data-testid="outside">Outside</div>
    <p data-testid="count">{{ outsideCount() }}</p>
  `,
  imports: [BipClickOutsideDirective],
})
class ClickOutsideTest {
  readonly enabled = signal(true);
  readonly outsideCount = signal(0);
  onOutside(): void {
    this.outsideCount.update((n) => n + 1);
  }
}

describe('BipClickOutsideDirective', () => {
  it('emite bipClickOutside en un pointerdown fuera del elemento', async () => {
    await render(ClickOutsideTest);
    fireEvent(screen.getByTestId('outside'), new PointerEvent('pointerdown', { bubbles: true }));
    expect(screen.getByTestId('count').textContent).toBe('1');
  });

  it('no emite en un pointerdown dentro del elemento', async () => {
    await render(ClickOutsideTest);
    fireEvent(screen.getByTestId('inside'), new PointerEvent('pointerdown', { bubbles: true }));
    expect(screen.getByTestId('count').textContent).toBe('0');
  });

  it('no emite cuando enabled es false', async () => {
    const { fixture } = await render(ClickOutsideTest);
    fixture.componentInstance.enabled.set(false);
    fixture.detectChanges();
    fireEvent(screen.getByTestId('outside'), new PointerEvent('pointerdown', { bubbles: true }));
    expect(screen.getByTestId('count').textContent).toBe('0');
  });
});
