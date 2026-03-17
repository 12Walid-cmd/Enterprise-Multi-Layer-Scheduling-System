import { Injectable } from '@nestjs/common';
import { ConflictCheckedDay } from '../engine/conflict-checker';

export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO string
  end: string;   // ISO string
  rotationId: string;
  assignees: string[];
  conflictFlags: string[];
  ruleViolations: string[];
}

@Injectable()
export class CalendarBuilder {

  build(days: ConflictCheckedDay[]): CalendarEvent[] {
    return days.map((day, index) => {
      const start = new Date(
        Date.UTC(
          day.date.getFullYear(),
          day.date.getMonth(),
          day.date.getDate(),
          0,
          0,
          0,
          0,
        ),
      );

      const end = new Date(
        Date.UTC(
          day.date.getFullYear(),
          day.date.getMonth(),
          day.date.getDate() + 1,
          0,
          0,
          0,
          0,
        ),
      );

      const hasConflicts =
        day.conflictFlags.length > 0 || day.conflicts.length > 0;

      const titleBase =
        day.assignees.length > 0
          ? day.assignees.join(', ')
          : 'Unassigned';

      const title = hasConflicts
        ? `${titleBase} ⚠`
        : titleBase;

      return {
        id: `${day.rotationId}-${index}-${start.toISOString()}`,
        title,
        start: start.toISOString(),
        end: end.toISOString(),
        rotationId: day.rotationId,
        assignees: day.assignees,
        conflictFlags: [...day.conflictFlags, ...day.conflicts],
        ruleViolations: day.ruleViolations,
      };
    });
  }
}