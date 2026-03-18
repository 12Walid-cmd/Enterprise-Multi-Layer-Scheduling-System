// constraint.pipeline.ts

import { Injectable } from '@nestjs/common';
import { Constraint, LoadedRotation, DailyAssignment, ScheduleContext } from '../schedule/schedule.types';

@Injectable()
export class ConstraintPipeline {
  constructor(
    private readonly constraints: Constraint[],
  ) {}

  /**
   * Check if a user can be assigned on a given date.
   */
  validate(
    userId: string,
    date: Date,
    rotation: LoadedRotation,
    context: ScheduleContext,
    currentAssignments: DailyAssignment[],
  ): boolean {
    for (const c of this.constraints) {
      const ok = c.validate(userId, date, rotation, context, currentAssignments);
      if (!ok) return false;
    }
    return true;
  }
}