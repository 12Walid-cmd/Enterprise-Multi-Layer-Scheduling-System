// constraint.pipeline.ts

import { Inject, Injectable } from '@nestjs/common';
import { Constraint, LoadedRotation, DailyAssignment, ScheduleContext, CONSTRAINTS } from '../schedule/schedule.types';

@Injectable()
export class ConstraintPipeline {
  constructor(
    @Inject(CONSTRAINTS) private readonly constraints: Constraint[],
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