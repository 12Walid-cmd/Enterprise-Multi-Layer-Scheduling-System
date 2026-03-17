import { ConflictCheckedDay } from '../engine/conflict-checker';
import { CalendarEvent } from '../calendar/calendar-builder';
import { TimelineItem } from '../timeline/timeline-builder';

export class ScheduleResponseDto {
  rotationId: string;
  from: string;
  to: string;
  days: ConflictCheckedDay[];
  calendar: CalendarEvent[];
  timeline: TimelineItem[];
}