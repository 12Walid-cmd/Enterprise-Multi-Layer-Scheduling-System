import { Injectable } from '@nestjs/common';
import { ConflictCheckedDay } from '../engine/types';

export interface DailyProjection {
  date: string;
  totalAssignees: number;
  conflicts: number;
  violations: number;
}

@Injectable()
export class DailyProjectionBuilder {
  build(days: ConflictCheckedDay[]): DailyProjection[] {
    return days.map((day) => ({
      date: day.date.toISOString().split('T')[0],
      totalAssignees: day.assignees.length,
      conflicts: day.conflictFlags.length,
      violations: day.ruleViolations.length,
    }));
  }
}