import { Component } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { BipAccordion } from './accordion.component';
import { BipAccordionItem } from './accordion-item.component';
import { BipAccordionTrigger } from './accordion-trigger.component';
import { BipAccordionContent } from './accordion-content.component';

@Component({
  imports: [BipAccordion, BipAccordionItem, BipAccordionTrigger, BipAccordionContent],
  template: `
    <bip-accordion
      [type]="type"
      [collapsible]="collapsible"
      [value]="value"
      (valueChange)="onValueChange($event)"
    >
      <bip-accordion-item value="uno">
        <button type="button" bipAccordionTrigger>Sección uno</button>
        <bip-accordion-content>Contenido uno</bip-accordion-content>
      </bip-accordion-item>
      <bip-accordion-item value="dos" disabled>
        <button type="button" bipAccordionTrigger>Sección dos</button>
        <bip-accordion-content>Contenido dos</bip-accordion-content>
      </bip-accordion-item>
      <bip-accordion-item value="tres">
        <button type="button" bipAccordionTrigger>Sección tres</button>
        <bip-accordion-content>Contenido tres</bip-accordion-content>
      </bip-accordion-item>
    </bip-accordion>
  `,
})
class HostComponent {
  type: 'single' | 'multiple' = 'single';
  collapsible = false;
  value: string | readonly string[] = '';
  onValueChange = vi.fn();
}

describe('BipAccordion', () => {
  it('renderiza un trigger y un panel region por cada item', async () => {
    await render(HostComponent);
    expect(screen.getAllByRole('button')).toHaveLength(3);
    expect(screen.getAllByRole('region', { hidden: true })).toHaveLength(3);
  });

  it('todo cerrado por defecto', async () => {
    await render(HostComponent);
    expect(screen.getByRole('button', { name: 'Sección uno' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  });

  it('respeta un value inicial (single)', async () => {
    await render(HostComponent, { componentProperties: { value: 'uno' } });
    expect(screen.getByRole('button', { name: 'Sección uno' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
  });

  it('aria-controls/aria-labelledby enlazan trigger y contenido', async () => {
    await render(HostComponent);
    const trigger = screen.getByRole('button', { name: 'Sección uno' });
    const region = screen.getByText('Contenido uno').closest('[role="region"]') as HTMLElement;
    expect(trigger.getAttribute('aria-controls')).toBe(region.id);
    expect(region.getAttribute('aria-labelledby')).toBe(trigger.id);
  });

  describe('type="single"', () => {
    it('abrir un item cierra el anterior', async () => {
      const { fixture } = await render(HostComponent, { componentProperties: { value: 'uno' } });
      await userEvent.click(screen.getByRole('button', { name: 'Sección tres' }));
      expect(fixture.componentInstance.onValueChange).toHaveBeenCalledWith('tres');
    });

    it('sin collapsible, clic en el item abierto no lo cierra', async () => {
      await render(HostComponent, { componentProperties: { value: 'uno' } });
      await userEvent.click(screen.getByRole('button', { name: 'Sección uno' }));
      expect(screen.getByRole('button', { name: 'Sección uno' })).toHaveAttribute(
        'aria-expanded',
        'true'
      );
    });

    it('con collapsible, clic en el item abierto lo cierra', async () => {
      const { fixture } = await render(HostComponent, {
        componentProperties: { value: 'uno', collapsible: true },
      });
      await userEvent.click(screen.getByRole('button', { name: 'Sección uno' }));
      expect(fixture.componentInstance.onValueChange).toHaveBeenCalledWith('');
    });
  });

  describe('type="multiple"', () => {
    it('puede tener varios items abiertos a la vez', async () => {
      const { fixture } = await render(HostComponent, {
        componentProperties: { type: 'multiple', value: ['uno'] },
      });
      await userEvent.click(screen.getByRole('button', { name: 'Sección tres' }));
      expect(fixture.componentInstance.onValueChange).toHaveBeenCalledWith(['uno', 'tres']);
    });

    it('clic en un item abierto lo cierra sin afectar a los demás', async () => {
      const { fixture } = await render(HostComponent, {
        componentProperties: { type: 'multiple', value: ['uno', 'tres'] },
      });
      await userEvent.click(screen.getByRole('button', { name: 'Sección uno' }));
      expect(fixture.componentInstance.onValueChange).toHaveBeenCalledWith(['tres']);
    });
  });

  it('item disabled no se abre al hacer clic', async () => {
    const { fixture } = await render(HostComponent);
    await userEvent.click(screen.getByRole('button', { name: 'Sección dos' }));
    expect(fixture.componentInstance.onValueChange).not.toHaveBeenCalled();
  });

  it('lanza si <bip-accordion-item> se usa fuera de <bip-accordion>', async () => {
    @Component({
      imports: [BipAccordionItem],
      template: `<bip-accordion-item value="x">Contenido</bip-accordion-item>`,
    })
    class OrphanHost {}

    await expect(render(OrphanHost)).rejects.toThrow(
      '<bip-accordion-item> debe usarse dentro de <bip-accordion>'
    );
  });

  it('lanza si el trigger se usa fuera de <bip-accordion-item>', async () => {
    @Component({
      imports: [BipAccordion, BipAccordionTrigger],
      template: `<bip-accordion
        ><button type="button" bipAccordionTrigger>X</button></bip-accordion
      >`,
    })
    class OrphanTriggerHost {}

    await expect(render(OrphanTriggerHost)).rejects.toThrow(
      '<button bipAccordionTrigger> debe usarse dentro de <bip-accordion-item>'
    );
  });
});
