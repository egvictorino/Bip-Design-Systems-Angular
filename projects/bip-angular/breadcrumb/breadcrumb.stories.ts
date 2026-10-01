import type { Meta, StoryObj } from '@storybook/angular-vite';
import { BipBreadcrumb, type BipBreadcrumbItem } from './breadcrumb.component';
import { BipBreadcrumbSeparatorDirective } from './breadcrumb-separator.directive';

const ITEMS: BipBreadcrumbItem[] = [
  { label: 'Inicio', href: '#' },
  { label: 'Pacientes', href: '#' },
  { label: 'Juan Pérez' },
];

const meta: Meta<BipBreadcrumb> = {
  title: 'Components/Breadcrumb',
  component: BipBreadcrumb,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { items: ITEMS },
};

export default meta;
type Story = StoryObj<BipBreadcrumb>;

export const Basic: Story = {};

export const SingleItem: Story = {
  args: { items: [{ label: 'Inicio' }] },
};

export const CustomSeparator: Story = {
  render: (args) => ({
    props: args,
    moduleMetadata: { imports: [BipBreadcrumbSeparatorDirective] },
    template: `
      <bip-breadcrumb [items]="items">
        <ng-template bipBreadcrumbSeparator>/</ng-template>
      </bip-breadcrumb>
    `,
  }),
};
