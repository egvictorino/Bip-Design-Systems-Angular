import type { Meta, StoryObj } from '@storybook/angular-vite';
import { BipCalendar } from './calendar.component';
import type { BipCalendarEvent, BipCalendarResource } from './calendar.types';

const today = new Date();
const at = (hour: number, minute: number) => new Date(today.getFullYear(), today.getMonth(), today.getDate(), hour, minute);

const EVENTS: BipCalendarEvent[] = [
  { id: '1', title: 'Limpieza dental', start: at(9, 0), end: at(9, 30), status: 'confirmed', patientName: 'Ana Pérez' },
  { id: '2', title: 'Extracción', start: at(11, 0), end: at(12, 0), status: 'cancelled', patientName: 'Luis Ramírez' },
  { id: '3', title: 'Revisión', start: at(15, 0), end: at(15, 30), status: 'pending', patientName: 'Marta Soto' },
  { id: '4', title: 'Ortodoncia', start: at(16, 0), end: at(17, 0), status: 'completed', patientName: 'Carlos Ruiz' },
];

const RESOURCES: BipCalendarResource[] = [
  { id: 'dr1', name: 'Dra. López', color: '#2939cc' },
  { id: 'dr2', name: 'Dr. Martínez', color: '#ae3b9a' },
];

const meta: Meta<BipCalendar> = {
  title: 'Components/Calendar',
  component: BipCalendar,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<BipCalendar>;

export const MonthView: Story = {
  args: { view: 'month', date: today, events: EVENTS },
};

export const WeekView: Story = {
  args: { view: 'week', date: today, events: EVENTS },
};

export const DayView: Story = {
  args: { view: 'day', date: today, events: EVENTS },
};

export const WithResources: Story = {
  args: { view: 'day', date: today, events: EVENTS, resources: RESOURCES },
};

export const AgendaView: Story = {
  args: { view: 'agenda', date: today, events: EVENTS },
};

export const Disabled: Story = {
  args: { view: 'month', date: today, events: EVENTS, disabled: true },
};
