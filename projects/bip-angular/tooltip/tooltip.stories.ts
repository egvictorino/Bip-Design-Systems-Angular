import type { Meta, StoryObj } from '@storybook/angular-vite';
import { BipTooltip } from './tooltip.directive';

interface TooltipDemoArgs {
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  align: 'start' | 'center' | 'end';
  variant: 'default' | 'light' | 'info' | 'success' | 'warning' | 'error';
  delay: number;
}

const meta: Meta<TooltipDemoArgs> = {
  title: 'Components/Tooltip',
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    position: { control: 'select', options: ['top', 'bottom', 'left', 'right'] },
    align: { control: 'select', options: ['start', 'center', 'end'] },
    variant: {
      control: 'select',
      options: ['default', 'light', 'info', 'success', 'warning', 'error'],
    },
  },
  args: {
    content: 'Información adicional',
    position: 'top',
    align: 'center',
    variant: 'default',
    delay: 0,
  },
  render: (args) => ({
    props: args,
    moduleMetadata: { imports: [BipTooltip] },
    template: `
      <button
        type="button"
        style="padding: 8px 16px"
        [bipTooltip]="content"
        [bipTooltipPosition]="position"
        [bipTooltipAlign]="align"
        [bipTooltipVariant]="variant"
        [bipTooltipDelay]="delay"
      >
        Pasa el mouse o enfoca con Tab
      </button>
    `,
  }),
};

export default meta;
type Story = StoryObj<TooltipDemoArgs>;

export const Basic: Story = {};
export const Bottom: Story = { args: { position: 'bottom' } };
export const Left: Story = { args: { position: 'left' } };
export const Right: Story = { args: { position: 'right' } };
export const Light: Story = { args: { variant: 'light' } };
export const Warning: Story = { args: { variant: 'warning' } };
export const WithDelay: Story = { args: { delay: 500 } };
