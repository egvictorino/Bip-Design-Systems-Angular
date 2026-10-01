import type { Meta, StoryObj } from '@storybook/angular-vite';
import { BipTimePicker } from './time-picker.component';

const meta: Meta<BipTimePicker> = {
  title: 'Components/TimePicker',
  component: BipTimePicker,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
    step: { control: 'select', options: [5, 10, 15, 30] },
    hourCycle: { control: 'radio', options: ['12', '24'] },
    inputMode: { control: 'radio', options: ['picker', 'text'] },
  },
};

export default meta;
type Story = StoryObj<BipTimePicker>;

export const Default: Story = {
  args: { label: 'Hora de la cita', placeholder: 'Selecciona una hora' },
};

export const WithValue: Story = {
  args: { ...Default.args, value: '09:30' },
};

export const HourCycle12: Story = {
  args: { ...Default.args, value: '14:30', hourCycle: '12' },
};

export const TextMode: Story = {
  args: { ...Default.args, inputMode: 'text' },
};

export const WithMinMax: Story = {
  args: { ...Default.args, minTime: '08:00', maxTime: '18:00' },
};

export const WithHelperText: Story = {
  args: { ...Default.args, helperText: 'Horario de atención 8am–6pm' },
};

export const WithError: Story = {
  args: { ...Default.args, error: true, errorMessage: 'Debes seleccionar una hora' },
};

export const FullWidth: Story = {
  args: { ...Default.args, fullWidth: true },
};
