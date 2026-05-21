// constraints/role-conflict.constraint.ts

import { Constraint, LoadedRotation, DailyAssignment, ScheduleContext } from '../../schedule/schedule.types';

export class RoleConflictConstraint implements Constraint {
  name = 'RoleConflictConstraint';

  validate(
    userId: string,
    date: Date,
    rotation: LoadedRotation,
    context: ScheduleContext,
    currentAssignments: DailyAssignment[],
  ): boolean {
    const d = date.toDateString();

    return !currentAssignments.some(a =>
      a.date.toDateString() === d &&
      a.assigneeRefId === userId &&
      a.rotationId !== rotation.id &&
      a.tierLevel === 1 // primary conflict
    );
  }
}