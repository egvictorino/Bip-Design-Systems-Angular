import type { CalendarEventStatus } from '@bip-design-systems/angular/core';

export interface BipCalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: CalendarEventStatus;
  doctorId?: string;
  patientName?: string;
  treatmentType?: string;
  color?: string;
  notes?: string;
}

export interface BipCalendarResource {
  id: string;
  name: string;
  color: string;
  avatar?: string;
}

export interface BipCalendarSlotInfo {
  start: Date;
  end: Date;
  doctorId?: string;
}

export interface BipCalendarDateRange {
  from: Date | null;
  to: Date | null;
}

export interface BipCalendarEventMove {
  event: BipCalendarEvent;
  start: Date;
  end: Date;
  doctorId?: string;
}

export interface BipCalendarEventResize {
  event: BipCalendarEvent;
  end: Date;
}

export type BipCalendarStep = 15 | 30 | 60;
