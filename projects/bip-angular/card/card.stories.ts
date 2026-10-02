import type { Meta, StoryObj } from '@storybook/angular-vite';
import { BipCard } from './card.component';
import { BipCardHeader } from './card-header.component';
import { BipCardBody } from './card-body.component';
import { BipCardFooter } from './card-footer.component';
import { BipCardMedia } from './card-media.component';

const meta: Meta<BipCard> = {
  title: 'Components/Card',
  component: BipCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: 'select', options: ['elevated', 'outlined', 'flat'] },
    padding: { control: 'select', options: ['none', 'sm', 'md', 'lg'] },
    radius: { control: 'select', options: ['none', 'sm', 'md', 'lg', 'xl'] },
  },
};

export default meta;
type Story = StoryObj<BipCard>;

export const Simple: Story = {
  args: { variant: 'elevated', padding: 'md' },
  render: (args) => ({
    props: args,
    template: `<bip-card [variant]="variant" [padding]="padding" style="max-width: 20rem;">Contenido simple de la tarjeta.</bip-card>`,
  }),
};

export const Composed: Story = {
  render: () => ({
    moduleMetadata: { imports: [BipCard, BipCardHeader, BipCardBody, BipCardFooter] },
    template: `
      <bip-card variant="outlined" style="max-width: 20rem;">
        <bip-card-header>Encabezado</bip-card-header>
        <bip-card-body>Cuerpo de la tarjeta con el contenido principal.</bip-card-body>
        <bip-card-footer>Pie</bip-card-footer>
      </bip-card>
    `,
  }),
};

export const WithMedia: Story = {
  render: () => ({
    moduleMetadata: { imports: [BipCard, BipCardMedia, BipCardBody] },
    template: `
      <bip-card variant="elevated" style="max-width: 20rem;">
        <bip-card-media src="https://picsum.photos/400/225" alt="Imagen de ejemplo" />
        <bip-card-body>Contenido bajo la imagen.</bip-card-body>
      </bip-card>
    `,
  }),
};

export const Loading: Story = {
  args: { loading: true },
  render: (args) => ({
    props: args,
    template: `<bip-card [loading]="loading" style="max-width: 20rem;">Contenido</bip-card>`,
  }),
};

export const Clickable: Story = {
  args: { clickable: true, padding: 'md' },
  render: (args) => ({
    props: args,
    template: `<bip-card [clickable]="clickable" [padding]="padding" style="max-width: 20rem;">Tarjeta interactiva (Enter/Espacio).</bip-card>`,
  }),
};
