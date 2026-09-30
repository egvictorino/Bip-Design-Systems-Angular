import type { Meta, StoryObj } from '@storybook/angular-vite';
import { BipAvatar } from './avatar.component';
import { BipAvatarGroup } from './avatar-group.component';

const meta: Meta<BipAvatar> = {
  title: 'Components/Avatar',
  component: BipAvatar,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    shape: { control: 'radio', options: ['circle', 'square'] },
    status: { control: 'select', options: [undefined, 'online', 'offline', 'away', 'busy'] },
  },
};

export default meta;
type Story = StoryObj<BipAvatar>;

export const Initials: Story = { args: { name: 'Eduardo Gonzalez', size: 'md' } };
export const Icon: Story = { args: { size: 'md' } };
export const WithStatus: Story = { args: { name: 'Eduardo Gonzalez', status: 'online' } };
export const Square: Story = { args: { name: 'Eduardo Gonzalez', shape: 'square' } };

export const Group: StoryObj = {
  render: () => ({
    moduleMetadata: { imports: [BipAvatarGroup, BipAvatar] },
    template: `
      <bip-avatar-group [max]="4">
        <bip-avatar name="Ana Pérez" />
        <bip-avatar name="Beto Ruiz" />
        <bip-avatar name="Cata Soto" />
        <bip-avatar name="Dani Vega" />
        <bip-avatar name="Eli Marín" />
        <bip-avatar name="Fer Lima" />
      </bip-avatar-group>
    `,
  }),
};
