// constraints/domain-min.constraint.ts

import { Constraint, LoadedRotation, DailyAssignment, ScheduleContext } from '../../schedule/schedule.types';
import { RotationScope } from '@prisma/client';

export class DomainMinimumConstraint implements Constraint {
  name = 'DomainMinimumConstraint';

  validate(
    userId: string,
    date: Date,
    rotation: LoadedRotation,
    context: ScheduleContext,
    currentAssignments: DailyAssignment[],
  ): boolean {
    if (rotation.scopeType !== RotationScope.DOMAIN) return true;

    const d = date.toDateString();

    const assigned = currentAssignments.filter(a =>
      a.date.toDateString() === d &&
      a.rotationId === rotation.id
    );

    return assigned.length < rotation.maxAssignees;
  }
}