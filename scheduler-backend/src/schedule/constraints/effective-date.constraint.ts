// constraints/effective-date.constraint.ts

import { Constraint, LoadedRotation, DailyAssignment, ScheduleContext } from '../../schedule/schedule.types';

export class EffectiveDateConstraint implements Constraint {
  name = 'EffectiveDateConstraint';

  validate(
    userId: string,
    date: Date,
    rotation: LoadedRotation,
    context: ScheduleContext,
    currentAssignments: DailyAssignment[],
  ): boolean {
    return date >= rotation.effectiveDate;
  }
}