import { Injectable } from '@nestjs/common';
import { ConflictCheckedDay } from '../engine/types';

export interface MonthlyProjection {
  month: string; // YYYY-MM
  totalAssignees: number;
  conflicts: number;
  violations: number;
}

@Injectable()
export class MonthlyProjectionBuilder {
  build(days: ConflictCheckedDay[]): MonthlyProjection[] {
    const months = new Map<string, MonthlyProjection>();

    for (const day of days) {
      const monthKey = `${day.date.getFullYear()}-${String(
        day.date.getMonth() + 1,
      ).padStart(2, '0')}`;

      if (!months.has(monthKey)) {
        months.set(monthKey, {
          month: monthKey,
          totalAssignees: 0,
          conflicts: 0,
          violations: 0,
        });
      }

      const m = months.get(monthKey)!;
      m.totalAssignees += day.assignees.length;
      m.conflicts += day.conflictFlags.length;
      m.violations += day.ruleViolations.length;
    }

    return [...months.values()];
  }
}