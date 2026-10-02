import type { Meta, StoryObj } from '@storybook/angular-vite';
import { BipFileUpload } from './file-upload.component';

const meta: Meta<BipFileUpload> = {
  title: 'Components/FileUpload',
  component: BipFileUpload,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
    variant: { control: 'radio', options: ['default', 'compact'] },
  },
};

export default meta;
type Story = StoryObj<BipFileUpload>;

export const Default: Story = { args: { label: 'Documentos' } };
export const Multiple: Story = { args: { ...Default.args, multiple: true } };
export const WithConstraints: Story = {
  args: { ...Default.args, multiple: true, maxFiles: 3, maxSize: 5 * 1024 * 1024, accept: 'image/*,.pdf' },
};
export const Compact: Story = { args: { ...Default.args, variant: 'compact' } };
export const Loading: Story = { args: { ...Default.args, loading: true } };
export const WithError: Story = {
  args: { ...Default.args, error: true, errorMessage: 'Debes adjuntar al menos un archivo' },
};
