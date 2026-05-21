// constraints/leave.constraint.ts

import { Constraint, LoadedRotation, DailyAssignment, ScheduleContext } from '../../schedule/schedule.types';

export class LeaveConstraint implements Constraint {
  name = 'LeaveConstraint';

  validate(
    userId: string,
    date: Date,
    rotation: LoadedRotation,
    context: ScheduleContext,
    currentAssignments: DailyAssignment[],
  ): boolean {
    const leaveDates = context.leaveByUserId.get(userId);
    if (!leaveDates) return true;

    return !leaveDates.some(d => d.toDateString() === date.toDateString());
  }
}