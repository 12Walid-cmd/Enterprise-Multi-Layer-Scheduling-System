import { Injectable } from '@nestjs/common';
import { ConflictCheckedDay } from '../engine/types';

export interface WeeklyProjection {
  weekStart: string;
  weekEnd: string;
  totalAssignees: number;
  conflicts: number;
  violations: number;
}

@Injectable()
export class WeeklyProjectionBuilder {
  build(days: ConflictCheckedDay[]): WeeklyProjection[] {
    const sorted = [...days].sort((a, b) => a.date.getTime() - b.date.getTime());

    const weeks = new Map<string, WeeklyProjection>();

    for (const day of sorted) {
      const date = day.date;
      const weekStart = this.getWeekStart(date);
      const weekEnd = this.getWeekEnd(date);

      const key = weekStart.toISOString().split('T')[0];

      if (!weeks.has(key)) {
        weeks.set(key, {
          weekStart: key,
          weekEnd: weekEnd.toISOString().split('T')[0],
          totalAssignees: 0,
          conflicts: 0,
          violations: 0,
        });
      }

      const w = weeks.get(key)!;
      w.totalAssignees += day.assignees.length;
      w.conflicts += day.conflictFlags.length;
      w.violations += day.ruleViolations.length;
    }

    return [...weeks.values()];
  }

  private getWeekStart(date: Date): Date {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const day = d.getUTCDay(); // 0 = Sunday
    const diff = day === 0 ? -6 : 1 - day; // Monday as week start
    d.setUTCDate(d.getUTCDate() + diff);
    return d;
  }

  private getWeekEnd(date: Date): Date {
    const start = this.getWeekStart(date);
    const end = new Date(start);
    end.setUTCDate(start.getUTCDate() + 6);
    return end;
  }
}