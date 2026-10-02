import { Component } from '@angular/core';
import { render, screen, fireEvent } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { BipTabs } from './tabs.component';
import { BipTabList } from './tab-list.component';
import { BipTab } from './tab.component';
import { BipTabPanel } from './tab-panel.component';

@Component({
  imports: [BipTabs, BipTabList, BipTab, BipTabPanel],
  template: `
    <bip-tabs
      [value]="value"
      [orientation]="orientation"
      (valueChange)="onValueChange($event)"
    >
      <bip-tab-list>
        <button type="button" bipTab value="general">General</button>
        <button type="button" bipTab value="detalles">Detalles</button>
        <button type="button" bipTab value="deshabilitado" disabled>Deshabilitado</button>
        <button type="button" bipTab value="historial">Historial</button>
      </bip-tab-list>
      <bip-tab-panel value="general">Contenido general</bip-tab-panel>
      <bip-tab-panel value="detalles">Contenido de detalles</bip-tab-panel>
      <bip-tab-panel value="deshabilitado">No debería verse</bip-tab-panel>
      <bip-tab-panel value="historial">Contenido de historial</bip-tab-panel>
    </bip-tabs>
  `,
})
class HostComponent {
  value = 'general';
  orientation: 'horizontal' | 'vertical' = 'horizontal';
  onValueChange = vi.fn();
}

describe('BipTabs', () => {
  it('role="tablist" con sus tabs y paneles', async () => {
    await render(HostComponent);
    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(4);
    expect(screen.getAllByRole('tabpanel', { hidden: true })).toHaveLength(4);
  });

  it('aria-selected solo en el tab activo', async () => {
    await render(HostComponent);
    expect(screen.getByRole('tab', { name: 'General' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Detalles' })).toHaveAttribute('aria-selected', 'false');
  });

  it('solo el panel activo está visible, el resto hidden', async () => {
    await render(HostComponent);
    expect(screen.getByText('Contenido general')).toBeVisible();
    expect(screen.getByText('Contenido de detalles')).not.toBeVisible();
  });

  it('aria-controls del tab apunta al id del panel y aria-labelledby del panel al id del tab', async () => {
    await render(HostComponent);
    const tab = screen.getByRole('tab', { name: 'General' });
    const panel = screen.getByText('Contenido general');
    expect(tab.getAttribute('aria-controls')).toBe(panel.id);
    expect(panel.getAttribute('aria-labelledby')).toBe(tab.id);
  });

  it('clic en un tab lo activa y emite valueChange', async () => {
    const { fixture } = await render(HostComponent);
    await userEvent.click(screen.getByRole('tab', { name: 'Detalles' }));
    expect(fixture.componentInstance.onValueChange).toHaveBeenCalledWith('detalles');
  });

  it('el modo controlado respeta el value del consumidor', async () => {
    await render(HostComponent, { componentProperties: { value: 'historial' } });
    expect(screen.getByRole('tab', { name: 'Historial' })).toHaveAttribute('aria-selected', 'true');
  });

  it('tab deshabilitado no tiene tabindex=0 ni se activa al hacer clic', async () => {
    const { fixture } = await render(HostComponent);
    const disabledTab = screen.getByRole('tab', { name: 'Deshabilitado' });
    expect(disabledTab).toBeDisabled();
    fireEvent.click(disabledTab);
    expect(fixture.componentInstance.onValueChange).not.toHaveBeenCalled();
  });

  it('roving tabindex: solo el tab activo tiene tabindex=0', async () => {
    await render(HostComponent);
    expect(screen.getByRole('tab', { name: 'General' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('tab', { name: 'Detalles' })).toHaveAttribute('tabindex', '-1');
  });

  describe('teclado (horizontal)', () => {
    it('ArrowRight mueve el foco al siguiente tab, saltando el disabled', async () => {
      await render(HostComponent);
      const general = screen.getByRole('tab', { name: 'General' });
      general.focus();
      fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowRight', keyCode: 39 });
      expect(screen.getByRole('tab', { name: 'Detalles' })).toHaveFocus();
    });

    it('ArrowLeft desde el primero va al último (wrap)', async () => {
      await render(HostComponent);
      const general = screen.getByRole('tab', { name: 'General' });
      general.focus();
      fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowLeft', keyCode: 37 });
      expect(screen.getByRole('tab', { name: 'Historial' })).toHaveFocus();
    });

    it('End mueve el foco al último tab', async () => {
      await render(HostComponent);
      const general = screen.getByRole('tab', { name: 'General' });
      general.focus();
      fireEvent.keyDown(screen.getByRole('tablist'), { key: 'End', keyCode: 35 });
      expect(screen.getByRole('tab', { name: 'Historial' })).toHaveFocus();
    });

    it('mover el foco con flechas no activa el tab (activación manual)', async () => {
      const { fixture } = await render(HostComponent);
      const general = screen.getByRole('tab', { name: 'General' });
      general.focus();
      fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowRight', keyCode: 39 });
      expect(fixture.componentInstance.onValueChange).not.toHaveBeenCalled();
      expect(screen.getByRole('tab', { name: 'General' })).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('orientation="vertical"', () => {
    it('aria-orientation="vertical" en el tablist', async () => {
      await render(HostComponent, { componentProperties: { orientation: 'vertical' } });
      expect(screen.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical');
    });

    it('ArrowDown/ArrowUp mueven el foco, ArrowRight no hace nada', async () => {
      await render(HostComponent, { componentProperties: { orientation: 'vertical' } });
      const general = screen.getByRole('tab', { name: 'General' });
      general.focus();
      fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowDown', keyCode: 40 });
      expect(screen.getByRole('tab', { name: 'Detalles' })).toHaveFocus();

      fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowRight', keyCode: 39 });
      expect(screen.getByRole('tab', { name: 'Detalles' })).toHaveFocus();
    });
  });

  it('lanza si <bip-tab-list> se usa fuera de <bip-tabs>', async () => {
    @Component({
      imports: [BipTabList],
      template: `<bip-tab-list></bip-tab-list>`,
    })
    class OrphanHost {}

    await expect(render(OrphanHost)).rejects.toThrow('<bip-tab-list> debe usarse dentro de <bip-tabs>');
  });
});
