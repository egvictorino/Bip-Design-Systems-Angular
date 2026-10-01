import type { Meta, StoryObj } from '@storybook/angular-vite';
import { BipOdontogram } from './odontogram.component';
import type { OdontogramValue } from './odontogram.types';

const SAMPLE_VALUE: OdontogramValue = {
  11: { surfaces: { occlusal: 'caries' } },
  16: { condition: 'crown' },
  18: { condition: 'missing' },
  21: { surfaces: { mesial: 'restoration', distal: 'restoration' } },
  36: { condition: 'implant' },
  46: { surfaces: { occlusal: 'root_canal' }, notes: 'Endodoncia reciente, revisar en 6 meses' },
};

const meta: Meta<BipOdontogram> = {
  title: 'Components/Odontogram',
  component: BipOdontogram,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
    dentition: { control: 'radio', options: ['permanent', 'primary'] },
  },
};

export default meta;
type Story = StoryObj<BipOdontogram>;

export const Default: Story = {
  args: { label: 'Odontograma del paciente' },
};

export const WithData: Story = {
  args: { label: 'Odontograma del paciente', value: SAMPLE_VALUE },
};

export const ReadOnly: Story = {
  args: { label: 'Odontograma del paciente', value: SAMPLE_VALUE, disabled: true },
};

export const PrimaryDentition: Story = {
  args: { label: 'Odontograma infantil', dentition: 'primary' },
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <bip-odontogram size="sm" label="Pequeño" />
        <bip-odontogram size="md" label="Mediano (default)" />
        <bip-odontogram size="lg" label="Grande" />
      </div>
    `,
  }),
};
