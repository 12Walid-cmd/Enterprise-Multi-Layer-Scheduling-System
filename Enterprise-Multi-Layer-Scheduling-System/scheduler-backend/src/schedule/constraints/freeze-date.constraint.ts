// constraints/freeze-date.constraint.ts

import { Constraint, LoadedRotation, DailyAssignment, ScheduleContext } from '../../schedule/schedule.types';

export class FreezeDateConstraint implements Constraint {
  name = 'FreezeDateConstraint';

  validate(
    userId: string,
    date: Date,
    rotation: LoadedRotation,
    context: ScheduleContext,
    currentAssignments: DailyAssignment[],
  ): boolean {
    if (!rotation.freezeDate) return true;
    return date < rotation.freezeDate;
  }
}