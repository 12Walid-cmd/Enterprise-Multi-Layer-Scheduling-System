import { Injectable } from '@nestjs/common';

import { CadenceCalculator } from './engine/cadence-calculator';
import { RotationEngine } from './engine/rotation-engine';
import { LeaveBlocker } from './engine/leave-blocker';
import { RulesApplier } from './engine/rules-applier';
import { ConflictChecker } from './engine/conflict-checker';
import { CalendarBuilder } from './calendar/calendar-builder';

@Injectable()
export class ScheduleService {
  constructor(
    private readonly cadence: CadenceCalculator,
    private readonly rotationEngine: RotationEngine,
    private readonly leaveBlocker: LeaveBlocker,
    private readonly rules: RulesApplier,
    private readonly conflicts: ConflictChecker,
    private readonly calendarBuilder: CalendarBuilder,

  ) {}


  async generate(rotationId: string, from: Date, to: Date) {
    const dates = await this.cadence.generate(rotationId, from, to);

    let schedule = await this.rotationEngine.assign(rotationId, dates);

    schedule = await this.leaveBlocker.apply(schedule);

    schedule = await this.rules.apply(schedule);

    const finalSchedule = await this.conflicts.check(schedule);

    return {
      rotationId,
      from,
      to,
      days: finalSchedule,
    };
  }
}