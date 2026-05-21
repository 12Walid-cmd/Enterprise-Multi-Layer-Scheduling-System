// constraints/holiday.constraint.ts

import { Constraint, LoadedRotation, DailyAssignment, ScheduleContext } from '../../schedule/schedule.types';

export class HolidayConstraint implements Constraint {
  name = 'HolidayConstraint';

  validate(
    userId: string,
    date: Date,
    rotation: LoadedRotation,
    context: ScheduleContext,
    currentAssignments: DailyAssignment[],
  ): boolean {
    const d = date.toDateString();

    // scope-level holiday
    if (context.holidays.some(h => h.toDateString() === d)) {
      return false;
    }

    // user-level holiday
    const userHolidays = context.userHolidayMap.get(userId) ?? [];
    if (userHolidays.some(h => h.toDateString() === d)) {
      return false;
    }

    return true;
  }
}