// constraints/overlap.constraint.ts

import { Constraint, LoadedRotation, DailyAssignment, ScheduleContext } from '../../schedule/schedule.types';

export class OverlapConstraint implements Constraint {
  name = 'OverlapConstraint';

  validate(
    userId: string,
    date: Date,
    rotation: LoadedRotation,
    context: ScheduleContext,
    currentAssignments: DailyAssignment[],
  ): boolean {
    if (rotation.allowOverlap) return true;

    const d = date.toDateString();

    return !currentAssignments.some(a =>
      a.date.toDateString() === d &&
      a.assigneeRefId === userId &&
      a.rotationId !== rotation.id
    );
  }
}