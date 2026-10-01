import { Component, signal } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { BipModal, type BipModalSize } from './modal.component';
import { BipModalBody } from './modal-body.component';
import { BipModalFooter } from './modal-footer.component';

/** Wrapper con estado local — `open` es un `model()`, necesita un disparador real para demostrar el ciclo abrir/cerrar en Storybook (los args de CSF3 son estáticos por render). */
@Component({
  selector: 'bip-modal-demo',
  imports: [BipModal, BipModalBody, BipModalFooter],
  template: `
    <button type="button" style="padding: 8px 16px" (click)="open.set(true)">Abrir modal</button>
    <bip-modal
      [(open)]="open"
      [title]="title"
      [size]="size"
      [closeOnBackdrop]="closeOnBackdrop"
      [closeOnEscape]="closeOnEscape"
    >
      <bip-modal-body>
        <p>Este es el contenido del modal. Puede incluir cualquier markup.</p>
      </bip-modal-body>
      <bip-modal-footer>
        <button type="button" style="padding: 8px 16px" (click)="open.set(false)">Cancelar</button>
        <button type="button" style="padding: 8px 16px" (click)="open.set(false)">Aceptar</button>
      </bip-modal-footer>
    </bip-modal>
  `,
})
class ModalDemo {
  readonly open = signal(false);
  title = 'Título del modal';
  size: BipModalSize = 'md';
  closeOnBackdrop = true;
  closeOnEscape = true;
}

const meta: Meta<ModalDemo> = {
  title: 'Components/Modal',
  component: ModalDemo,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl'] },
  },
};

export default meta;
type Story = StoryObj<ModalDemo>;

export const Basic: Story = { args: {} };

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 12px; flex-wrap: wrap;">
        <bip-modal-demo [size]="'sm'" [title]="'Pequeño (sm)'" />
        <bip-modal-demo [size]="'md'" [title]="'Mediano (md)'" />
        <bip-modal-demo [size]="'lg'" [title]="'Grande (lg)'" />
        <bip-modal-demo [size]="'xl'" [title]="'Extra grande (xl)'" />
      </div>
    `,
    moduleMetadata: { imports: [ModalDemo] },
  }),
};

export const WithoutCloseOnBackdrop: Story = {
  args: { closeOnBackdrop: false },
};

export const WithoutCloseOnEscape: Story = {
  args: { closeOnEscape: false },
};

export const WithoutHeader: Story = {
  render: () => ({
    template: `
      <button type="button" style="padding: 8px 16px" (click)="open.set(true)">Abrir modal sin header</button>
      <bip-modal [(open)]="open">
        <bip-modal-body>
          <p>Modal sin header: no se pasa el input <code>title</code>, así que no hay botón de cerrar automático.</p>
        </bip-modal-body>
        <bip-modal-footer align="center">
          <button type="button" style="padding: 8px 16px" (click)="open.set(false)">Cerrar</button>
        </bip-modal-footer>
      </bip-modal>
    `,
    moduleMetadata: { imports: [BipModal, BipModalBody, BipModalFooter] },
    props: { open: signal(false) },
  }),
};
