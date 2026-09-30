import type { Meta, StoryObj } from '@storybook/angular-vite';
import { BipEmptyState } from './empty-state.component';

const meta: Meta<BipEmptyState> = {
  title: 'Components/EmptyState',
  component: BipEmptyState,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
  },
};

export default meta;
type Story = StoryObj<BipEmptyState>;

export const Default: Story = { args: { title: 'Sin resultados', description: 'Prueba con otros filtros de búsqueda.' } };

export const WithAction: Story = {
  args: { title: 'Sin resultados', description: 'Prueba con otros filtros de búsqueda.' },
  render: (args) => ({
    props: args,
    template: `
      <bip-empty-state [title]="title" [description]="description">
        <button bipEmptyStateAction>Limpiar filtros</button>
      </bip-empty-state>
    `,
  }),
};
