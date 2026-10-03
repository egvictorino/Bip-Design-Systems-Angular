import { Component, inject } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { BipToast } from './toast.service';
import type { BipToastVariant } from './toast.types';

/** `BipToast` es un servicio (`providedIn: 'root'`) — no hay un componente declarativo que mostrar, solo disparadores que llaman a `show()`. */
@Component({
  selector: 'bip-toast-demo',
  template: `
    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
      <button type="button" style="padding: 8px 16px" (click)="show('info')">Info</button>
      <button type="button" style="padding: 8px 16px" (click)="show('success')">Éxito</button>
      <button type="button" style="padding: 8px 16px" (click)="show('warning')">Advertencia</button>
      <button type="button" style="padding: 8px 16px" (click)="show('danger')">Error</button>
      <button type="button" style="padding: 8px 16px" (click)="showPersistent()">
        Persistente
      </button>
      <button type="button" style="padding: 8px 16px" (click)="showMany()">
        Mostrar 5 seguidos
      </button>
    </div>
  `,
})
class ToastDemo {
  private readonly toast = inject(BipToast);

  show(variant: BipToastVariant): void {
    this.toast.show({
      variant,
      title: variant.charAt(0).toUpperCase() + variant.slice(1),
      message: `Este es un toast de tipo "${variant}".`,
    });
  }

  showPersistent(): void {
    this.toast.show({
      variant: 'warning',
      title: 'Persistente',
      message: 'Este toast no se cierra solo — duration: 0.',
      duration: 0,
    });
  }

  showMany(): void {
    for (let i = 1; i <= 5; i++) {
      this.toast.show({ message: `Toast número ${i}` });
    }
  }
}

const meta: Meta<ToastDemo> = {
  title: 'Components/Toast',
  component: ToastDemo,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<ToastDemo>;

export const Basic: Story = {};
