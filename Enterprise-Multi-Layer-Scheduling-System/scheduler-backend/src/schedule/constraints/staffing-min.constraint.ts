// constraints/staffing-min.constraint.ts

import { Constraint, LoadedRotation, DailyAssignment, ScheduleContext } from '../../schedule/schedule.types';

export class StaffingMinimumConstraint implements Constraint {
  name = 'StaffingMinimumConstraint';

  validate(
    userId: string,
    date: Date,
    rotation: LoadedRotation,
    context: ScheduleContext,
    currentAssignments: DailyAssignment[],
  ): boolean {
    const d = date.toDateString();

    const assigned = currentAssignments.filter(a =>
      a.date.toDateString() === d &&
      a.rotationId === rotation.id
    );

    return assigned.length < rotation.maxAssignees;
  }
}